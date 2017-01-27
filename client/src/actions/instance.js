import { createAction } from 'redux-actions'
import * as types from './types';


export const requestInstances = createAction(types.REQUEST_INSTANCES, clusterName => clusterName);
export const loadedInstances = createAction(types.LOADED_INSTANCES, 
  (clusterName, instances) => {return {clusterName: clusterName, instances: instances}});
