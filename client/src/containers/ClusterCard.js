import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { securityGroupIds } from '../ecs/instance';

import Tasks from '../components/Tasks';
import InstancesCard from './InstancesCard';

import { Card, CardHeader } from 'material-ui/Card';

import * as instanceActions from '../actions/instance';
import * as deepTaskActions from '../actions/deepTask';


class ClusterCard extends React.Component {
  
  static defaultProps = {
    deepTasks: [],
    instances: [],
    securityGroups: [],
  }

  static propTypes = {
    actions: PropTypes.object.isRequired,
    cluster: PropTypes.object.isRequired,
    deepTasks: PropTypes.array,
    instances: PropTypes.array,
    securityGroups: PropTypes.array,
  }

  constructor(props, context) {
    super(props, context);
  }

  render() {
    // console.log("ClusterCard:render()","state:", this.state, "props", this.props);
    const {instances, securityGroups, deepTasks, cluster} = this.props;
    return (
      <Card style={{boxShadow: "unset"}}>
        <CardHeader style={{boxShadow: "unset"}} title={"Cluster: " + cluster.clusterName} subtitle={cluster.clusterArn} />
        <InstancesCard instances={instances} securityGroups={securityGroups} clusterName={cluster.clusterName}/>
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


// TODO: Probably loose this ....
const mapDispatchToProps = (dispatch, ownProps) => { 
  // console.log("ClusterCard#mapDispatchToProps", "ownProps:", ownProps);
  return ({actions: bindActionCreators([...instanceActions, ...deepTaskActions], dispatch)}); 
};

export default connect(mapStateToProps, mapDispatchToProps)(ClusterCard);


