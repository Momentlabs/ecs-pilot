import { put, takeEvery } from 'redux-saga/effects';
import { browserHistory } from 'react-router';

import * as types from '../actions/types';
import * as authActions from '../actions/auth';

export function* auth(action) {
  // console.log("saga:auth()", "action:", action );
  try {
    switch (action.type) {
      case types.AUTH_LOGGED_IN:
        const { service } = action.payload;
        const profile = yield service.loadProfile();
        browserHistory.replace("/home");
        // console.log("saga:auth() - LoadProfile returned", "profile:", profile);
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

export function* watchAuth() {
  yield takeEvery(types.AUTH_LOGGED_IN, auth);
}
