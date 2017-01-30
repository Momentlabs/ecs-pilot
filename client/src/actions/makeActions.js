import uuidV1 from 'uuid/v4';
import { createAction } from 'redux-actions';


// wrap the create arugment function and add a uuid to each action call.
export const UUID_KEY = "uuid";
export function createActionUUID(type, f) {
    let creator = createAction(type, f);
    return function ()  {
      const id = uuidV1();
      let action = creator.apply(null, Array.from(arguments));
      action[UUID_KEY] = id;
      return action;
    };
}
