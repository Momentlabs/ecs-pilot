import { combineReducers } from 'redux';

import { clusters, instances, securityGroups } from './serverData';

export default combineReducers({instances, clusters, securityGroups});

