import ECSPilot from './connection';

export default class DeepTask {

  static getDeepTasks(clusterName) {
    // console.log("DeepTask:getDeepTasks", "clusterName:", clusterName);
    return ECSPilot.get("/deepTasks/" + clusterName);
  }
}


// returns an object keyed on containerName
// value = {bindIP: string, continaerPort: int, hostPort: int, protocol: string}
// todo: consider making this smart enough to take a variety of obejcts (e.g. continers array)
export function containerBindings(dt) {
  const containers = dt.task.containers;
  let bindings = {};
  containers.forEach( (c) => bindings[c.name] = c.networkBindings);
  return bindings;
}

// ca is an object with keys of container names and arrays 
// of objectgs.
// rReturns an array of the same objects with containerName as an additional property.
function containerAggregateToArray(ca) {
  const containerNames = Object.keys(ca); 
  let a = [];
  containerNames.forEach( (cn) => {
    ca[cn].forEach( (e) => {
      e["containerName"] = cn;
      a.push(e);
    });
  });
  return a;
}

export const containerBindingsTableData = (dt) => {
  const bindings = containerAggregateToArray(containerBindings(dt));
  // const bindings = bindingsToArray(containerBindings(dt));
  const rows = bindings.map( (b) => [b.containerName, b.bindIP, b.containerPort, b.hostPort, b.protocol]);
  const header = ["Container", "IP", "Container", "Host", "Protocol"];
  return {header: header, rows: rows};
};

export function containerLinks(dt) {
  const cds = dt.taskDefinition.containerDefinitions;
  let links = {};
  cds.forEach( (c) => {if (c.links) links[c.name] = c.links;} );
  return links;
}

function linksToArray(links) {
  const containerNames = Object.keys(links);
  let linkArray = [];
  containerNames.forEach( (cn) => {
    links[cn].forEach( (l) => {
      if (l !== undefined) {
        let o = {};
        o['containerName'] = cn;
        o['link'] = l;
        linkArray.push(o);
      }
    });
  });
  return linkArray;
}

export function containerLinksTableData(dt) {
  const links = linksToArray(containerLinks(dt));
  const rows = links.map( (l) => [l.containerName, l.link]);
  const header = ["Container", "Link"];
  return {header: header, rows: rows}
}

function containerResources(dt) {
  const cds = dt.taskDefinition.containerDefinitions;
  let res = {};
  cds.forEach( (c) => res[c.name] = {containerName: c.name, cpu: c.cpu, memory: c.memory, memoryReservation: c.memoryReservation});
  return res;
}

export function containerResourceTableData(dt) {
  const header= ['Contaainer', 'CPU', 'Memory', 'Memory Reservation'];
  const resources = containerResources(dt);
  const cNames = Object.keys(resources);
  const rows = cNames.map( (n) => [resources[n].containerName, resources[n].cpu, resources[n].memory, resources[n].memoryReservation]);
  // Now add a total
  const totals = rows.reduce( (t, r) => { 
    return ["total", {value: t[1].value + r[1]}, {value: t[2].value + r[2]}, {value: t[3].value + r[3]}]
  }, ["total", {value: 0}, {value: 0}, {value: 0}]);
  rows.push(totals);
  return {header: header , rows: rows};
}

function containerULimits(dt) {
  const cds = dt.taskDefinition.containerDefinitions;
  let uls = {}
  cds.forEach( (c) => {
    const ul = c.ulimit;
    if (ul !== undefined) {
      uls[c.name] = {
        containerName: c.name, 
        limitName: ul.name, 
        softLimit: ul.softLimit, 
        hardLimit: ul.hadLimit
      };
    } else {
      uls[c.name] = undefined;
    }
  });
  return uls;
}

export function containerULimitsTableData(dt) {
  const header = ['Contianer', "ULIMIT", "Soft Limit", "Hard Limit"];
  const limits = containerULimits(dt);
  const cNames = Object.keys(limits);
  const rows = cNames.map( (n) => {
    if (limits[name] !== undefined) {
      return [limits.containerName, limits.LimitName, limits.softLimit, limits.hardLimit];
    } else {
      return [n, "No limits defined"];
    }
  });
  return {header: header, rows: rows};
}

// A clusters worth of deepTasks
export function totalContainers(deepTasks) {
  return deepTasks.reduce( (ct, dt) => {
    return ct + dt.task.containers.length;
  },0);
}
export function runningContainers(deepTasks) {
  return deepTasks.reduce( (ct, dt) => {
    return ct + dt.task.containers.reduce( (rt, c) => {return (rt + (c.lastStatus === "RUNNING" ? 1 : 0));}, 0);
  }, 0);
}

export function containerEnvironment(deepTask) {
  console.log("containerEnvironment()", "deepTask:", deepTask);
  const overrides = deepTask.task.overrides.containerOverrides.reduce( (ors, or) => {
    if (or.environment) {
      or.environment.forEach( (env) => {
        env.container = or.name; // add the containerName to the environment variable.
        ors.push(env);
      });
    }
    return ors;
  }, []);

  let environment = deepTask.taskDefinition.containerDefinitions.reduce( (envs, cd) => {
    cd.environment.forEach( (env) => {
      env.container = cd.name; // as above.
      envs.push(env);
    });
    return envs;
  },[]);

  // Add each overide to the environment, with the override.value mapped to e.override.
  overrides.forEach( (or) => { 
    let env = environment.find( (e) => (e.container === or.container && e.name === or.name));
    if (env) {
      env.override = or.value;
    } else {
      environment.push({container: or.container, name: or.name, value: undefined, override: or.value});
    }
  });
  return environment;
}

export function containerEnvironmentTableData(deepTask) {
  return containerEnvironment(deepTask).map( (e) => [e.container, e.name, e.value, e.override]);
}

