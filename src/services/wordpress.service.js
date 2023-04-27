import axios from 'axios';

const assignmentSubmit = (assignmentId, userId, ltiUserId, submissionId, ltiEndpoint) => {
  console.log('assignmentId >>>-- ', assignmentId);
  console.log('userId >>>-- ', userId);
  console.log('ltiUserId >>>-- ', ltiUserId);
  console.log('submissionId >>>-- ', submissionId);
  console.log('ltiEndpoint >>>-- ', ltiEndpoint);
  console.log('axios >>>-- ', axios);

  axios({
    method: 'get',
    url: ltiEndpoint,
  }).then((response) => {
    const { data: { routes } } = response;
    const assignmentSubmissionEndpoint = routes['/lms/v1/assignment/submission']._links.self[0].href;
    axios({
      method: 'get',
      url: assignmentSubmissionEndpoint,
    }).then((submissionResponse) => {
      console.log('submissionResponse >>>>> ', submissionResponse);
    });
  });
};

export default { assignmentSubmit };
/*
const assignmentSubmit = (session, gpb, score) => axios({
  method: 'post',
  url: tsugiBaseUrl,
  params: { PHPSESSID: session, gpb, final_grade: score },
})
  .then((response) => response);
 */
