
import { browserHistory } from 'react-router';
import Auth0Lock from 'auth0-lock';
import * as authActions from '../actions/auth';
import * as color from '../styles/colors';

// Local Storage Keys
const TOKEN_KEY = "id_token";
const PROFILE_KEY = "profile";
const ACCESS_KEY = "access_token"; // eslint-disable-line no-unused-vars

// Operational Constants
// TODO: These need to be fed in .... 
// const REDIRECT_ROOT = "http://localhost:3000";
// const REDIRECT_PATH = "home";
// const REDIRECT_URL = REDIRECT_ROOT; // TODO: Investigate the addition of path.
// const REDIRECT_URL = REDIRECT_ROOT + "/" + REDIRECT_PATH; // TODO: Investigate the addition of path.

export default class AuthService {

  constructor(clientId, domain, dispatch /*, redirect=false */) {

    this.receiveToken = this.receiveToken.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.logggedIn = this.loggedIn.bind(this);
    this.loadProfile = this.loadProfile.bind(this);

    this.dispatch = dispatch;

    // Using lock
    const lockOptions = {
      autoclose: true,
      closeable: true,
      auth: {
        responseType: 'token',
        redirect: false,
        params: {
          scope: 'openid name nickname user_metadata'
        }
      },
      theme: {
        primaryColor: color.primary
      }

    };
    // redirect ? lockOptions["redirectUri"] = REDIRECT_URL : lockOptions["redirect"] = false;

    this.lock = new Auth0Lock(clientId, domain, lockOptions);
    this.lock.on("authenticated", this.receiveToken);
  }

  receiveToken(authResult) {
    console.log("AuthService:receiveToken()", "authResult:", authResult); // eslint-disable-line no-console
    this.setToken(authResult.idToken);
    this.dispatch(authActions.loggedIn(this, authResult.idToken));
    // browserHistory.replace(REDIRECT_PATH);
  }


  // Retruns a promise that will resolve with the profile.
  loadProfile() {
    // console.log("AuthService:loadProfile()", "this:", this);
    const token = this.getToken();
    const lock = this.lock;
    return new Promise( function(resolve, reject) {
      lock.getProfile(token, (error, profile) => {
        if (error) {
          console.log("AuthService:getProfile failed: ", error); // eslint-disable-line no-console
          reject(error);
        } else {
          // console.log("AuthService:getProfile succeded: ", "profile:", profile);
          resolve(profile);
        }
      });
    });
  }

  // Call to show the Auth0 UI.
  setToken(idToken) {
    localStorage.setItem(TOKEN_KEY, idToken);
  }

  // setAccess(access) {
  //   localStorage.setItem(ACCESS_KEY, access);
  // }

  // This is getting used in the SAGA.
  setProfile(profile) {
    // console.log("Auth:setProfile()");
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  // PUBLIC API
  login() {
    console.log("Auth:login()"); //eslint-disable-line no-console
    this.lock.show();
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    browserHistory.replace("/");
  }

  loggedIn() {
    return !!this.getToken();
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // getAccess() {
  //   return localStorage.getItem(ACCESS_KEY);
  // }

  getProfile() {
    const profile = localStorage.getItem(PROFILE_KEY);
    return profile ? JSON.parse(localStorage.profile) : {};
  }

}