import { put, takeEvery } from 'redux-saga/effects';
import { browserHistory } from 'react-router';
import axios from 'axios';

import * as types from '../actions/types';
import * as authActions from '../actions/auth';

const AUTH_HEADER = "Authorization";

function setBearerToken(token) { 
  axios.defaults.headers.common[AUTH_HEADER] = 'bearer ' + token;
}

export function* auth(action) {
  console.log("saga:auth()", "action:", action );
  let service = undefined;
  let token = undefined;
  try {
    switch (action.type) {

      case types.AUTH_INIT:
        service = action.payload;
        token = service.getToken();
        if (token && token !== "") {
          setBearerToken(token);
        }
        break;

      case types.AUTH_LOGGED_IN:
        // TODO: Probably should remove the TOKEN setting to local state from Auth object to here.
        service = action.payload.service;
        token = service.getToken();
        setBearerToken(token);
        const profile = yield service.loadProfile();
        browserHistory.replace("/home");
        service.setProfile(profile);
        yield put(authActions.profileUpdated(profile));
        break;
    }

  } catch(error) {
    // console.log("saga:auth() error:", error);
    error.displayMessage = "Failed to load user profile data: " + error.message;
    yield  put(authActions.profileUpdated(error));
  }
}

function authTypesToWatch(action) {
  return action.type.startsWith("AUTH_") ? true : false;
}

export function* watchAuth() {
  yield takeEvery(authTypesToWatch, auth);
}
