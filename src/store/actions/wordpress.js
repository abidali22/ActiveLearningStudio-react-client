import wordpressService from 'services/wordpress.service';

export const assignmentSubmitAction = (assignmentId, userId, ltiUserId, submissionId, ltiEndpoint) => async (dispatch) => {
  wordpressService.assignmentSubmit(assignmentId, userId, ltiUserId, submissionId, ltiEndpoint);
  console.log('dispatch >>>** ', dispatch);
  /*
  dispatch({
    type: GRADE_PASS_BACK,
  });
  await canvasService.tsugiGradePassback(session, gpb, score);
   */
};

export const fetchAssignmentEndpoint = () => async (dispatch) => {
  console.log('dispatch >>>** ', dispatch);
  /*
  dispatch({
    type: GRADE_PASS_BACK,
  });
  await canvasService.tsugiGradePassback(session, gpb, score);
   */
};
