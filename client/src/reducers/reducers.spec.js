import expect from 'expect';
// import Queue from '../helpers/queue';
import * as types from '../actions/types';
import * as reducers from '../reducers/serverData';

// TODO: Clean this mess up. It works but the cases are not very clear.
// if you do have to work with this, look at the tests first, then go to the data.

// Clusters 
const initialClusterData = {clusterName: "cluster1", status: "ACTIVE", runningTasksCount: 1, pendingTasksCount: 0};
const newClustersData= {clusterName: "cluster2", status: "ACTIVE", runningTasksCount: 2, pendingTasksCount: 1};
const loadedNewClustersAction = {type: types.LOADED_CLUSTERS, payload: [newClustersData]};
const clusterTest = {reducerName: "cluster", reducer: reducers.clusters, initialState: [], preActionState: [initialClusterData], 
  postActionState: [newClustersData], firstActionState: [newClustersData], action: loadedNewClustersAction};

// Instances
const initialInstancesData = [
  {containerInstance: "instance1", ec2Instnace: "instance1"},
  {containerInstance: "instance2", ecInstance: "instance2"}
];
const newInstanceData = [
  {containerInstance: "instance3", ec2Instance: "instance3"},
  {containerInstnace: "instance4", e2Instance: "instance4"}
];
const cn1 = "cluster1";
const cn2 = "cluster2";
let instancesInitState = {};
instancesInitState[cn1] = initialInstancesData;
let instancesNewDataState = {};
instancesNewDataState[cn2] = newInstanceData;
let instancesPostState = {};
instancesPostState[cn1] = initialInstancesData;
instancesPostState[cn2] = newInstanceData;
const loadedNewInstancesAction = {type: types.LOADED_INSTANCES, payload: {clusterName: cn2, instances: newInstanceData}};
const instanceTest = {reducerName: "instance", reducer: reducers.instances, initialState: {}, preActionState: instancesInitState, 
  postActionState: instancesPostState, firstActionState: instancesNewDataState, action: loadedNewInstancesAction};

// Security Groups
const initialSGData = [
  {groupId: "sg-1", groupName: "sg1"}
];
const newSGData = [
  {groupId: "sg-2", groupName: "sg2"},
  {groupId: "sg-3", groupName: "sg3"}
];
const sgFirstActionState = {
  "sg-2": newSGData[0],
  "sg-3": newSGData[1]
};
const sgPreActionState = {
  "sg-1": initialSGData[0]
};
const sgPostActionState = {
  "sg-1": initialSGData[0],
  "sg-2": newSGData[0],
  "sg-3": newSGData[1]
};
const loadSGAction = {type: types.LOADED_SECURITY_GROUPS, payload: newSGData};
const sgTest ={reducerName: "securityGroups", reducer: reducers.securityGroups, initialState: {}, preActionState: sgPreActionState,
  postActionState: sgPostActionState, firstActionState: sgFirstActionState, action: loadSGAction};

// DeepTasks
const initialDTData = {
  clusterName: "cluster1",
  deepTasks: [
    {
      containerInstance: 1,
      ec2Insstance: 1,
      task: 1,
      taskDefinition: 1
    }
  ]
};
const newDTData = {
  clusterName: "cluster2",
  deepTasks: [
    {
      containerInstance: 2,
      ec2Instnace: 2,
      task: 2,
      taskDeifinition: 2,
    },
    {
      containerInstance: 3,
      ec2Instnace: 3,
      task: 3,
      taskDeifinition: 3,
    }
  ]
};
let dtFirstActionState = {};
dtFirstActionState[newDTData.clusterName] = newDTData.deepTasks;
let dtPreActionState = {};
dtPreActionState[initialDTData.clusterName] = initialDTData.deepTasks;
let dtPostActionState = {};
dtPostActionState[initialDTData.clusterName] = initialDTData.deepTasks;
dtPostActionState[newDTData.clusterName] = newDTData.deepTasks;
const loadDTAction = {type: types.LOADED_DEEP_TASKS, payload: newDTData};
const dtTest = {reducerName: "deepTasks", reducer: reducers.deepTasks, 
  initialState: {},  preActionState: dtPreActionState, postActionState: dtPostActionState, 
  firstActionState: dtFirstActionState, action: loadDTAction};

// TESTS
const testsData = [clusterTest, instanceTest, sgTest, dtTest];
describe('Testing reducers:', () => {
  testsData.forEach( (test) => {
    const { reducerName, reducer, initialState, preActionState, postActionState, firstActionState, action } = test;
    describe(reducerName, () => {
      it('should return initial state as the default state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
      });

      it('starting with an empty initial state, should return state with the data from the action.', () => {
        expect(reducer(initialState, action)).toEqual(firstActionState);
      });

      it('starting from an preActionState, should return data from the postActionedState', () => {
        expect(reducer(preActionState, action)).toEqual(postActionState);
      });

      it('should not change state for other actions.', () => {
        Object.keys(types).filter((k) => k !== action.type).forEach( (t) => {
          expect(reducer(preActionState, {type: types[t]})).toEqual(preActionState); // eslint-disable-line import/namespace
        });
      });
    });
  });
});
