import ECSPilot from './connection';

export default class DeepTask {
s
  static getDeepTasks(clusterName) {
    console.log("DeepTask:getDeepTasks", "clusterName:", clusterName);
    return ECSPilot.get("/deepTasks/" + clusterName);
  }
}
