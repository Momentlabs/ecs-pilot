import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { securityGroupIds } from '../ecs/instance';

import ClusterStatusCard from '../components/ClusterStatusCard';
import Instances from '../components/Instances';
import Tasks from '../components/Tasks';

import { Card } from 'material-ui/Card';

// TODO: Make this pure 
class ClusterCard extends React.Component {
  
  static defaultProps = {
    deepTasks: [],
    instances: [],
    securityGroups: [],
  }

  static propTypes = {
    cluster: PropTypes.object.isRequired,
    deepTasks: PropTypes.array,
    instances: PropTypes.array,
    securityGroups: PropTypes.array,
  }

  render() {
    // console.log("ClusterCard:render()","state:", this.state, "props", this.props);
    const {instances, securityGroups, deepTasks, cluster} = this.props;
    return (
      <Card style={{boxShadow: "unset"}}>
        <ClusterStatusCard  cluster={cluster} instances={instances} deepTasks={deepTasks} />
        <Instances instances={instances} securityGroups={securityGroups} clusterName={cluster.clusterName} />
        <Tasks deepTasks={deepTasks} style={{dropShadow: "unset"}} clusterName={cluster.clusterName} />
      </Card>
    );
  }
}

const mapStateToProps = (state, ownProps) => { 
  // console.log("ClusterCard#mapStateToProps - entry","state:", state, ownProps);
  const {cluster} = ownProps;
  const clusterName = cluster.clusterName;
  const instances = state.instances[clusterName] ? state.instances[clusterName] : [];
  const securityGroups = securityGroupIds(instances).reduce( (sgs, sgId) => {
    const sg = state.securityGroups[sgId];
    if(sg) { sgs.push(sg); }
    return(sgs);
  }, []);
  return ({
    instances: instances,
    securityGroups: securityGroups,
    deepTasks: state.deepTasks[cluster.clusterName]
  }); 
};

export default connect(mapStateToProps)(ClusterCard);

