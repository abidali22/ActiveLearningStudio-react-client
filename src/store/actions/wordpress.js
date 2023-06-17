import wordpressService from 'services/wordpress.service';
import { ASSIGNMENT_SUBMIT, ASSIGNMENT_ATTEMPTED, GRADE_ASSIGNMENT } from '../actionTypes';

export const assignmentSubmitAction = (assignmentId, userId, ltiUserId, submissionId, ltiEndpoint, result) => async (dispatch) => {
  dispatch({
    type: ASSIGNMENT_SUBMIT,
  });
  await wordpressService.assignmentSubmit(assignmentId, userId, ltiUserId, submissionId, ltiEndpoint, result);
};

export const setAssignmentAttemptAction = (assignmentId, userId, ltiEndpoint) => async (dispatch) => {
  dispatch({
    type: ASSIGNMENT_ATTEMPTED,
  });
  await wordpressService.assignmentAttempted(assignmentId, userId, ltiEndpoint);
};

export const setAssignmentGradeAction = (endpoint, data) => async (dispatch) => {
  dispatch({
    type: GRADE_ASSIGNMENT,
  });
  await wordpressService.gradeAssignment(endpoint, data);
};
