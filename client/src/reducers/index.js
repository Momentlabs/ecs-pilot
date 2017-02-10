import { combineReducers } from 'redux';

import { clusters, instances, securityGroups, deepTasks, loading, selectedClusters } from './serverData';
import { error } from './error'

export default combineReducers({
  error,
  loading,
  selectedClusters,
  clusters,
  instances, 
  securityGroups, 
  deepTasks
});

