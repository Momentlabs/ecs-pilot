import { combineReducers } from 'redux';

import { auth } from './auth';
import { clusters, instances, securityGroups, deepTasks, loading, selectedClusters } from './serverData';
import { error } from './error'

export default combineReducers({
  auth,
  error,
  loading,
  selectedClusters,
  clusters,
  instances, 
  securityGroups, 
  deepTasks
});

