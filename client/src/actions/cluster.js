import { createAction } from 'redux-actions'
import * as types from './types';


export const requestClusters = createAction(types.REQUEST_CLUSTERS);
export const loadedClusters = createAction(types.LOADED_CLUSTERS, clusters => clusters);

export const selectCluster = createAction(types.SELECT_CLUSTER, clusterName => clusterName);

