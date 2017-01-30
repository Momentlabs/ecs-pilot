import expect from 'expect';
import Queue from '../helpers/queue';
import * as types from '../actions/types';
import * as reducers from './serverData';
import * as loadActions from '../actions/load';

// Loading

const startActionInit = loadActions.startLoading("clusters");
const completeActionInit = loadActions.completeLoading(startActionInit.uuid);
const startActionNew = loadActions.startLoading("deepTasks");
const completeActionNew = loadActions.completeLoading(startActionNew.uuid);
const ldMakeData = (what, when, id) => {
  return {
    startPayload: {what: what, when: when},
    state: {what: what, when: when, id: id}
  };
};

const newData = ldMakeData(startActionNew.payload.what, 
                             startActionNew.payload.when, 
                             startActionNew.uuid);
const newState = new Queue;
newState.add(newData.state);

const initData = ldMakeData(startActionInit.payload.what,
                              startActionInit.payload.when,
                              startActionInit.uuid);
const initState = new Queue;
initState.add(initData.state);

const bothState = new Queue;
bothState.add(initData.state);
bothState.add(newData.state);

const emptyQueue = new Queue;

const reducer = reducers.loading;
const notTypes = (t) => !(t === types.LOADING_STARTED || t == types.LOADING_COMPLETE);
describe("reducer#loading", () => {
  describe("with an undefined initial state:", () => {
    it("LOADING_STARTED(newData) should return with the queue only loaded with data from the action", () => {
      const s = reducer(undefined, startActionNew);
      expect(s).toEqual(newState, "failed to get the right data from defined state");
    });
    it('LOADING_COMPLETE should throw an error', () => {
      expect(() => reducer(undefined, completeActionNew)).toThrow();
    });
  });
  describe("and an empty initial state", () =>  {
    it("LOADING_STARTED(newData) should return with the queue one record of data from the action", () => {
      const s = reducer(new Queue, startActionNew);
      expect(s).toEqual(newState, "failed to get the right data from empty quque")
    });
    it('LOADING_COMPLETE should throw an error', () => {
      expect(() => reducer(undefined, completeActionNew)).toThrow();
    });
  });
  describe("with an initial state (initState)", () => {
    it("LOADING_STARTED(newData) should return the queue both initData and newData", () => {
      expect(reducer(initState, startActionNew)).toEqual(bothState);
    });
    it("LOADING_COMPLETE(iniitalData) should return an empty Queue", () => {
      expect(reducer(initState, completeActionInit)).toEqual(emptyQueue);
    });
    // TODO: This seems incompatbile with the preivous unmatched completel_loading case.
    it("LOADING_COMPLETE(newData) should fail silently and not change the state", () => {
      expect(reducer(initState, completeActionNew)).toEqual(initState);
    });
    it('should not change state for actions other than COMPLETE_LOADING and START_LOADING', () => {
        Object.keys(types).filter((k) => notTypes(k)).forEach( (t) => {
          expect(reducer(initState, {type: types[t]})).toEqual(initState);
      });
    });
  });
 });
