import { combineReducers } from 'redux';

import { clusters, instances, securityGroups, tasksMap, deepTasks } from './serverData';

export default combineReducers({
  instances, 
  clusters, 
  securityGroups, 
  // tasksMap,
  deepTasks
});

