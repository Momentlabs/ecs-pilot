import { put, takeEvery } from 'redux-saga/effects';

import * as types from '../actions/types';
import Clusters from '../ecs/cluster';
import * as clusterActions from '../actions/cluster';
import Instances, { securityGroupIds }from '../ecs/instance';
import * as instanceActions from '../actions/instance';
import SecurityGroup from '../ecs/securityGroup';
import * as securityGroupActions from '../actions/securityGroup';

// TODO: There is a lot of ceremony here. Refactor to make this
// easier to add data.
export function* requestClusters(action) {
  console.log("saga:requestCluster - start", "action:", action);
  try {
    const clusterResponse = yield Clusters.getClusters();
    console.log("saga:requestCluster - Returned with clusters response - ", clusterResponse);
    let actionReturn = clusterActions.requestClustersSuccess(clusterResponse.data);
    console.log("saga:requestCluster - next action: ", actionReturn);
    yield put(actionReturn);
  } catch(error) {
    yield put({type: types.REQUEST_CLUSTERS_FAILURE, error});
  }
}

export function*  watchRequestClusters() {
  console.log("saga:watchRequestCluster - start");
  yield takeEvery(types.REQUEST_CLUSTERS, requestClusters);
}

// TODO: right now I'm just replicating the patter.
// It's likely that we'll want to consolidate some of this.
// not to mention handle errors.
export function* requestInstances(action) {
  console.log("saga:requestInstances - start", "action:", action);
  try {
    const instancesResponse = yield Instances.getInstances(action.clusterName);
    console.log("saga:requestInstances - yeild after getInstance()", "response:", instancesResponse);
    // TODO: the instanceResponse.data object has the shape: {failures: [], instances[]}
    // We need to generate some mechanism for displaying the failures.
    // For now we'll return the results in the instances array on success.
    const instances = instancesResponse.data.instances;
    yield put(instanceActions.requestInstancesSuccess(instances));

    // Now get associated security groups.
    const groupIds = securityGroupIds(instances);
    yield put(securityGroupActions.requestSecurityGroups(groupIds));

  } catch(error) {
    yield put(instanceActions.requestInstancesFailure(error));
  }
}

export function* watchRequestInstances() {
  console.log("saga:watchRequestInstances - start");
  yield takeEvery(types.REQUEST_INSTANCES, requestInstances);
}


export function* requestSecurityGroups(action) {
  console.log("saga:requestSecurityGroups - start", "action:", action);
  try {
    const securityGroupsResponse = yield SecurityGroup.getGroups(action.groupIds);
    yield put(securityGroupActions.requestSecurityGroupsSuccess(securityGroupsResponse.data));
  } catch(error) {
    yield put(securityGroupActions.requestSecurityGroupsFailure(error));
  }
}

export function* watchRequestSecurityGroups() {
  console.log("saga:watchRequestSecurityGroups - start");
  yield takeEvery(types.REQUEST_SECURITY_GROUPS, requestSecurityGroups);

}