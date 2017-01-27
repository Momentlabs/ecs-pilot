import axios from 'axios';

class ECSPilot {
  static new() {
    return axios.create({
      baseURL: 'http://localhost:8080/',
      timeout: 4000, // there is one particularly long request for DeepTasks.
    });
  }
}

const connection = ECSPilot.new();

// Usualy use is: 
//      import ECSPilot from "./connection".
// So you can say: 
//      ECSPilot.get("/apipoint");
export default connection;
