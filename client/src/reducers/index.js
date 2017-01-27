import { combineReducers } from 'redux';

import { clusters, instances, securityGroups, tasksMap, deepTasks } from './serverData';
import { error } from './error'

export default combineReducers({
  error,
  instances, 
  clusters, 
  securityGroups, 
  // tasksMap,
  deepTasks
});

