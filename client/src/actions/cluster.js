import { createAction } from 'redux-actions'
import * as types from './types';


export const requestClusters = createAction(types.REQUEST_CLUSTERS);
export const loadedClusters = createAction(types.LOADED_CLUSTERS, clusters => clusters);

// export const requestClusters = () => {
//   return {type: types.REQUEST_CLUSTERS}
// };

// export const requestClustersSuccess = (clusters) => {
//   const action = {type: types.REQUEST_CLUSTERS_SUCCESS, clusters: clusters};
//   console.log("action: ", action);
//   return action;
// };

// export const requestClustersFailure = (type, error) => {
//   return {type: types.REQUEST_CLUSTERS_FAILURE, error};
// };

export const selectCluster = (clusterName) => {
  const action = {type: types.SELECT_CLUSTER, clusterName: clusterName};
  console.log("action:", action);
  return action;
}


// import { createAction } from 'redux-actions';
// import * as types from './types';

// // usage: requestDeepTasks("myclusterName") or requestDeepTasks(error);
// export const requestDeepTasks = createAction(types.REQUEST_DEEP_TASKS, 
//   (clusterName) => clusterName
// );

// export const loadedDeepTasks = createAction(types.LOADED_DEEP_TASKS,
//   (clusterName, deepTasks) => {return {clusterName: clusterName, deepTasks: deepTasks}}
// );
