import * as types from './types';

export const requestInstances = (clusterName) => {
  console.log("action: ", types.REQUEST_INSTANCES, "clusterName", clusterName);
  return {type: types.REQUEST_INSTANCES, clusterName: clusterName};
};

export const requestInstancesSuccess = (clusterName, instances) => {
  console.log("action: ", types.REQUEST_INSTANCES_SUCCESS, "instances", instances);
  return {type: types.REQUEST_INSTANCES_SUCCESS, clusterName: clusterName, instances: instances} ;
};

export const requestInstancesFailure = (error) => {
  return {type: types.REQUEST_INSTANCES_FAILURE, error};
};