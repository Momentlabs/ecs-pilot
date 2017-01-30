import * as types from '../actions/types';
import Queue from '../helpers/queue';

export const error = (state = new Queue, action) => {
  // console.log("Reducer#error() - entry", "state", state, "action", action);
  let newState = state;
  switch (action.type) {
    case types.REPORT_ERROR:
      // console.log("Reducer#error processing", "type:", action.type, "error:", action.payload);
      newState = state.copy();
      newState.add({err: action.payload, id: action.uuid});
      // newState = Object.assign({}, {err: action.payload, id: action.uuid});
      break;
    case types.REPORTED_ERROR:
      newState = state.copy();
      newState.remove((e) => e.id === action.uuid);
      break; 
  }
  // console.log("Reducer#error() - exit", "state:", state, "newState", newState, "action:", action);
  return newState;
};
