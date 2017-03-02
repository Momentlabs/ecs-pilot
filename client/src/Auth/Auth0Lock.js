
import { browserHistory } from 'react-router';
import Auth0Lock from 'auth0-lock';

// EVENTS
export const AUTH_PROFILE_UPDATE = "profileUpdate";
export const AUTH_LOGIN = "login";
export const AUTH_LOGOUT = "logout";

const TOKEN_KEY = "id_token";
const PROFILE_KEY = "profile";
const ACCESS_KEY = "access_token";

const REDIRECT_ROOT = "http://localhost:3000";
const REDIRECT_PATH = "home";
const REDIRECT_URL = REDIRECT_ROOT; // TODO: Investigate the addition of path.
export default class AuthService {

  constructor(clientId, domain, redirect=true) {

    this.listeners = [];

    this.receiveToken = this.receiveToken.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.logggedIn = this.loggedIn.bind(this);
    // this.listen = this.listen.bind(this);
    // this.clientCB = this.clientCB.bind(this);

    // Using lock
    const lockOptions = {responseType: 'token'};
    redirect ? lockOptions["redirectUri"] = REDIRECT_URL : lockOptions["redirect"] = false;
    this.lock= new Auth0Lock(clientId, domain, {auth: lockOptions});
    this.lock.on("authenticated", this.receiveToken);
  }

  receiveToken(authResult) {
    console.log("AuthService:_doAuthenticated()", "authResult:", authResult);
    this.setToken(authResult.idToken);
    this.lock.getProfile(authResult.idToken, (error, profile) => {
      if (error) {
        console.log('Error loding the profile', error);
      } else {
        this.setProfile(profile);
      }
    });
    // this.publish(AUTH_LOGIN);
    browserHistory.replace(REDIRECT_PATH);
  }

  // Call to show the Auth0 UI.
  setToken(idToken) {
    localStorage.setItem(TOKEN_KEY, idToken);
  }

  setAccess(access) {
    localStorage.setItem(ACCESS_KEY, access);
  }

  setProfile(profile) {
    console.log("Auth:setProfile()");
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // this.publish(AUTH_PROFILE_UPDATE);
    // TODO: This needs to fire an action. Pass in dispatch?
  }

  // PUBLIC API
  login() {
    console.log("Auth:login()");
    this.lock.show();
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    browserHistory.replace("/");
    this.publish(AUTH_LOGOUT);
  }

  loggedIn() {
    return !!this.getToken();
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  getAccess() {
    return localStorage.getItem(ACCESS_KEY);
  }

  getProfile() {
    const profile = localStorage.getItem(PROFILE_KEY);
    return profile ? JSON.parse(localStorage.profile) : {};
  }


}