import * as types from '../actions/types';

// State is a new Auth Instance
export function auth(state = {service: undefined, profile: undefined}, action) {
  // console.log("reducer#auth", "state:", state, "action:", action);
  let newState = Object.assign({}, state);
  switch (action.type) {
    case types.AUTH_INIT:
      newState.service = action.payload;
      break;
    case types.AUTH_PROFILE_UPDATED:
      newState.profile = action.payload;
      break;
  }
  // console.log("reducer#auth exit", "state:", state, "newState:", newState, "action:", action);
  return newState;
}