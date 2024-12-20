/* eslint-disable */
import React, { useEffect, useRef, useReducer } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import gifloader from 'assets/images/dotsloader.gif';
import * as xAPIHelper from 'helpers/xapi';
import { loadH5pResourceXapi } from 'store/actions/resource';
import { loadH5pResourceSettings } from 'store/actions/gapi';
import { gradePassBackAction, activityInitAction, passLtiCourseDetails } from 'store/actions/canvas';
import { assignmentSubmitAction, setAssignmentAttemptAction, setAssignmentGradeAction } from 'store/actions/wordpress';
import { saveResultScreenshotAction } from 'store/actions/safelearn';
import './style.scss';
import jwt_decode from "jwt-decode";

const reducer = (activityState, action) => {
  switch (action.type) {
    case 'SET_INTERVAL':
      return {
        ...activityState,
        intervalId: action.intervalId,
      };

    case 'ASSETS_LOADED':
      return {
        ...activityState,
        assetsLoaded: [...activityState.assetsLoaded, action.asset],
      };

    case 'CHECK_ASSETS':
      console.log('checking assets');
      if (typeof window.H5P === 'undefined' || !window.H5P.externalDispatcher) {
        console.log('H5P is not ready yet...');
        return activityState;
      }

      if (activityState.assets.length !== activityState.assetsLoaded.length) {
        console.log(`Assets not ready. ${activityState.assetsLoaded.length} of ${activityState.assets.length} loaded`);
        return activityState;
      }

      clearInterval(activityState.intervalId);
      return {
        ...activityState,
        h5pObject: window.H5P,
        intervalId: null,
      };

    case 'SET_ASSETS':
      return {
        ...activityState,
        assets: action.assets,
      };

    default:
      return activityState;
  }
};

