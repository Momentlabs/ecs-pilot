import { watchRequestClusters, watchRequestInstances, watchRequestSecurityGroups } from '../sagas/serverData';

function*  startUp() {  
  yield console.log("Applicatiion: saga startup.");
}

export default function* rootSaga() {
  yield [ startUp(), watchRequestClusters(), watchRequestInstances(), watchRequestSecurityGroups()];
}
