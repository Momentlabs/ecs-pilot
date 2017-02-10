import { createAction } from 'redux-actions'
import { createActionUUID } from './makeActions';
import * as types from './types';

//
// Cluster
export const requestClusters = createAction(types.REQUEST_CLUSTERS);
export const loadedClusters = createAction(types.LOADED_CLUSTERS, clusters => clusters);

export const selectCluster = createAction(types.SELECT_CLUSTER, clusterName => clusterName);
export const deselectCluster = createAction(types.DESELECT_CLUSTER, clusterName => clusterName);
export const requestAll = createAction(types.REQUEST_ALL, selectedClusters => selectedClusters);
//
// DeepTask

// usage: requestDeepTasks("myclusterName") or requestDeepTasks(error);
export const requestDeepTasks = createAction(types.REQUEST_DEEP_TASKS, 
  (clusterName) => clusterName
);
export const loadedDeepTasks = createAction(types.LOADED_DEEP_TASKS,
  (clusterName, deepTasks) => {return {clusterName: clusterName, deepTasks: deepTasks}}
);

//
// Instance
export const requestInstances = createAction(types.REQUEST_INSTANCES, clusterName => clusterName);
export const loadedInstances = createAction(types.LOADED_INSTANCES, 
  (clusterName, instances) => {return {clusterName: clusterName, instances: instances}});

// SecurityGroups
export const requestSecurityGroups = createAction(types.REQUEST_SECURITY_GROUPS, (groupIds) => groupIds);
export const loadedSecurityGroups = createAction(types.LOADED_SECURITY_GROUPS,  (securityGroups) => securityGroups);

//
// Load
export const startLoading = createActionUUID(types.LOADING_STARTED,
  (what) => {return {what: what, when: Date.now()};}
);
export const completeLoading = createAction(types.LOADING_COMPLETE, (id) => id);