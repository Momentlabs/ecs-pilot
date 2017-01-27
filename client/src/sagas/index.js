import { 
  watchLoaded,
  watchRequestFailiure,
  watchSelectCluster,
  watchRequestClusters, 
  watchRequestInstances, 
  watchRequestSecurityGroups,
  // watchRequestTasks,
  watchRequestDeepTasks,
} from '../sagas/serverData';

function*  startUp() {  
  yield console.log("Applicatiion: saga startup.");
}

export default function* rootSaga() {
  yield [ 
    startUp(), 
    watchLoaded(),
    watchRequestFailiure(),
    watchSelectCluster(),
    watchRequestClusters(), 
    watchRequestInstances(), 
    watchRequestSecurityGroups(),
    // watchRequestTasks(),
    watchRequestDeepTasks()
  ];
}
