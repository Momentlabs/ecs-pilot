import ECSPilot from './connection';

export default class SecurityGroup {
  static getGroups(groupIds) {
    // console.log("SecurityGroup:getGroups - groupIds:", groupIds, "joined:", groupIds.join());

    const url = "/security_groups?sgIds=" + groupIds.join();
    return ECSPilot.get(url);
  }
}

// use eg: perms = ipPermsByProto(sg.ipPermissionsEgress);
// The return object index is the ipProtocol value that
// is stored in the perms in the array that is passed in.
// It's not the name of the protocol (in particular the value -1 corresponds to the name "all");
export function permEntriesByProto(perms) {

  // console.log("permEntriesByProto", "perms:", perms);
  const byProto = perms.reduce( (res, perm) => {
      // console.log("permEntriesByProto", "res:", res, "perm:", perm);
      const proto = perm.ipProtocol;
      const entry = makeEntry(perm);
      let entries = res[proto];
      if (entries) {
        entries.push(entry);
      } else {
        res[proto] = [entry];
      }
      return res;
  }, {});
  // console.log("permEntriesByProto", "return:", byProto);
  return byProto;
}

function makeEntry(perm) {
  const proto = perm.ipProtocol;
  const protoName = (proto === "-1") ? "All Protocols" : proto;
  const ps = portString(perm);
  let perms = permStrings(perm);

  return {
    proto: protoName,
    portString: ps,
    permissions: perms
  };
}

function portString(perm) {
  let ps = "all ports";
  if (perm.hasOwnProperty("fromPort")) {
    ps = perm.fromPort;
    if(perm.hasOwnProperty("toPort")) {
      ps = (perm.fromPort === perm.toPort) ? ps : ps + "-" + perm.toPort;
    }
  }
  return ps;
}

function permStrings(perm) {
  return (perm.ipRanges.length <= 0) ? ["empty range"] : perm.ipRanges.map( (r) => r.cidrIp);
}