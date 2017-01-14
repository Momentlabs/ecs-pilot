import ECSPilot from './connection';

export default class DeepTask {

  static getDeepTasks(clusterName) {
    console.log("Requesting deepTasks");
    return ECSPilot.get("/deepTasks/" + clusterName);
  }
}