const Activity = (props) => {
  const { match, h5pSettings, ltiFinished, attemptId, loadH5pSettings, passCourseDetails, sendStatement, gradePassBack, activityInit, sendScreenshot, assignmentSubmit, assignmentAttempted, gradeAssignment } = props;
  const { activityId } = match.params;
  const searchParams = new URLSearchParams(window.location.search);
  const session = searchParams.get('PHPSESSID');
  const studentId = searchParams.get('user_id');
  const submissionId = searchParams.get('submission_id');
  const homepage = searchParams.get('homepage');
  const isLearner = searchParams.get('is_learner') !== '';
  const courseId = searchParams.get('course_id');
  const toolPlatform = searchParams.get('tool_platform');
  const customCourseName = searchParams.get('custom_course_name');
  const customApiDomainUrl = searchParams.get('custom_api_domain_url');
  const customCourseCode = searchParams.get('custom_course_code');
  const issuerClient = searchParams.get('issuer_client');
  const customPersonNameGiven = searchParams.get('custom_person_name_given');
  const customPersonNameFamily = searchParams.get('custom_person_name_family');
  const currikiH5PWrapper = useRef(null);

  /* eslint-disable-next-line no-unused-vars */
  const [activityState, dispatch] = useReducer(reducer, {
    intervalId: null,
    assets: [],
    assetsLoaded: [],
    h5pObject: null,
  });

  const loadAssets = (styles, scripts) => {
    styles.forEach((style) => {
      const link = document.createElement('link');
      link.href = style;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    });
    scripts.forEach((script) => {
      const element = document.createElement('script');
      element.onload = () => {
        dispatch({ type: 'ASSETS_LOADED', asset: element.src });
        console.log(`Assets loaded: ${element.src}`);
      };
      element.src = script;
      element.async = false;
      document.body.appendChild(element);
    });
  };

  // Init
  useEffect(() => {
    window.scrollTo(0, 0);
    loadH5pSettings(match.params.activityId, studentId, submissionId);
    passCourseDetails({
      courseId,
      issuerClient,
      customApiDomainUrl,
      studentId,
      customPersonNameGiven,
      customPersonNameFamily,
      isLearner,
    });
    activityInit();
  }, [activityId]);

  // Load H5P
  useEffect(() => {
    if (h5pSettings === null) return;

    window.H5P = window.H5P || {};
    window.H5P.preventInit = true;
    window.H5PIntegration = h5pSettings.h5p.settings;

    const urlSearchParamsData = new URLSearchParams(window.location.search);
    const urlParamsData = Object.fromEntries(urlSearchParamsData.entries());
    const ltiTokenData = jwt_decode(urlParamsData.id_token);
    const ltiCustomData = ltiTokenData["https://purl.imsglobal.org/spec/lti/claim/custom"];
    if (ltiCustomData.hasOwnProperty('skipSave')) {
      if (ltiCustomData.skipSave == 1) {
        window.H5PIntegration.ajax.contentUserData += '&skipSave=1';
      }
    }

    const h5pWrapper = document.getElementById('curriki-h5p-wrapper');
    h5pWrapper.innerHTML = h5pSettings.h5p.embed_code.trim();

    // Load H5P assets
    const styles = h5pSettings.h5p.settings.core.styles.concat(h5pSettings.h5p.settings.loadedCss);
    const scripts = h5pSettings.h5p.settings.core.scripts.concat(h5pSettings.h5p.settings.loadedJs);
    dispatch({ type: 'SET_ASSETS', assets: scripts });
    loadAssets(styles, scripts);

    // Loops until H5P object and dispatcher are ready
    const intervalId = setInterval(() => {
      dispatch({ type: 'CHECK_ASSETS' });
    }, 500);
    dispatch({ type: 'SET_INTERVAL', intervalId });
  }, [h5pSettings]);

  // Patch into xAPI events
  useEffect(() => {
    if (!activityState.h5pObject) {
      console.log('H5P object not ready');
      return;
    }
    // Hook into H5P dispatcher only if xAPI is needed for this route
    if (xAPIHelper.isxAPINeeded(match.path) === true) {
      activityState.h5pObject.externalDispatcher.on('xAPI', function (event) {
        console.log('Running xAPI listener callback');
        if (event.ignoreStatement) {
          return;
        }
        const params = {
          path: match.path,
          studentId,
          activityId,
          submissionId,
          attemptId,
          homepage,
          courseId,
          toolPlatform,
          customCourseName,
          customApiDomainUrl,
          customCourseCode,
        };

        // Extending the xAPI statement with our custom values and sending it off to LRS
        const xapiData = xAPIHelper.extendStatement(this, event.data.statement, params);

        const urlSearchParamsData = new URLSearchParams(window.location.search);
        const urlParamsData = Object.fromEntries(urlSearchParamsData.entries());
        const ltiTokenData = jwt_decode(urlParamsData.id_token);
        const ltiCustomData = ltiTokenData["https://purl.imsglobal.org/spec/lti/claim/custom"];

        if (event.data.statement.verb.display['en-US'] === 'answered' && ltiCustomData.hasOwnProperty('platform') && ltiCustomData.platform === 'wordpress' && ltiCustomData.hasOwnProperty('assignment_id')) {
          const ltiEndpointUrl = ltiTokenData['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']['lineitem'];
          gradeAssignment(ltiEndpointUrl, { 'slide': event.data.statement.context.extensions["http://id.tincanapi.com/extension/ending-point"], result: event.data.statement.result, assignment_id: ltiCustomData.assignment_id, student_user_id: ltiCustomData.login_id, xapiData });
        }

        if (event.data.statement.verb.display['en-US'] === 'attempted' && ltiCustomData.hasOwnProperty('platform') && ltiCustomData.platform === 'wordpress' && ltiCustomData.hasOwnProperty('assignment_id')) {
          const assignmentId = ltiCustomData.assignment_id;
          const userId = ltiCustomData.login_id;
          const ltiEndpointUrl = ltiTokenData['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']['lineitem'];
          assignmentAttempted(assignmentId, userId, ltiEndpointUrl);
        }

        if (event.data.statement.verb.display['en-US'] === 'submitted-curriki') {
          // Check if all questions/interactions have been accounted for in LRS
          // If the user skips one of the questions, no xAPI statement is generated.
          // We need statements for all questions for proper summary accounting.
          // Fire off an artificial "answered" statement if necessary
          if (this.parent === undefined && this.interactions) {
            this.interactions.forEach((interaction) => {
              if (interaction.getLastXAPIVerb()) return; // Already initialized

              const xAPIData = interaction.getXAPIData();
              if (!xAPIData) return; // Some interactions have no data to report

              const iXAPIStatement = JSON.stringify(xAPIHelper.extendStatement(this, xAPIData.statement, params, true));
              sendStatement(iXAPIStatement);
            }, this);
          }

          sendStatement(JSON.stringify(xapiData));
          Swal.fire({
            title: 'Turn in results?',
            confirmButtonText: 'OK',
          }).then(() => {
            const score = xapiData.result.score.scaled;
            gradePassBack(session, 1, score);

            const urlSearchParams = new URLSearchParams(window.location.search);
            const urlParams = Object.fromEntries(urlSearchParams.entries());
            const tokenData = jwt_decode(urlParams.id_token);
            const ltiCustom = tokenData["https://purl.imsglobal.org/spec/lti/claim/custom"];

            if (ltiCustom.hasOwnProperty('assignment_id') && ltiCustomData.hasOwnProperty('platform') && ltiCustomData.platform === 'wordpress') {
              const assignmentId = ltiCustom.assignment_id;
              const userId = ltiCustom.login_id;
              const ltiUserId = urlParams.user_id;
              const submissionId = urlParams.submission_id;
              const ltiEndpoint = tokenData['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']['lineitem'];
              assignmentSubmit(assignmentId, userId, ltiUserId, submissionId, ltiEndpoint, xapiData.result);
            } else {
              // Swal.fire('Assignment not submitted', '', 'error');
            }
            Swal.fire('Saved!', '', 'success');
          });
        } else {
          const jsonStatement = JSON.stringify(xapiData);
          sendStatement(jsonStatement);
          if (h5pSettings?.organization?.api_key) {
            sendScreenshot(h5pSettings.organization, jsonStatement, h5pSettings.activity.title, params.studentId);
          }
        }
      });
    }

    activityState.h5pObject.init();
  }, [activityState.h5pObject]);

  useEffect(() => {
    const h5pLibData = activityState.h5pObject && window.H5PIntegration ? Object.values(window.H5PIntegration.contents) : null;
    const h5pLib = Array.isArray(h5pLibData) && h5pLibData.length > 0 ? h5pLibData[0].library.split(' ')[0] : null;
    const resizeFor = ['H5P.InteractiveVideo', 'H5P.CurrikiInteractiveVideo', 'H5P.BrightcoveInteractiveVideo'];
    const isActvityResizeable = resizeFor.find((lib) => lib === h5pLib) ? true : false;

    if (currikiH5PWrapper && currikiH5PWrapper.current && isActvityResizeable) {
      const aspectRatio = 1.778; // standard aspect ratio of video width and height
      const currentHeight = currikiH5PWrapper.current.offsetHeight - 65; // current height with some margin
      const adjustedWidthVal = currentHeight * aspectRatio;
      const parentWidth = currikiH5PWrapper.current.parentElement.offsetWidth;
      if (adjustedWidthVal < parentWidth) {
        currikiH5PWrapper.current.style.width = `${adjustedWidthVal}px`; // eslint-disable-line no-param-reassign
      } else {
        currikiH5PWrapper.current.style.width = `${parentWidth - 10}px`; // eslint-disable-line no-param-reassign
      }
    }

    window.addEventListener('message', function (event) {
      if (window !== window.top) {
        window.parent.postMessage({ ...event.data }, "*");
      }
    });
  }, [currikiH5PWrapper, activityState.h5pObject]);


  useEffect(() => {
    if (document.getElementsByClassName('h5p-iframe').length > 0) {
      let h5pActivityTimeInterval = setInterval(function () {
        if (document.getElementsByClassName('h5p-iframe')[0].contentWindow.hasOwnProperty('H5P')) {
          clearInterval(h5pActivityTimeInterval);
          let h5pActivity = document.getElementsByClassName('h5p-iframe')[0].contentWindow.H5P.instances[0];
          if (h5pActivity && h5pActivity.hasOwnProperty('currentSlideIndex')) {
            let currentSlide = parseInt(h5pActivity.currentSlideIndex) + 1;
            window.parent.postMessage({ currentSlide }, "*");
          }
        }
      }, 2000);
    }
  }, [document.getElementsByClassName('h5p-iframe').length])

  return (
    <div>
      {ltiFinished && (
        <div className="p-5 text-center finished-div">
          <h1>You have completed this activity!</h1>
          <FontAwesomeIcon icon="thumbs-o-up" className="action-icon ml-1" />
        </div>
      )}

      {!ltiFinished && (
        <div className="curriki-activity-lti-share">
          <div
            id="curriki-h5p-wrapper"
            ref={(el) => {
              if (el) {
                currikiH5PWrapper.current = el;
              }
            }}
          >
            <Alert variant="primary">Loading Activity</Alert>
          </div>
        </div>
      )}
    </div>
  );
};

