import ECSPilot from './connection';

export default class Task {
  static getTasks(clusterName) {
    // console.log("Task:getTasks - requesting tasks for cluster:", clusterName);
    return ECSPilot.get("/tasks/" + clusterName);
  }
}