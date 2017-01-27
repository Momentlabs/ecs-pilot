import * as types from '../actions/types';

export const error = (state = {}, action) => {
  console.log("Reducer#error() - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type) {
    case types.REPORT_ERROR:
      // let clustersCopy  = Object.assign([], state, { clusters: action.clusters });
      console.log("Reducer#error processing", "type:", action.type, "error:", action.error);
      newState = Object.assign({}, {error: action.error});
      console.log("Reducer#error copied", "action.error:", action.error, "newState:", newState);
      break;
  }
  console.log("Reducer#error() - exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};
