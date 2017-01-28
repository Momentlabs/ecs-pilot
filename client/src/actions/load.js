import { createAction } from 'redux-actions';
import * as types from './types';

export const startLoading = createAction(types.LOADING_STARTED,
  (what, id) => {return {what: what, id: id, when: Date.now()}}
);

export const completeLoading = createAction(types.LOADING_COMPLETE,
  (id) => id
);