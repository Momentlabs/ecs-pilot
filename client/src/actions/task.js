import * as types from './types';

export const requestTasks = (clusterName) => {
  console.log("action: ", types.REQUEST_TASKS, "clusterName", clusterName);
  return {type: types.REQUEST_TASKS, clusterName: clusterName};
};

export const requestTasksSuccess = (tasksMap) => {
  console.log("action: ", types.REQUEST_TASKS_SUCCESS, "tasksMap", tasksMap);
  return {type: types.REQUEST_TASKS_SUCCESS, tasksMap: tasksMap} ;
};

export const requestTasksFailure = (error) => {
  return {type: types.REQUEST_TASKS_FAILURE, error};
};
