import { 
  watchLoaded,
  watchRequestFailiure,
  watchRequestSessionId,
  watchSelectCluster,
  watchRequestAll,
  watchRequestClusters, 
  watchRequestInstances, 
  watchRequestSecurityGroups,
  // watchRequestTasks,
  watchRequestDeepTasks,
} from '../sagas/serverData';

import { watchAuth } from '../sagas/auth';

function*  startUp() {  
  yield console.log("Applicatiion: saga startup."); // eslint-disable-line no-console
}

export default function* rootSaga() {
  yield [ 
    startUp(),
    watchAuth(),
    watchLoaded(),
    watchRequestFailiure(),
    watchRequestSessionId(),
    watchSelectCluster(),
    watchRequestAll(),
    watchRequestClusters(), 
    watchRequestInstances(), 
    watchRequestSecurityGroups(),
    // watchRequestTasks(),
    watchRequestDeepTasks()
  ];
}
