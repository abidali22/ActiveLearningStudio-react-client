import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import auth from './auth';
import playlist from './playlist';
import resource from './resource';
import project from './project';
import ui from './ui';

export default combineReducers({
  auth,
  project,
  playlist,
  resource,
  ui,
  form: formReducer,
});
