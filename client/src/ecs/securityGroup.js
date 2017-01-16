import ECSPilot from './connection';

export default class SecurityGroup {
  static getGroups(groupIds) {
    console.log("SecurityGroup:getGroups - groupIds:", groupIds, "joined:", groupIds.join());

    const url = "/security_groups?sgIds=" + groupIds.join();
    return ECSPilot.get(url);
  }
}
