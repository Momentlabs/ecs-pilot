import { createAction } from 'redux-actions';
import * as types from './types';

export const requestSecurityGroups = createAction(types.REQUEST_SECURITY_GROUPS, (groupIds) => groupIds);
export const loadedSecurityGroups = createAction(types.LOADED_SECURITY_GROUPS,  (securityGroups) => securityGroups);
