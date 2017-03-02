import { put, takeEvery } from 'redux-saga/effects';

import * as types from '../actions/types';
import * as serverActions from '../actions/serverData';
import * as errorActions from '../actions/error';

import Clusters from '../ecs/cluster';
import Instances, { securityGroupIds }from '../ecs/instance';
import SecurityGroup from '../ecs/securityGroup';
import DeepTask from '../ecs/deepTask';

// Currently this is the only entry into server interaction
// from the UI. Everything below is generated indirectly
// through this call.
export function* selectCluster(action) {
  // console.log("saga:selectCluster - start", "action:", action);
  try {
    const clusterName = action.payload;
    yield [
      put(serverActions.requestInstances(clusterName)),
      put(serverActions.requestDeepTasks(clusterName))
    ];
  } catch(error) {
      yield put({type: types.SELECT_CLUSTER_FAILURE, error});
  }
}

export function* watchSelectCluster() {
  // console.log("saga:watchSelectCluster");
  yield takeEvery(types.SELECT_CLUSTER, selectCluster);
}

function* requestAll(action) {
  // console.log("saga:requestAll - start", "action:", action);
  try {
    const clusterNames = action.payload;
    const instanceRequests = clusterNames.map( (cn) => { return put(serverActions.requestInstances(cn));});
    const deepTaskRequests = clusterNames.map( (cn) => { return put(serverActions.requestDeepTasks(cn));});
    yield [...instanceRequests, ...deepTaskRequests];
  } catch(error) {
    yield put({type: types.REQUEST_ALL_FAILURE, error});
  }
}

export function* watchRequestAll() {
  yield takeEvery(types.REQUEST_ALL, requestAll);
}

// TODO: I'm worried that I've created a problem with the load indicator:
// I'm not sure what the guarantees are wrt local variables and function*.
// what happens when 
// - requestClusers is called and an id is created (call the value id1);
// - then it goes off and yeilds to the Clusters.getClusters() call.
// - then another requestClusters call is made prior to the complettion of the
//   first. It will create and id with value id2. 
// * What is the value of id when the first yield returns: is it id1 or id2?
// Practically in this app for requestClusters, this won't happen. But that 
// is not the case for the rest of the request calls.
// 
// My current presummption is that like with other functions a new stack
// frame is generated with each invocation of the function* and that the 
// resumption is with the original stack_frame. O
//
// Obviously I need to read-up on generator details.
export function* requestClusters(action) {
  // console.log("saga:requestCluster - start", "action:", action);
  const loadAction = serverActions.startLoading("clusters");
  const id = loadAction.uuid;
  try {
    yield put(loadAction);
    const response = yield Clusters.getClusters();
    yield put(serverActions.completeLoading(id));
    // console.log("saga:requestCluster - Returned with clusters response - ", response);
    yield put(serverActions.loadedClusters(response.data));
  } catch(error) {
    error.displayMessage = "Failed to load clusters: " + error.message;
    yield put(serverActions.completeLoading(id));
    yield put(serverActions.loadedClusters(error));
  }
}

export function*  watchRequestClusters() {
  // console.log("saga:watchRequestCluster");
  yield takeEvery(types.REQUEST_CLUSTERS, requestClusters);
}

// TODO: right now I'm just replicating the pattern.
// It's likely that we'll want to consolidate some of this.
// not to mention handle errors.
function* requestInstances(action) {
  console.log("saga:requestInstances", "action:", action);
  const loadAction = serverActions.startLoading("instances");
  const id = loadAction.uuid;
  try {
    const clusterName = action.payload;
    yield put(loadAction);
    const instancesResponse = yield Instances.getInstances(clusterName);
    yield put(serverActions.completeLoading(id));
    // console.log("saga:requestInstances - yeild after getInstance()", "response:", instancesResponse);
    // TODO: the instanceResponse.data object has the shape: {failures: [], instances[]}
    // We need to generate some mechanism for displaying the failures.
    // For now we'll return only the instances results in the instances array on success.
    const instances = instancesResponse.data.instances;
    const groupIds = securityGroupIds(instances);
    yield [
            put(serverActions.loadedInstances(clusterName, instances)),
            put(serverActions.requestSecurityGroups(groupIds))
    ];

  } catch(error) {
    error.displayMessage = "Failed to load instances: " + error.message;
    yield put(serverActions.completeLoading(id));
    yield put(serverActions.loadedInstances(error));
  }
}

export function* watchRequestInstances() {
  // console.log("saga:watchRequestInstances - start");
  yield takeEvery(types.REQUEST_INSTANCES, requestInstances);
}


function* requestSecurityGroups(action) {
  // console.log("saga:requestSecurityGroups", "action:", action);
  const loadAction = serverActions.startLoading("securityGroups");
  const id = loadAction.uuid;
  try {
    yield put(loadAction);
    const response = yield SecurityGroup.getGroups(action.payload);
    yield put(serverActions.completeLoading(id));
    yield put(serverActions.loadedSecurityGroups(response.data));
} catch(error) {
    error.displayMessage = "Failed to load securityGroups: " + error.message;
    yield put(serverActions.completeLoading(id));
    yield put(serverActions.loadedSecurityGroups(error));
  }
}

export function* watchRequestSecurityGroups() {
  // console.log("saga:watchRequestSecurityGroups - start");
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
  // console.log("saga:requestDeepTasks()", "action:", action);
  const clusterName = action.payload;
  const loadAction = serverActions.startLoading("deepTasks");
  const id = loadAction.uuid;
  try {
    yield put(loadAction);
    const response = yield DeepTask.getDeepTasks(clusterName);
    yield put(serverActions.completeLoading(id));
    // console.log("saga:requestDeepTasks() - response yield", "reponse:", response);
    yield put(serverActions.loadedDeepTasks(clusterName, response.data));
  } catch(error) {
    // console.log("saga:requestDeepTasks() - error yield", "reponse:", error);
    error.displayMessage = "Failed to load tasks: " + error.message;
    yield put(serverActions.completeLoading(id));
    yield put(serverActions.loadedDeepTasks(error));
  }
}

export function* watchRequestDeepTasks() {
  // console.log("saga: watchDeepRequestTasks - start");
  yield takeEvery(types.REQUEST_DEEP_TASKS, requestDeepTasks);
}

// TODO: Not sure if this is the best way to handle failures.
// This does centralize these failures .....
function* failureHandler(action) {
  const error = action.error;
  // console.log("saga:failureHandler()", "action:", action);
  yield put(errorActions.reportError(error));
  // throw(action.error);
}

export function* watchRequestFailiure() {
  // console.log("saga:watchRequestFailure - start");
  yield takeEvery(types.matchErrorActions, failureHandler);
}

// This can also be used as a simple logger given that it sees all actions.
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
  // console.log("saga:watchLoaded - start");
  yield takeEvery("*", errorHandler);
}
