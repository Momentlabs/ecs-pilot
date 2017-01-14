import React, { Component, PropTypes } from 'react';
// import { Link, IndexLink } from 'react-router';
import moment from 'moment';

import {shortArn} from '../helpers/aws';
import * as c from '../styles/colors';

// React Components
import Instance, { usedCpuValue, usedMemoryValue, 
       registeredCpuValue,registeredMemoryValue,
       remainingCpuValue, remainingMemoryValue} from '../ecs/instance';

import { Card, CardTitle } from 'material-ui/Card';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Paper from 'material-ui/Paper';

import RechartGauge from '../components/common/RechartGauge';
import MetricBox from '../components/common/MetricBox';


export default class InstancesCard extends Component {


  static contextTypes  = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor(props, context) {

    super(props, context);
    // console.log("InstancesCard:constructor - props", props);
    // this.state = {instanceResponse: props.instanceResponse};
    this.state = {
      instancesResponse: undefined,
      cpuPopupOpen: false
    };

    this.componentWillMount = this.componentWillMount.bind(this);

    this.handleExpandedChange = this.handleExpandedChange.bind(this);
    this.renderInstance = this.renderInstance.bind(this);
    this.renderInstanceDetail = this.renderInstanceDetail.bind(this);
    this.renderGauges = this.renderGauges.bind(this);
  } 


  componentWillMount() {
    this.setState({
      instancesResponse: undefined
    });

    Instance.getInstances(this.props.clusterName)
    .then( (instancesResponse) => {
      let responseData = instancesResponse.data;
      // console.log("InstanceCard:componentWillMount - promise success: response: ", instancesResponse);
      this.setState({instancesResponse: responseData});
    })
    .catch( (error) => {
      // console.log("ClusterCard:componentWillMount(getInstances():PromiseResolution: Error", error);
      throw(error);
    });

  }

  handleExpandedChange(expanded) {
    this.setState({expanded: expanded});
  }

  // TODO: Is this a general helper?
  resourceColors(rUsed, rRemain) {
    const lowLevel = 0.15;
    const warnLevel = 0.33;
    const usage = rRemain / (rUsed + rRemain);

    if (usage < lowLevel) {
      return [c.resourceUsed, c.resourceLow];
    } else if (usage < warnLevel) {
      return [c.resourceUsed, c.resourceWarn];
    } else {
      return [c.resourceUsed, c.resourceOk];
    }
  }

  renderInstance(instance) {
    const ci = instance.containerInstance;
    const ec2 = instance.ec2Instance;
    return(
        <Card key={ci.containerInstanceArn} style={{marginBottom: "0em"}} expanded={this.state.expanded} onExpandChange={this.handleExpandChange} >
          <CardTitle actAsExpander showExpandableButton 
            title={ec2.privateIpAddress} 
            subtitle={`Public IP: ${ec2.ipAddress}`}
            children={this.renderGauges({ci: ci, ec2: ec2})}
          />
          <Card expandable >
            {this.renderInstanceDetail(instance)}
          </Card>
        </Card>
    );
  }

  renderGauges({ci, ec2}) {
    let uptime = moment.unix(ec2.launchTime).fromNow(true);
    const cpuColors=this.resourceColors(usedCpuValue(ci), remainingCpuValue(ci));
    const memColors=this.resourceColors(usedMemoryValue(ci), remainingMemoryValue(ci));
    const gaugeSize=60;
    const metricSize=86;
    const space=120;
    const metricSpace = space + 7;
    const offset=690;
    const oR = 30;
    const iR = (oR -6);

    // TODO: Fix the tool-tips on this. They look horrible.
    // TODO: This container could be factored to an iteration with the index multipllying the space paramater.
    // If I can get to childrens props, then I mway want to put the whole thing in new ccontainer component to mange
    // these things.
    // TODO: Fix the collapse. It doesn't work right, so were definitely NOT responsive.
    const styles={
      container: {
        height: 14,
        outline: "0px solid blue"
      },
    };
    return(
      <div style={styles.container}>
        <MetricBox title="Tasks" metric={ci.runningTasksCount} size={metricSize} rightAnchor={offset} />
        <MetricBox title="Uptime" metric={uptime} size={metricSize} rightAnchor={offset} space={metricSpace} metricFontSize={'medium'}/>
        <MetricBox title="Instance" metric={ec2.instanceType} size={metricSize} rightAnchor={offset} space={2*metricSpace}  metricFontSize={'small'} />
        <MetricBox title="Zone" metric={ec2.placement.availabilityZone} size={metricSize} rightAnchor={offset} space={3*metricSpace}  metricFontSize={'small'} />
        <RechartGauge title={'CPU'} rightOffset={offset} cx={4*space} size={gaugeSize} innerRadius={iR} outerRadius={oR} colors={cpuColors} amount={usedCpuValue(ci)} total={registeredCpuValue(ci)}/>
        <RechartGauge title ={'Memory'} rightOffset={offset} cx={5*space} size={gaugeSize} innerRadius={iR} outerRadius={oR} colors={memColors} amount={usedMemoryValue(ci)} total={registeredMemoryValue(ci)}/>
      </div>
    );
  }

  renderInstanceDetail(instance) {
    let ci = instance.containerInstance;
    let ec2 = instance.ec2Instance;
    return(
      <Table >
        <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Instance ID</TableHeaderColumn>
            <TableHeaderColumn>VPC ID</TableHeaderColumn>
            <TableHeaderColumn>Subnet</TableHeaderColumn>
            <TableHeaderColumn>ImageID</TableHeaderColumn>
            <TableHeaderColumn>ImageArch</TableHeaderColumn>
            <TableHeaderColumn>IAM Profile</TableHeaderColumn>
            <TableHeaderColumn>KeyName</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover={false}>
          <TableRow key={ci.containerInstanceArn} hoverable={false} >
            <TableRowColumn>{ec2.instanceId}</TableRowColumn>
            <TableRowColumn>{ec2.vpcId}</TableRowColumn>
            <TableRowColumn>{ec2.subnetId}</TableRowColumn>
            <TableRowColumn>{ec2.imageId}</TableRowColumn>
            <TableRowColumn>{ec2.architecture}</TableRowColumn>
            <TableRowColumn>{shortArn(ec2.iamInstanceProfile.arn)}</TableRowColumn>
            <TableRowColumn>{ec2.keyName}</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  render() {
    // console.log("InstanceCard:render() - State:", this.state);
    const  instancesResponse = this.state.instancesResponse;
    const  noInstances = (instancesResponse === undefined || instancesResponse.instances.length <= 0);
    let instances = [];
    if (!noInstances) {instances= instancesResponse.instances;}
    // console.log("InstanceCard:render() = instances", instances);
    return (
      <Paper >
        {instances.map( (instance) => this.renderInstance(instance))}
     </Paper>
     );
  }
}

InstancesCard.propTypes = {
  clusterName: PropTypes.string.isRequired,
  instancesResponse: PropTypes.object
};

