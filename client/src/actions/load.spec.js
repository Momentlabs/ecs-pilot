import expect from 'expect';
import * as loadActions from './load';
import { UUID_KEY } from './makeActions';

describe("Loading Actions:", () => {
  const startAction = loadActions.startLoading("clusters");
  describe("startLoading(what) ", () =>  {

    it('should create an action with the correct shape and values', () => {
      expect(startAction).toIncludeKeys(['payload', UUID_KEY, 'type'], "missing keys");
      expect(startAction.payload).toIncludeKeys(['what', 'when'], "missing payload keys");
      expect(startAction.payload.what).toBe("clusters", "'what' value is incorrect");
    });
  });

  describe("completeLoading(id)", () => {

    const completeAction = loadActions.completeLoading(startAction[UUID_KEY]);
    it("should create an action with the correct shape and container the id as", () => {
        expect(completeAction).toIncludeKeys(['payload', 'type'], "wrong action keys");
        expect(completeAction.payload).toBe(startAction[UUID_KEY], "payload value is incorrect");
    });
  });

});

