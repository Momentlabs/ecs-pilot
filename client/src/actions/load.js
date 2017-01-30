import { createActionUUID } from './makeActions';
import { createAction } from 'redux-actions';
import * as types from './types';

// TODO: This needs to use the createActionUUID function.
export const startLoading = createActionUUID(types.LOADING_STARTED,
  (what, id) => {return {what: what, when: Date.now()}}
);

export const completeLoading = createAction(types.LOADING_COMPLETE, (id) => id);