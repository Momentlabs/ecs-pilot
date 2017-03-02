import * as types from '../actions/types';

// State is a new Auth Instance
export function auth(state = {}, action) {
  console.log("reducer#auth", "state:", state, "action:", action);
  let newState = state;
  switch (action.type) {
    case types.INIT_AUTH:
      newState = Object.assign({}, action.payload);
      break;
  }
  console.log("reducer#auth exit", "state:", state, "newState:", newState, "action:", action);
  return newState;
}