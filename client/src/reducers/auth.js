import * as types from '../actions/types';

// State is a new Auth Instance
export function auth(state = {service: undefined, profile: undefined, token: undefined}, action) {
  console.log("reducer#auth", "state:", state, "action:", action);
  let newState = Object.assign({}, state);
  switch (action.type) {
    case types.AUTH_INIT:
      newState.service = action.payload;                // TODO:
      newState.profile = newState.service.getProfile(); // hmmmm .... not pure!
      newState.token = newState.service.getToken();  // oh dear ..... not pure!
      break;
    case types.AUTH_LOGGED_IN:
      newState.token = action.payload.token;
      break;
    case types.AUTH_PROFILE_UPDATED:
      newState.profile = action.payload;
      break;
    default:
  }
  // console.log("reducer#auth exit", "state:", state, "newState:", newState, "action:", action);
  return newState;
}