Activity.defaultProps = {
  h5pSettings: null,
  attemptId: null,
};

Activity.propTypes = {
  match: PropTypes.object.isRequired,
  h5pSettings: PropTypes.object,
  ltiFinished: PropTypes.bool.isRequired,
  attemptId: PropTypes.number,
  loadH5pSettings: PropTypes.func.isRequired,
  passCourseDetails: PropTypes.func.isRequired,
  sendStatement: PropTypes.func.isRequired,
  gradePassBack: PropTypes.func.isRequired,
  assignmentSubmit: PropTypes.func.isRequired,
  assignmentAttempted: PropTypes.func.isRequired,
  gradeAssignment: PropTypes.func.isRequired,
  activityInit: PropTypes.func.isRequired,
  sendScreenshot: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  h5pSettings: state.gapi.h5pSettings,
  ltiFinished: state.canvas.ltiFinished,
  attemptId: state.canvas.attemptId,
});

const mapDispatchToProps = (dispatch) => ({
  loadH5pSettings: (activityId, studentId, submissionId) => dispatch(loadH5pResourceSettings(activityId, studentId, submissionId)),
  passCourseDetails: (params) => dispatch(passLtiCourseDetails(params)),
  sendStatement: (statement) => dispatch(loadH5pResourceXapi(statement)),
  gradePassBack: (session, gpb, score, isLearner) => dispatch(gradePassBackAction(session, gpb, score)),
  assignmentSubmit: (assignmentId, userId, ltiUserId, submissionId, ltiEndpoint, result) => dispatch(assignmentSubmitAction(assignmentId, userId, ltiUserId, submissionId, ltiEndpoint, result)),
  assignmentAttempted: (assignmentId, userId, ltiEndpoint) => dispatch(setAssignmentAttemptAction(assignmentId, userId, ltiEndpoint)),
  gradeAssignment: (endpoint, data) => dispatch(setAssignmentGradeAction(endpoint, data)),
  activityInit: () => dispatch(activityInitAction()),
  sendScreenshot: (org, statement, title, studentName) => dispatch(saveResultScreenshotAction(org, statement, title, studentName)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Activity));
