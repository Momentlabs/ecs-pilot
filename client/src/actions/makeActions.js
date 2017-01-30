import uuidV1 from 'uuid/v4';
import { createAction } from 'redux-actions';


// TODO: Consider chaning this to insert the ID directly into the payload.
// Enough has to change that I'm not going to do it straight-away,
// but it's probably the right-thing-to-do.
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
