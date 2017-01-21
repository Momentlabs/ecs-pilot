import * as types from './types';

export const requestSecurityGroups = (groupIds) => {
  console.log("action: ", types.REQUEST_SECURITY_GROUPS, "groupIds:", groupIds);
  return {type: types.REQUEST_SECURITY_GROUPS, groupIds: groupIds};
};

export const requestSecurityGroupsSuccess = (securityGroups) => {
  console.log("action: ", types.REQUEST_SECURITY_GROUPS_SUCCESS, "securityGroups", securityGroups);
  return {type: types.REQUEST_SECURITY_GROUPS_SUCCESS, securityGroups: securityGroups} ;
};

export const requestSecurityGroupsFailure = (error) => {
  return {type: types.REQUEST_SECURITY_GROUPS_FAILURE, error};
};