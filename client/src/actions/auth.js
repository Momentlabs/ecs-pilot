import { createAction} from 'redux-actions';
import * as types from './types';
import Auth0Lock from '../Auth/Auth0Lock';

export const initAuth = createAction(types.INIT_AUTH, (clientId, domain) => new Auth0Lock(clientId, domain));
export const showLogin = createAction(types.SHOW_LOGIN);
