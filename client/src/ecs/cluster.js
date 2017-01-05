
import delay from './delay';
export const CLUSTER_ACTIVE = "ACTIVE";
export const CLUSTER_INACTIVE = "INACTIVE";

const clusters = [
  {
    activeServiceCount: 0,
    clusterName: "minecraft",
    pendingTasksCount: 0,
    registeredContainerInstanceCount: 0,
    runningTasksCount: 0,
    status: CLUSTER_INACTIVE
  },
  {
    activeServiceCount: 0,
    clusterName: "craft-staging",
    pendingTasksCount: 2,
    registeredContainerInstanceCount: 2,
    runningTasksCount: 8,
    status: CLUSTER_ACTIVE
  },
  {
    activeServiceCount: 0,
    clusterName: "minecraft-bungee",
    pendingTasksCount: 0,
    registeredContainerInstanceCount: 0,
    runningTasksCount: 0,
    status: CLUSTER_ACTIVE
  },
  {
    activeServiceCount: 0,
    clusterName: "craft-production",
    pendingTasksCount: 0,
    registeredContainerInstanceCount: 2,
    runningTasksCount: 9,
    status: CLUSTER_ACTIVE
  },
  {
    activeServiceCount: 1,
    clusterName: "log-production",
    pendingTasksCount: 0,
    registeredContainerInstanceCount: 1,
    runningTasksCount: 1,
    status: CLUSTER_ACTIVE
  }
];


export default class Cluster {
  static getClusters() {
    return new Promise((resolve) => {
      setTimeout( () => {
        resolve(Object.assign([], clusters));
      }, delay);
    });
  }

  static byName(clusters) {
    return clusters.sort((a,b) => {
      const an = a.clusterName;
      const bn = b.clusterName;
      return an < bn ? -1 : (bn < an ? 1  : 0);
    });
  }
}

