/*
 * There are elements to the protocol that the UI currently needs
 *
 * = DATA ACTIONS
 *
 * REQUEST_CLUSTERS
 * Causes a list of clusters to get loaded into the databse from
 * the server.
 *
 * SELECT_CLUSTER
 * Loads the rest of the data assocaited with the selected cluster.
 * and adds this cluster to the select list.
 *
 * DESELECT_CLUSTER
 * Removes this cluster from the select list. DOES NOT CHANGE ANY OTHER INTERNAL STATE.
 * This means that the state for the deselected server is kept.
 *
 * REQUEST_ALL
 * Requests all data assocaited with the selected clusters (thik of this as updte after a select).
 *
 *
 * = AUTHORIZATION ACTIONS
 *
 * SHOW_LOGIN (LOGIN?)
 *
 * The remaining protocol elements are used by sagas to 
 * generate the rest of the calls for the data to come along.
 * 
 *
*/

// It may be a good idea to actually change the protocol
// to put error in the name.
export const matchErrorActions = (action) => {
  const failRE  = /.*FAILURE/
  return failRE.test(action.type);
};


// Server Data Protocol
export const REPORT_ERROR = "REPORT_ERROR";
export const REPORTED_ERROR = "REPORTED_ERROR";

export const SELECT_CLUSTER = "SELECT_CLUSTER";
export const SELECT_CLUSTER_FAILURE = "SELECT_CLUSTER_FAILURE";
export const DESELECT_CLUSTER = "DESELECT_CLUSTER";

export const REQUEST_ALL = "REQUEST_ALL";
export const REQUEST_ALL_FAILURE = "REQUEST_ALL_FAILURE";

export const REQUEST_CLUSTERS = "REQUEST_CLUSTERS";
export const LOADED_CLUSTERS = "LOADED_CLUSTERS";

export const REQUEST_INSTANCES = "REQUEST_INSTANCES";
export const LOADED_INSTANCES = "LOADED_INSTANCES";

export const REQUEST_SECURITY_GROUPS = "REQUEST_SECURITY_GROUPS";
export const LOADED_SECURITY_GROUPS = "LOADED_SECURITY_GROUPS";

export const REQUEST_DEEP_TASKS = "REQUEST_DEEP_TASKS";
export const LOADED_DEEP_TASKS = "LOADED_DEEP_TASKS";

export const LOADING_STARTED = "LOADING_STARTED";
export const LOADING_COMPLETE = "LOADING_COMPLETE";


// Login Protocol
export const INIT_AUTH = "INIT_AUTH";
export const SHOW_LOGIN = "SHOW_LOGIN";

