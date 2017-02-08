import ECSPilot from './connection';


//
// Remote access.
//

// Returns a promise.
export default class Instance {
  static getInstances(clusterName) {
    // console.log("Instance():getInstances() Requesting instances for cluster:", clusterName);
    return ECSPilot.get("/instances/" + clusterName);
  }
}

//
// Access and helper functions.
//

//
// Container Instance Values
export const remainingCpuValue = (ci) => remainingCpu(ci).integerValue;
export const registeredCpuValue = (ci) => registeredCpu(ci).integerValue;
export const usedCpuValue = (ci) => registeredCpu(ci).integerValue - remainingCpu(ci).integerValue;
export const percentUsedCpuValue = (ci) => ((usedCpuValue(ci) / registeredCpuValue(ci))*100).toFixed(0);
export const percentRemainingCpuValue = (ci) => ((remainingCpuValue(ci) / registeredCpuValue(ci))*100).toFixed(0);

export const remainingMemoryValue = (ci) => remainingMemory(ci).integerValue;
export const registeredMemoryValue = (ci) => registeredMemory(ci).integerValue;
export const usedMemoryValue = (ci) => registeredMemory(ci).integerValue - remainingMemory(ci).integerValue;
export const percentUsedMemoryValue = (ci) => ((usedMemoryValue(ci) / registeredMemoryValue(ci))*100).toFixed(0);
export const percentRemainingMemoryValue = (ci) => ((remainingMemoryValue(ci) / registeredMemoryValue(ci))*100).toFixed(0);

export const registeredTcpPortsValue = (ci) => registeredPorts(ci).stringSetValue;
export const registeredUdpPortsValue = (ci) => registeredUdpPorts(ci).stringSetValue;
export const remainingTcpPortsValue = (ci) => remainingPorts(ci).stringSetValue;
export const remainingUdpPortsValue = (ci) => remainingUdpPorts(ci).stringSetValue;

// Objects
export const registeredCpu = (ci) => registeredResource(ci, "CPU");
export const registeredMemory = (ci) => registeredResource(ci, "MEMORY");
export const registeredPorts = (ci) => registeredResource(ci, "PORTS");
export const registeredUdpPorts = (ci) => registeredResource(ci, "PORTS_UDP");

// TODO: BUG WAITING TO HAPPEN - What happens when we can't 'find' 
// the resource (ie a name change or it's just not sent?
export const registeredResource = (ci, rName) => {
  return ci.registeredResources.find( (r) =>  r.name === rName );
};

export const remainingCpu = (ci) => remainingResource(ci, "CPU");
export const remainingMemory = (ci) => remainingResource(ci, "MEMORY");
export const remainingPorts = (ci) => remainingResource(ci, "PORTS");
export const remainingUdpPorts = (ci) => remainingResource(ci, "PORTS_UDP");
export const remainingResource = (ci, rName) => {
  return ci.remainingResources.find( (r) =>  r.name === rName );
};


// EC2 Values
export const securityGroups = (ec2) => ec2.groupSet; // returns an array of {groupId: string, groupName: string}

export const securityGroupIds = (instances) => {
  const groups = instances.map( (i) => securityGroups(i.ec2Instance));
  const flatGroups = [].concat.apply([], groups);
  return flatGroups.reduce( (accum, g) => {
    if (!accum.includes(g.groupId)) { // keep the list to unique values.
      accum.push(g.groupId);
    }
    return accum;
  }, []);
};

