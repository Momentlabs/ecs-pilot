import * as types from '../actions/types';
import Queue from '../helpers/queue';

// state is a queue of loading records. 
export const loading = (state = new Queue(), action) => {
  // console.log("reducers#loading - entry", "action:", action, "state:", state );
  let newState = state;
  switch (action.type) {
    case types.LOADING_STARTED:
      newState = state.copy();
      action.payload["id"] = action.uuid; // add the id to the payload to communicate it out.
      newState.add(action.payload);
      break;
    case types.LOADING_COMPLETE: // payload it the id of the competed load.
      if (state.length() > 0) {
        newState = state.copy();
        newState.remove((e) => e.id !== action.payload);
      } else {
        throw(new Error(`trying to reduce LOADING_COMPLETE  with an empty loadingQueue. action: ${action}`))
      } // TODO: It's a logic error if we find we're trying to remove from an empty queue.
      break;
    default:
  }
  // console.log("reducers#loading - exit", "action:", action, "newState:", newState, "state:", state );
  return newState;
};

// TODO: This is really designed as a read-only state to be updated from the sever.
// This means that if we add creation or editing functionality that unless we redesign
// this state model (really normalize it) we'll send updates to the server and then 
// imediately want to do refreshes from the server for current state.
// There is nothing wrong with this, given that what this is doing is presenting 
// a view on state that exists in the a set of clusters of docker containers, but
// it could provide for some UI problems and incorrect ACTUAL state description
// in the app.

// State Shape:
// const initialState = {
//   clusters: [], // array of ecs Cluster objects.
//   selectedClusters: [] // array of cluster names that are currently selected.
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
    case types.LOADED_CLUSTERS:
      newState = Object.assign([], action.payload);
      break;
    default:
  }
  // console.log("Reducer#clusters() - exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};

export function selectedClusters( state=[], action) {
  // console.log("Reducer#selectedClusters - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type) {
    case types.SELECT_CLUSTER:
      newState = Object.assign([], state);
      newState.push(action.payload);
      break;
    case types.DESELECT_CLUSTER:
      newState = Object.assign([], state);
      let i = newState.indexOf(action.payload);
      newState.splice(i,1);
      break;
    default:
  }
  // console.log("Reducer#selectedClusters - exit", "state", state, "action", action);
  return newState;
}

// TODO: Failure is currently eaten in the saga .
export const instances = (state = {}, action) => {
  // console.log("Reducer#instances() - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type) {
    case types.LOADED_INSTANCES:
      let newInstances = Object.assign({}, state);
      newInstances[action.payload.clusterName] = action.payload.instances;
      newState = Object.assign({}, newInstances);
      break;
    default:
  }
  // console.log("Reducer#instances() - exit", "state:", state, "newState", newState, "action:", action);
  // console.log("Reducer#instances() - exit", "state:", JSON.stringify(state), "newState", JSON.stringify(newState), "action:", JSON.stringify(action));
  return newState;
};

export const securityGroups = (state = {}, action) => {
  // console.log("Reducer#securityGroups - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type)  {
    case types.LOADED_SECURITY_GROUPS:
      let newSgs = Object.assign({}, state);
      action.payload.forEach( (sg) => {
        newSgs[sg.groupId] = sg;
      });
      newState = Object.assign({}, newSgs);
      break;
    default:
  }
  // console.log("Reducer#securityGroups() exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};

export const deepTasks = (state = {}, action) => {
  // console.log("Redecuer#deepTasks - entry", "state:", state, "action:", action);
  let newState = state;
  let newDTs = {};
  switch(action.type) {
    case types.LOADED_DEEP_TASKS:
      if (!action.payload.error) {
        newDTs = Object.assign({}, state);
        newDTs[action.payload.clusterName] = action.payload.deepTasks;
        newState = Object.assign({}, newDTs);
        // console.log("Reducer#deepTasks, processed LOADED_DEEP_TASKS", "newState:", newState, "newDTs:", newDTs);
      } 
      break;
    default:
  }
  // console.log("Reducer#deepTasks() - exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};