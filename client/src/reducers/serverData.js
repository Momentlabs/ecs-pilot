import * as types from '../actions/types';

// TODO: This is really designed as a read-only state to be updated from the sever.
// This means that if we add creation or editing functionality that unless we redesign
// this state model (really normalize it) we'll send updates to the serer and then 
// imediately want to do refreshes from the server for current state.
// There is nothing wrong with this, given that what this is doing is presenting 
// a view on state that exists in the a set of clusters of docker containers, but
// it could provide for some UI problems and incorrect ACTUAL state description
// in the app.

// State Shape example:
// const initialState = {
//   clusters: [], // array of ecs Cluster objects.
//   instances: {
//     SomeClusterName: [], // hash of an array of instances keyed on clusterName
//   },
//   deepTasks: {      // hash of an array of deeptasks keyed on clusterName
//     SomeClusterName: [],
//   },
//   securityGroups:{
//     SG-SomeSecurityGroupID: {} // hash of securityGroups keyed on securityGrupID.
//   }
// };

// TODO: Failure is currently eaten in the saga .
export const clusters = (state = [], action) => {
  // console.log("Reducer#clusters - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type) {
    case types.REQUEST_CLUSTERS_SUCCESS:
      // let clustersCopy  = Object.assign([], state, { clusters: action.clusters });
      // console.log("Reducer#clusters: type: ", action.type, "clustersCopy:", clustersCopy);
      newState = Object.assign([], action.clusters);
      break;
  }
  // console.log("Reducer#clusters() - exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};

// TODO: Failure is currently eaten in the saga .
export const instances = (state = {}, action) => {
  // console.log("Reducer#instances() - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type) {
    case types.REQUEST_INSTANCES_SUCCESS:
      let newInstances = Object.assign({}, state);
      newInstances[action.clusterName] = action.instances;
      newState = Object.assign({}, newInstances);
      break;
  }
  // console.log("Reducer#instances() - exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};

export const securityGroups = (state = {}, action) => {
  // console.log("Reducer#securityGroups - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type)  {
    case types.REQUEST_SECURITY_GROUPS_SUCCESS:
      let newSgs = Object.assign({}, state);
      action.securityGroups.forEach( (sg) => {
        newSgs[sg.groupId] = sg;
      });
      newState = Object.assign({}, newSgs);
      break;
  }
  // console.log("Reducer#securityGroups() exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};

export const tasksMap = (state = {}, action) => {
  // console.log("Reducer#tasks WHAT!!!!", "state:", state, "action:", action);
  // switch(action.type) {
  //   case types.REQUEST_TASKS_SUCCESS:

  //     return Object.assign({}, action.tasksMap);
  // }
  return state;
};
export const deepTasks = (state = {}, action) => {
  // console.log("Redecuer#deepTasks - entry", "state:", state, "action:", action);
  let newState = state;
  let newDTs = {};
  switch(action.type) {
    case types.REQUEST_DEEP_TASKS_SUCCESS:
      newDTs = Object.assign({}, state);
      newDTs[action.clusterName] = action.deepTasks;
      newState = Object.assign({}, newDTs);
      break;
  }
  // console.log("Reducer#deepTasks() - exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};