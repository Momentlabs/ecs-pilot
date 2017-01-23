import { put, takeEvery } from 'redux-saga/effects';

import * as types from '../actions/types';
import Clusters from '../ecs/cluster';
import * as clusterActions from '../actions/cluster';
import Instances, { securityGroupIds }from '../ecs/instance';
import * as instanceActions from '../actions/instance';
import SecurityGroup from '../ecs/securityGroup';
import * as securityGroupActions from '../actions/securityGroup';
import Task from '../ecs/task';
import * as taskActions from '../actions/task';
import DeepTask from '../ecs/deepTask';
import * as deepTaskActions from '../actions/deepTask';

// TODO: There is a lot of ceremony here. Refactor to make this
// easier to add data.
// With this in mind, we can probably reduce this to a single watcher
// by changing the action protocol to something like:
//     REQUEST_INITIATE_<DATA_TYPE> (e.g. REQUEST_INITIATE_CLUSTERS =)
//     REQUEST_SUCCESS_<DATA_TYPE>
//     REQUEST_FAILURE_<DATA_TYPE>
//  (note that if I'd just followed the redux recommendation 
//       LOAD_<DATA_TYPE>_{REQUEST, SUCCESS, FAILURE}
//  I would already be there).
// In the watch function we can switch on the action.type implementing
// the call to get data and responses are eseentially the same for each result.
export function* requestClusters(action) {
  console.log("saga:requestCluster - start", "action:", action);
  try {
    const response = yield Clusters.getClusters();
    console.log("saga:requestCluster - Returned with clusters response - ", response);
    yield put(clusterActions.requestClustersSuccess(response.data));
    // console.log("saga:requestCluster - next action: ", actionReturn);
    // yield put(actionReturn);
  } catch(error) {
    yield put({type: types.REQUEST_CLUSTERS_FAILURE, error});
  }
}

export function*  watchRequestClusters() {
  console.log("saga:watchRequestCluster");
  yield takeEvery(types.REQUEST_CLUSTERS, requestClusters);
}

// TODO: right now I'm just replicating the pattern.
// It's likely that we'll want to consolidate some of this.
// not to mention handle errors.
function* requestInstances(action) {
  console.log("saga:requestInstances", "action:", action);
  try {
    const {clusterName} = action;
    const instancesResponse = yield Instances.getInstances(clusterName);
    console.log("saga:requestInstances - yeild after getInstance()", "response:", instancesResponse);
    // TODO: the instanceResponse.data object has the shape: {failures: [], instances[]}
    // We need to generate some mechanism for displaying the failures.
    // For now we'll return only the instances results in the instances array on success.
    const instances = instancesResponse.data.instances;
    const groupIds = securityGroupIds(instances);
    yield [
            put(instanceActions.requestInstancesSuccess(clusterName, instances)),
            put(securityGroupActions.requestSecurityGroups(groupIds))
    ];

    // Now get associated security groups.
    // yield put(securityGroupActions.requestSecurityGroups(groupIds));

  } catch(error) {
    yield put(instanceActions.requestInstancesFailure(error));
  }
}

export function* watchRequestInstances() {
  console.log("saga:watchRequestInstances - start");
  yield takeEvery(types.REQUEST_INSTANCES, requestInstances);
}


function* requestSecurityGroups(action) {
  console.log("saga:requestSecurityGroups", "action:", action);
  try {
    const response = yield SecurityGroup.getGroups(action.groupIds);
    yield put(securityGroupActions.requestSecurityGroupsSuccess(response.data));
  } catch(error) {
    yield put(securityGroupActions.requestSecurityGroupsFailure(error));
  }
}

export function* watchRequestSecurityGroups() {
  console.log("saga:watchRequestSecurityGroups - start");
  yield takeEvery(types.REQUEST_SECURITY_GROUPS, requestSecurityGroups);

}

function* requestTasks(action) {
  console.log("saga:requestTasks()", "action:", action);
  try {
    const response = yield Task.getTasks(action.clusterName);
    const tasksMap = response.data;
    yield [
      put(taskActions.requestTasksSuccess(tasksMap))
    ];
  } catch(error) {
    yield put(taskActions.requestTasksFailure(error));
  }
}

export function* watchRequestTasks() {
  console.log("saga: watchRequestTasks - start");
  yield takeEvery(types.REQUEST_TASKS, requestTasks);
}

// TODO: This will take about 2 seconds to complete in the best of circumstances,
// as opposed to parallel calls to get the same information but separately.
// It's easier to implement right now because all of the work to attach
// Instance (container and EC2) and TaskDefinintion data to the task
// is done on the server. But there is a LOT of duplication of data here
// (all of the Instance and TaskDefinnition information is copied into the deepTask)
// so e.g. the payload of a deeptask list is about 80K for a couple of instances
// and a dozen tasks. Whereas the total information of tasks + instances is about 20K.
// Also the server will not respond until all the data has been obtained from AWS
// so we will see that delay, we could relatively easily fill in what we get when
// we get it if we make the separate calls here on the client and piece the information
// together on this side. Let's optimize latter when we have a better sense of use
// case and actual perceived performance.
function* requestDeepTasks(action) {
  console.log("saga:requestDeepTasks()", "action:", action);
  const clusterName = action.clusterName;
  try {
    const response = yield DeepTask.getDeepTasks(clusterName);
    yield [
      put(deepTaskActions.requestDeepTasksSuccess(clusterName, response.data))
    ];
  } catch(error) {
    yield put(deepTaskActions.requestDeepTasksFailure(error));
  }
}

export function* watchRequestDeepTasks() {
  console.log("saga: watchDeepRequestTasks - start");
  yield takeEvery(types.REQUEST_DEEP_TASKS, requestDeepTasks);
}
