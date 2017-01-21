import * as types from './types';

export const requestClusters = () => {
  return {type: types.REQUEST_CLUSTERS}
};

export const requestClustersSuccess = (clusters) => {
  console.log("action: ", types.REQUEST_CLUSTERS_SUCCESS, "clusters", clusters);
  return {type: types.REQUEST_CLUSTERS_SUCCESS, clusters: clusters} ;
};

export const requestClustersFailure = (type, error) => {
  return {type: types.REQUEST_CLUSTERS_FAILURE, error};
};