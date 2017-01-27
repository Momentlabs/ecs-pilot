import * as types from '../actions/types';

export const error = (state = {}, action) => {
  console.log("Reducer#error() - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type) {
    case types.REPORT_ERROR:
      // let clustersCopy  = Object.assign([], state, { clusters: action.clusters });
      console.log("Reducer#error processing", "type:", action.type, "error:", action.payload);
      newState = Object.assign({}, {error: action.payload});
      console.log("Reducer#error copied", "action.payload", action.payload, "newState:", newState);
      break;
  }
  console.log("Reducer#error() - exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};
