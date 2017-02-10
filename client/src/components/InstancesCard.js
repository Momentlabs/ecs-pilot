import React, { Component, PropTypes } from 'react';

import moment from 'moment';

import { shortArn } from '../helpers/aws';
import { KeyGenerator } from '../helpers/ui';
import { uptimeString } from '../helpers/time';
import * as c from '../styles/colors';

import {  usedCpuValue, usedMemoryValue, 
          registeredCpuValue,registeredMemoryValue,
          remainingCpuValue, remainingMemoryValue, 
          registeredTcpPortsValue, registeredUdpPortsValue,
          remainingTcpPortsValue, remainingUdpPortsValue
        } from '../ecs/instance';

//
// React Components
//
import { Card, CardTitle } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import { ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import ContainerInstanceResourceCard from './ContainerInstanceResourceCard';
import DetailCard from './common/DetailCard';
import FlexContainer from './common/FlexContainer';
import RechartGauge from './common/RechartGauge';
import MetricBox from './common/MetricBox';
import ItemPair from './common/ItemPair';

// TODO: Clean this mess up. this is a disaster ......

// TODO: Add a disk detail card. (e.g. root device data, and blockDeviceMapping data.)
export default class InstancesCard extends Component {

  static contextTypes  = {
    muiTheme: PropTypes.object.isRequired
  }

  static defaultProps = {
    instances: [],
    securityGroups: [],
  }

  static propTypes = {
    actions: PropTypes.object,
    instances: PropTypes.array,
    securityGroups: PropTypes.array,
    clusterName: PropTypes.string.isRequired,
  };

  constructor(props, context) {

    super(props, context);
    this.state = {
      // TODO: This should be expanded?
      cpuPopupOpen: false,
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.handleExpandedChange = this.handleExpandedChange.bind(this);
    this.renderInstanceDetals = this.renderInstanceDetails.bind(this);
    this.renderDetailCards = this.renderDetailCards.bind(this);
    this.renderGauges = this.renderGauges.bind(this);
    this.renderResources = this.renderResources.bind(this);
    this.renderInstanceDetails = this.renderInstanceDetails.bind(this);
    this.renderSecurityGroup = this.renderSecurityGroup.bind(this);
  } 

  componentWillMount() {
    // this.props.actions.requestInstances(this.props.clusterName);
  }

  handleExpandedChange(expanded) {
    this.setState({expanded: expanded}); // this is broken but works!?!
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

  renderInstanceBar(instance, securityGroups) {
    const ci = instance.containerInstance;
    const ec2 = instance.ec2Instance;
    return(
        <Card key={ci.containerInstanceArn} 
              // TODO: these magic numbers have got to go.
              style={{paddingLeft: 21, paddingRight: 20, paddingBottom: 8, boxShadow: "unset"}} 
              expanded={this.state.expanded} // this is broken but works?
              onExpandChange={this.handleExpandChange} >
          <CardTitle actAsExpander showExpandableButton 
            style={{boxShaodw: "unset", outline: `2px solid ${c.expandableOutlineColor}`}}
            title={ec2.privateIpAddress} 
            subtitle={`Public IP: ${ec2.ipAddress}`}
            children={this.renderGauges({ci: ci, ec2: ec2})}
          />
          <Card expandable >
            {this.renderDetailCards(instance, securityGroups)}
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
    // TODO: This needs to be redone. It should be set up as a flex box with out the shenanigens of position 
    // used by the components.
    // TODO: This container could be factored to an iteration with the index multipllying the space paramater.
    // If I can get to childrens props, then I mway want to put the whole thing in new ccontainer component to mange
    // these things.
    // TODO: Fix the collapse. It doesn't work right, so were definitely NOT responsive.
    const styles={
      container: {
        height: 14,
        // outline: "1px solid blue"
      }
    };
    return(
      <div style={styles.container}>
        <MetricBox title="Tasks" metric={ci.runningTasksCount} size={metricSize} rightAnchor={offset} />
        <MetricBox title="Uptime" metric={uptime} size={metricSize} rightAnchor={offset} space={metricSpace} metricFontSize={'medium'}/>
        <MetricBox title="Instance" metric={ec2.instanceType} size={metricSize} rightAnchor={offset} space={2*metricSpace}  metricFontSize={'medium'} />
        <MetricBox title="Zone" metric={ec2.placement.availabilityZone} size={metricSize} rightAnchor={offset} space={3*metricSpace}  metricFontSize={'medium'} />
        <RechartGauge title={'CPU'} rightOffset={offset} cx={4*space} size={gaugeSize} innerRadius={iR} outerRadius={oR} colors={cpuColors} amount={usedCpuValue(ci)} total={registeredCpuValue(ci)}/>
        <RechartGauge title ={'Memory'} rightOffset={offset} cx={5*space} size={gaugeSize} innerRadius={iR} outerRadius={oR} colors={memColors} amount={usedMemoryValue(ci)} total={registeredMemoryValue(ci)}/>
      </div>
    );
  }


  itemHeader(title) { return <Subheader style={{color: c.metricTitle, paddingTop: "1m"}} key={title}>{title}</Subheader>; }
  itemResource(port) {
    return <ListItem disabled key={port} style={{textAlign: "right"}} primaryText={port} />;
  }
  itemHeaderPair(title, value, key) { 
    const keyValue = key ? key : value;
    return <ListItem disabled key={keyValue} primaryText={<ItemPair firstItemHeader itemOne={title} itemTwo={value}/>}/>;
  }


  renderResources(tcp, udp, cpu, memory) {
    let items = [];

    // CPU
    items.push(this.itemHeaderPair("CPU", cpu));

    // Memory
    items.push(this.itemHeaderPair("Memory", memory));

    // Ports
    if (tcp.length <= 0) {
      items.push(this.itemHeader("No TCP ports exposed"));
    } else {
      items.push(this.itemHeaderPair("TCP", tcp[0]));
      tcp.slice(1).map((port) => items.push(this.itemResource(port)));
    }

    if (udp.length <= 0) {
      items.push(this.itemHeader("No UDP ports exposed"));
    } else {
      items.push(this.itemHeaderPair("UDP", udp[0]));
      udp.slice(1).map((port) => items.push(this.itemResource(port)));
    }

    return(items);
  }

  renderNetworkItems(ci, ec2) {
    let kg = new KeyGenerator;
    let items = [];
    items.push(this.itemHeader("Public Network"));
    items.push(<Divider key={kg.nextKey()} />);
    items.push(this.itemHeaderPair("Public IP", ec2.ipAddress));

    items.push(this.itemHeader("Virtual Private Network"));
    items.push(<Divider key={kg.nextKey()} />);
    items.push(this.itemHeaderPair("Private IP", ec2.privateIpAddress));
    items.push(this.itemHeaderPair("VPC ID", ec2.vpcId));
    items.push(this.itemHeaderPair("SubNet", ec2.subnetId));

    let sg = ec2.groupSet;
    if (sg.length <= 0) {
      items.push(this.itemHeader("No security groups"));
    } else {
      items.push(this.itemHeader("Security Groups"));
      items.push(<Divider key={kg.nextKey()} />);
      sg.map((g) => items.push(this.itemHeaderPair(g.groupName, g.groupId)));
    }
    return(items);
  }

  renderInstanceDetails(ci, ec2) {
    let kg = new KeyGenerator;
    let items = [];
    items.push(this.itemHeaderPair("Launch Time", moment.unix(ec2.launchTime).toISOString()));
    items.push(this.itemHeaderPair("Uptime", uptimeString(ec2.launchTime)));
    items.push(this.itemHeaderPair("EC2 Instance ID", ec2.instanceId));
    items.push(this.itemHeaderPair("Container ARN", shortArn(ci.containerInstanceArn)));

    items.push(this.itemHeader("AMI"));
    items.push(<Divider key={kg.nextKey()}/>);
    items.push(this.itemHeaderPair("AMI ID", ec2.imageId));
    items.push(this.itemHeaderPair("Image Arch", ec2.architecture));

    items.push(this.itemHeader("IAM"));
    items.push(<Divider key={kg.nextKey()}/>);
    items.push(this.itemHeaderPair("Profile", shortArn(ec2.iamInstanceProfile.arn)));
    items.push(this.itemHeaderPair("Key", ec2.keyName));
    return(items);
  }

  renderSecurityGroup(g) {
    let items = [];
    const renderPermissions = (perms) => {
      // Group the permmisions by protocol
      // byProto key: protocol, value: permission
      let byProto = {};
      perms.forEach( (perm) => {
        const proto = perm.ipProtocol;
        let entry = byProto[proto];
        if (entry) {
          entry.push(perm); // already had an array for this protocol, add the perms
        } else {
          byProto[proto] = [perm]; // need a new array for the new protocol.
        }
      });

      // Iterate over each protocol.
      Object.keys(byProto).forEach( (proto) => { 
        const perms = byProto[proto];
        const protoName = (proto === "-1") ? "All Protocols" : proto;

        // Displpay protocol as header and then the pairs of port and cidr restrictions.
        items.push(this.itemHeader(protoName)); 
        perms.forEach( (perm) =>  {
          // The special case of all ports is handled by the absence
          // absence of port names in the object.
          const ipRanges = perm.ipRanges;
          let portString = "all ports";
          if ( perm.hasOwnProperty("fromPort")) { 
            portString = perm.fromPort;
            if (perm.hasOwnProperty("toPort")) {
              portString = (perm.fromPort === perm.toPort) ? portString :  portString + "-" + perm.toPort;
            }
          }

          // Display port/cidr pairs, only displaying the port once on the left,
          // the first cidr on immediate right of the port, remaining related cidrs
          // on the right with no port on the left:``
          // e.g.
          // 22                 0.0.0.0/0
          // 20514        172.31.48.00/22
          //               172.31.60.0/22
          const keyValue=protoName + "-" + portString;
          if (ipRanges.length <= 0) { 
            items.push(this.itemHeaderPair(portString, "empty range", keyValue));
          } else {
            items.push(this.itemHeaderPair(portString, ipRanges[0].cidrIp, keyValue));
            let i = 0;
            ipRanges.slice(1).forEach( (r) => {
              const key = keyValue + i++;
              items.push(this.itemHeaderPair("", r.cidrIp, key));
            });
          }
        });
      });
      return(items);
    };

    // Render
    let kg = new KeyGenerator;
    items.push(this.itemHeaderPair("Owner Id", g.ownerId));
    items.push(this.itemHeaderPair("VPC Id", g.vpcId));

    items.push(this.itemHeader("Ingress"));
    items.push(<Divider key={kg.nextKey()}/>);
    renderPermissions(g.ipPermissions);

    items.push(this.itemHeader("Egress"));
    items.push(<Divider key={kg.nextKey()} />);
    renderPermissions(g.ipPermissionsEgress);

    return(items);
  }

  renderDetailCards(instance, securityGroups) {
    let kg = new KeyGenerator;
    // console.log("InstancesCard:renderDetailCards - instance", instance, "groups", securityGroups);
    let ci = instance.containerInstance;
    let ec2 = instance.ec2Instance;
    const cardWidth = 200;
    return(
      <div >
        <FlexContainer flexWrap="wrap" alignItems="stretch" justifyContent="space-between">
          <DetailCard key={kg.nextKey()} width={Math.ceil(3*cardWidth)} title="Container Instance" subtitle={`${ec2.instanceType} in ${ec2.placement.availabilityZone}`}>
            {this.renderInstanceDetails(ci, ec2)}
          </DetailCard>
          <DetailCard key={kg.nextKey()} width={2*cardWidth} title="Network" >
            {this.renderNetworkItems(ci, ec2)}
          </DetailCard>
          {securityGroups.map( (sg) => <DetailCard key={kg.nextKey()} width={2*cardWidth} title="Security Group" subtitle={sg.groupName} >{this.renderSecurityGroup(sg)}</DetailCard>)}
          <ContainerInstanceResourceCard instance={instance} />
        </FlexContainer>
      </div>
    );
  }

  render() {
    // console.log("InstancesCard:render()", "state:", this.state, "props:", this.props);
    // const {securityGroups } = this.pr;
    const { instances, securityGroups } = this.props;
    return (
      <Paper style={{boxShadow: "unset"}}>
        {instances.map( (instance) => this.renderInstanceBar(instance, securityGroups) )}
     </Paper>
     );
  }
}


