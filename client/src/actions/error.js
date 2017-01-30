// import { createAction } from 'redux-actions'
import { createActionUUID } from './makeActions';
import * as types from './types';

export const reportError = createActionUUID(types.REPORT_ERROR, (error) => error);
export const reportedError = createActionUUID(types.REPORTED_ERROR, (error) => error);
