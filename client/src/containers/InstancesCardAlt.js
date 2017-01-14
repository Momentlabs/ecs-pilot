import React, { Component, PropTypes } from 'react';
// import { Link, IndexLink } from 'react-router';
import moment from 'moment';

import Instance, { usedCpuValue, remainingCpuValue , usedMemoryValue,
       remainingMemoryValue, percentUsedCpuValue, percentUsedMemoryValue } from '../ecs/instance';

import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Popover from 'material-ui/Popover/Popover';

import * as c from '../styles/colors';
import VictoryInlineGauge  from '../components/common/VictoryInlineGauge';

// Vertical center it and then keep it just to the right (but hard left against) the gauge.
const gaugeTextStyle = {marginTop:-45, marginBottom:0, marginLeft: 60, textAlign: "left" }

export default class InstancesCardAlt extends Component {

  constructor(props, context) {
    super(props, context);
    console.log("InstancesCard:constructor - props", props);
    // this.state = {instanceResponse: props.instanceResponse};
    this.state = {
      instancesResponse: undefined,
      cpuPopupOpen: false
    };

    this.componentWillMount = this.componentWillMount.bind(this);

    // this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.onActive = this.onActive.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
    this.handleCellHover = this.handleCellHover.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  // componentWillReceiveProps(nextProps) {
  //   // console.log("InstancesCard:componentWillReceiveProps - nextProps", nextProps);
  //   this.setState({instanceResponse: nextProps.instanceResponse});
  // }

  componentWillMount() {
    console.log("InstancesCard:componentWillMount - props", this.props);
    this.setState({
      instancesResponse: undefined
    });

    Instance.getInstances(this.props.clusterName)
    .then( (instancesResponse) => {
      console.log("InstanceCard:componentWillMount - promise success: got instance data from server.");
      let responseData = instancesResponse.data;
      console.log("InstanceCard:componentWillMount - promise success: response: ", instancesResponse);
      this.setState({instancesResponse: responseData});
    })
    .catch( (error) => {
      console.log("ClusterCard:componentWillMount(getInstances():PromiseResolution: Error", error);
      throw(error);
    });

  }

  componentDidMount() {
    console.log("InstancesCard:componentDidMount - State", this.state);
  }

  onActive() {
    console.log("InstancesCard:onActive() props:", this.props);
    this.setState({instanceResponse: this.props.instancesResponse});
  }

  handleCellHover(row, columnId) {
    console.log("Hover row:", row, "columnId", columnId);
  }

  handleCellClick(row, columnId) {
    console.log("Clicked row:", row, "columnId", columnId);
    // this.setState({cpuPopupOpen: true});
  }

  handleRequestClose() {
    this.setState({cpuPopupOpen: false});
  }

  resourceColors(rUsed, rRemain) {
    let usage = rRemain / (rUsed + rRemain);
    if (usage < 0.30) {
      return [c.resourceUsed, c.resourceLow];
    } else {
      return [c.resourceUsed, c.resourceOk];
    }
  }

  renderInstances() {
    console.log("InstancesCard:renderInstances() - State", this.state);
    let instances = [];
    if (this.state.instancesResponse !== undefined) {
      instances = this.state.instancesResponse.instances;
    }
    console.log("InstancesCard:rendering instances:",instances);

    return instances.map( (instance) => {
      const ci = instance.containerInstance;
      const ec2 = instance.ec2Instance;
      console.log("InstancesCard:rendering ci:", ci);
      console.log("InstancesCard:rendering ec2:", ec2);
      console.log("usedCpuValue:", usedCpuValue(ci));
      console.log("remainingCpuValue:", remainingCpuValue(ci));
      console.log("usedMemoryValue:", usedMemoryValue(ci));
      console.log("remainingMemoryValue:", remainingMemoryValue(ci));
      let uptime = moment.unix(ec2.launchTime).fromNow(true);
      // let cpuLabel = `${percentUsedCpuValue(ci)}% ${remainingCpuValue(ci)} available`;
      // let memoryLabel = `${percentUsedMemoryValue(ci)}% ${remainingMemoryValue(ci)} available`;
      let cpuLabel=`${percentUsedCpuValue(ci)} %`;
      let memoryLabel=`${percentUsedMemoryValue(ci)} %`;
       // Todo: figure out how to change the colors in the memory graphs based on %filled.

      return (
        <TableRow hoverable={true} key={ci.containerInstanceArn}>
          <TableRowColumn>{ec2.ipAddress}</TableRowColumn>
          <TableRowColumn>{ec2.placement.availabilityZone}</TableRowColumn>
          <TableRowColumn>{ec2.instanceType}</TableRowColumn>
          <TableRowColumn>{uptime}</TableRowColumn>
          <TableRowColumn>{ci.runningTasksCount}</TableRowColumn>
          <TableRowColumn>
            <VictoryInlineGauge
              data={[
                {type: "used", value: usedCpuValue(ci), label: "Used"}, 
                {type: "remaining", value: remainingCpuValue(ci), label: "Available"}
              ]}
              x="type"
              y={(datum) => datum.value} 
              colorScale={this.resourceColors(usedCpuValue(ci), remainingCpuValue(ci))}
            />
            <p style={gaugeTextStyle}>{cpuLabel}</p>
            <Popover open={this.state.cpuPopupOpen} onRequestClose={this.handleRequestClose}>
              <Card>
                <CardText>Hello World {ec2.ipAddress}</CardText>
              </Card>
            </Popover>
          </TableRowColumn>
          <TableRowColumn>
            <VictoryInlineGauge
              data={[
                {type: "used", value: usedMemoryValue(ci), label: "Used"}, 
                {type: "remaining", value: remainingMemoryValue(ci), label: "Available"}
              ]}
              x="type"
              y={(datum) => datum.value} 
              colorScale={this.resourceColors(usedMemoryValue(ci), remainingMemoryValue(ci))}
            /> 
            <p style={gaugeTextStyle}>{memoryLabel}</p>
          </TableRowColumn>
        </TableRow>
      );
    });
  }

  render() {
    console.log("InstanceCard:render() - State:", this.state);
    const  instancesResponse = this.state.instancesResponse;
    const  noInstances = (instancesResponse === undefined || instancesResponse.instances.length <= 0);
    let subTitle = "There are no instances in this cluster.";
    if (!noInstances) {
      subTitle = "There are " + instancesResponse.instances.length  + " instances in this cluster.";
    }
    return (
      <Card >
       <CardHeader title={"Instances"} subtitle={subTitle} actAsExpander={true} showExpandableButton={false} />
        <Table onCellHover={this.handleCellHover} onCellClick={this.handleCellClick}>
          <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Public Address</TableHeaderColumn>
              <TableHeaderColumn>Zone</TableHeaderColumn>
              <TableHeaderColumn>Type</TableHeaderColumn>
              <TableHeaderColumn>Uptime</TableHeaderColumn>
              <TableHeaderColumn>Tasks</TableHeaderColumn>
              <TableHeaderColumn>CPU</TableHeaderColumn>
              <TableHeaderColumn>Memory</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false} showRowHover={false}>
            {this.renderInstances()}
          </TableBody>
        </Table>n
      </Card>
    );
  }
}

InstancesCardAlt.propTypes = {
  // instanceResponse: PropTypes.object
  clusterName: PropTypes.string.isRequired,
  instancesResponse: PropTypes.object
};
