import * as types from '../actions/types';

// TODO: Failure is currently eaten in the saga .
export const clusters = (state = [], action) => {
  console.log("Reducer#clusters", "state", state, "action", action);
  switch (action.type) {
    case types.REQUEST_CLUSTERS_SUCCESS:
      let clustersCopy  = Object.assign([], action.clusters);
      console.log("Reducer#clusters: type: ", action.type, "clustersCopy:", clustersCopy);
      return clustersCopy;
    case types.REQUEST_CLUSTERS_FAILURE:
      return state;
    default:
      return state;  
  }
};

// TODO: Failure is currently eaten in the saga .
export const instances = (state = [], action) => {
  console.log("Reducer#instances", "state", state, "action", action);
  switch (action.type) {
    case types.REQUEST_INSTANCES_SUCCESS:
      return Object.assign([], action.instances);
  }
  return state;
};

export const securityGroups = (state = [], action) => {
  console.log("Reducer#securityGroups", "state", state, "action", action);
  switch (action.type)  {
    case types.REQUEST_SECURITY_GROUPS_SUCCESS:
      return Object.assign([], action.securityGroups);
  }
  return state;
}