import wordpressService from 'services/wordpress.service';
import { ASSIGNMENT_SUBMIT } from '../actionTypes';

export const assignmentSubmitAction = (assignmentId, userId, ltiUserId, submissionId, ltiEndpoint, result) => async (dispatch) => {
  dispatch({
    type: ASSIGNMENT_SUBMIT,
  });
  await wordpressService.assignmentSubmit(assignmentId, userId, ltiUserId, submissionId, ltiEndpoint, result);
};

export const fetchAssignmentEndpoint = () => async (dispatch) => {
  console.log(dispatch);
};
