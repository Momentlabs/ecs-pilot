import { createAction } from 'redux-actions';
import * as types from './types';

// usage: requestDeepTasks("myclusterName") or requestDeepTasks(error);
export const requestDeepTasks = createAction(types.REQUEST_DEEP_TASKS, 
  (clusterName) => clusterName
);

export const loadedDeepTasks = createAction(types.LOADED_DEEP_TASKS,
  (clusterName, deepTasks) => {return {clusterName: clusterName, deepTasks: deepTasks}}
);
