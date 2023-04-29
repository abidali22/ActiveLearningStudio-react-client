import wordpressService from 'services/wordpress.service';
import { ASSIGNMENT_SUBMIT, ASSIGNMENT_ATTEMPTED } from '../actionTypes';

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
