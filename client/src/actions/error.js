import { createAction } from 'redux-actions'
import * as types from './types';

export const reportError = createAction(types.REPORT_ERROR, (error) => error);
