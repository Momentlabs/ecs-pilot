import { put, takeEvery } from 'redux-saga/effects';

import * as types from '../actions/types';
import Clusters from '../ecs/cluster';
import * as clusterActions from '../actions/cluster';
import Instances, { securityGroupIds }from '../ecs/instance';
import * as instanceActions from '../actions/instance';
import SecurityGroup from '../ecs/securityGroup';
import * as securityGroupActions from '../actions/securityGroup';
// import Task from '../ecs/task';
// import * as taskActions from '../actions/task';
import DeepTask from '../ecs/deepTask';
import * as deepTaskActions from '../actions/deepTask';
import * as errorActions from '../actions/error';


// Currently this is the only entry into server interaction
// from the UI. Everything below is generated indirectly
// through this call.
export function* selectCluster(action) {
  // console.log("saga:selectCluster - start", "action:", action);
  try {
    const clusterName = action.clusterName;
    yield [
      put(instanceActions.requestInstances(clusterName)),
      put(deepTaskActions.requestDeepTasks(clusterName))
    ];
  } catch(error) {
      yield put({type: types.SELECT_CLUSTER_FAILURE, error});
  }
}

export function* watchSelectCluster() {
  console.log("saga:watchSelectCluster");
  yield takeEvery(types.SELECT_CLUSTER, selectCluster);
}

export function* requestClusters(action) {
  console.log("saga:requestCluster - start", "action:", action);
  try {
    const response = yield Clusters.getClusters();
    console.log("saga:requestCluster - Returned with clusters response - ", response);
    yield put(clusterActions.loadedClusters(response.data));
  } catch(error) {
    yield put(clusterActions.loadedClusters(error));
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
    const clusterName = action.payload;
    const instancesResponse = yield Instances.getInstances(clusterName);
    console.log("saga:requestInstances - yeild after getInstance()", "response:", instancesResponse);
    // TODO: the instanceResponse.data object has the shape: {failures: [], instances[]}
    // We need to generate some mechanism for displaying the failures.
    // For now we'll return only the instances results in the instances array on success.
    const instances = instancesResponse.data.instances;
    const groupIds = securityGroupIds(instances);
    yield [
            put(instanceActions.loadedInstances(clusterName, instances)),
            put(securityGroupActions.requestSecurityGroups(groupIds))
    ];

  } catch(error) {
    yield put(instanceActions.loadedInstances(error));
  }
}

export function* watchRequestInstances() {
  console.log("saga:watchRequestInstances - start");
  yield takeEvery(types.REQUEST_INSTANCES, requestInstances);
}


function* requestSecurityGroups(action) {
  console.log("saga:requestSecurityGroups", "action:", action);
  try {
    const response = yield SecurityGroup.getGroups(action.payload);
    yield put(securityGroupActions.loadedSecurityGroups(response.data));
  } catch(error) {
    yield put(securityGroupActions.loadedSecurityGroups(error));
  }
}

export function* watchRequestSecurityGroups() {
  console.log("saga:watchRequestSecurityGroups - start");
  yield takeEvery(types.REQUEST_SECURITY_GROUPS, requestSecurityGroups);

}

// function* requestTasks(action) {
//   console.log("saga:requestTasks()", "action:", action);
//   try {
//     const response = yield Task.getTasks(action.clusterName);
//     const tasksMap = response.data;
//     yield [
//       put(taskActions.requestTasksSuccess(tasksMap))
//     ];
//   } catch(error) {
//     yield put(taskActions.requestTasksFailure(error));
//   }
// }

// export function* watchRequestTasks() {
//   console.log("saga: watchRequestTasks - start");
//   yield takeEvery(types.REQUEST_TASKS, requestTasks);
// }

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
  const clusterName = action.payload;
  try {
    const response = yield DeepTask.getDeepTasks(clusterName);
    console.log("saga:requestDeepTasks() - response yield", "reponse:", response);
    yield put(deepTaskActions.loadedDeepTasks(clusterName, response.data));
  } catch(error) {
    console.log("saga:requestDeepTasks() - error yield", "reponse:", error);
    error.displayMessage = "Failed to load tasks: " + error.message;
    yield put(deepTaskActions.loadedDeepTasks(error));
  }
}

export function* watchRequestDeepTasks() {
  console.log("saga: watchDeepRequestTasks - start");
  yield takeEvery(types.REQUEST_DEEP_TASKS, requestDeepTasks);
}


// TODO: Not sure if this is the best way to handle failures.
// This does centralize these failures .....
function* failureHandler(action) {
  const error = action.error;
  console.log("saga:failureHandler()", "action:", action);
  yield put(errorActions.reportError(error));
  // throw(action.error);
}

export function* watchRequestFailiure() {
  console.log("saga:watchRequestFailure - start");
  yield takeEvery(types.matchErrorActions, failureHandler);
}

function* errorHandler(action) {
  console.log("saga:errorHandler()", "action:", action);
  if (action.type === types.REPORT_ERROR) {
    return;
  } else if (action.error) {
    console.log("saga:errorHandler() - firing error.", "action:", action);
    yield put(errorActions.reportError(action.payload));
  }
}

// These will see all actions ....
export function* watchLoaded() {
  console.log("saga:watchLoaded - start");
  yield takeEvery("*", errorHandler);
}
