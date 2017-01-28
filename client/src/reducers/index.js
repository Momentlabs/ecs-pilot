import { combineReducers } from 'redux';

import { clusters, instances, securityGroups, deepTasks, loading } from './serverData';
import { error } from './error'

export default combineReducers({
  error,
  loading,
  instances, 
  clusters, 
  securityGroups, 
  deepTasks
});

