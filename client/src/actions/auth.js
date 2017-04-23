import { createAction} from 'redux-actions';
import * as types from './types';
import Auth0Lock from '../Auth/Auth0Lock';

export const initAuth = createAction(types.AUTH_INIT, (clientId, domain, dispatch) => new Auth0Lock(clientId, domain, dispatch));
export const showLogin = createAction(types.AUTH_LOGIN);
export const loggedIn = createAction(types.AUTH_LOGGED_IN, (service, token) => ({service: service, token: token}));
export const getProfile = createAction(types.AUTH_GET_PROFILE);
export const profileUpdated = createAction(types.AUTH_PROFILE_UPDATED, (profile) => profile);