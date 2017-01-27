import * as types from './types';

export const reportError = (error) => {
  const action = {type: types.REPORT_ERROR, error};
  console.log("action:", action);
  // const newMessage = message + ": " + error.message;
  // error.message = newMessage;
  return action;
};
