import * as types from './types';

export const requestDeepTasks = (clusterName) => {
  return {type: types.REQUEST_DEEP_TASKS, clusterName: clusterName};
};

export const requestDeepTasksSuccess = (clusterName, deepTasks) => {
  console.log("action: ", types.REQUEST_DEEP_TASKS_SUCCESS, "deepTasks", deepTasks);
  return {type: types.REQUEST_DEEP_TASKS_SUCCESS, clusterName: clusterName, deepTasks: deepTasks} ;
};

export const requestDeepTasksFailure = (type, error) => {
  return {type: types.REQUEST_DEEP_TASKS_FAILURE, error};
};