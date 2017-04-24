import React, { PropTypes } from 'react';

import moment from 'moment';
import { registeredCpuValue,registeredMemoryValue,
         remainingCpuValue, remainingMemoryValue,
         usedCpuValue, usedMemoryValue,
         registeredTcpPortsValue, registeredUdpPortsValue,
         remainingTcpPortsValue, remainingUdpPortsValue
       } from '../ecs/instance';

import { permEntriesByProto } from '../ecs/securityGroup';
import { KeyGenerator, mergeStyles } from '../helpers/ui';


import * as defaultStyles from '../styles/default';
import { shortArn } from '../helpers/aws';
import { uptimeString } from '../helpers/time';

import Card from 'material-ui/Card';
import Bar from './common/Bar';
import MetricGrid from './common/MetricGrid';
import GridTitle from './common/GridTitle';
import FlowedMetric from './common/FlowedMetric';
import GuageRechart from './common/GuageRechart'; // TODO: OH FOR GODS SAKE RENAME THIS.

export default class InstanceBar extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    instance: PropTypes.object,
    securityGroups: PropTypes.array,
  };

  static defaultProps = {
    style: {},
    instances: {},
    securityGroups: []
  };

  constructor(props, context) {
    super(props, context);

    this.handleExpanded = this.handleExpanded.bind(this);
    this.renderPerm = this.renderPerms.bind(this);
    this.renderSg = this.renderSg.bind(this);
    this.state = {
      expanded: false
    };
  }

  handleExpanded(newExpanded) {
    // console.log("InstanceBar:handleExpanded", "newExpanded:", newExpanded);
    this.setState({
      expanded: newExpanded
    });
  }

  renderPerms(permsByProto) {
    let permElements = [];
    Object.keys(permsByProto).forEach( (proto) => {
      const entries = permsByProto[proto];
      const protoName = (entries.length > 0) ? entries[0].proto : "undefined";
      permElements.push(<GridTitle sub3 title={protoName} />);
      entries.forEach( (entry) => {
        entry.permissions.forEach( (perm) => { 
          permElements.push(<FlowedMetric title={entry.portString} value={perm}/>);
        });
      });
    });
    return permElements;
  }

  renderSg(sg) {
    // console.log("InsatnceBar:renderSg", "sg", sg);
    const egressByProto = permEntriesByProto(sg.ipPermissionsEgress);
    const ingressByProto = permEntriesByProto(sg.ipPermissions);
    let gridEntries = [];
    gridEntries.push(<GridTitle title={sg.groupName} sub1 columns={3} />);
    gridEntries.push(<FlowedMetric title="Owner" value={sg.ownerId} columns={2} />);
    gridEntries.push(<FlowedMetric title="VPC" value={sg.vpcId} columns={2} />);

    gridEntries.push(<GridTitle sub2 title="Ingress" />);
    this.renderPerms(ingressByProto).forEach( (pe) => gridEntries.push(pe));

    gridEntries.push(<GridTitle sub2 title="Egress" />);
    this.renderPerms(egressByProto).forEach( (pe) => gridEntries.push(pe));
    return gridEntries;
  }

  render() {
    const { expanded } = this.state;
    const { instance, securityGroups, style } = this.props;

    // console.log("InstanceBar:render()", "clusterName", clusterName, "instance:", instance, "securityGroups:", securityGroups);
    const ci = instance.containerInstance;
    const ec2 = instance.ec2Instance;

    const styles = {
      container: {
        boxShadow: "unset",
      },
      bar: {
        marginBottom: defaultStyles.primaryAbsoluteSpace,
        // boxShadow: (expanded) ? defaultStyles.shadow : undefined
      },
      expansionContainer: {
        boxShadow: "unset",
        marginBottom: defaultStyles.largerAbsoluteSpace
      },
    };
    const mergedStyles = mergeStyles(styles, style, "container");

    const tcp = remainingTcpPortsValue(ci).map( (p) => {return {t: ((registeredTcpPortsValue(ci).includes(p)) ? "in use" : "avail"), v: p}; });
    const udp = remainingUdpPortsValue(ci).map( (p) => {return {t: ((registeredUdpPortsValue(ci).includes(p)) ? "in use" : "avail"), v: p}; });
    let k = new KeyGenerator();
    return (
      <Card expanded={expanded} style={mergedStyles.container} >
        <Bar
          title={ec2.privateIpAddress}
          subtitle={`Public IP: ${ec2.ipAddress}`}
          style={styles.bar}
          onExpandChange={this.handleExpanded}
          showExpandableButton
        >
          <MetricGrid columns={11} >
            <GridTitle title="EC2 Container Instance" />
            <FlowedMetric title="Tasks" value={ci.runningTasksCount} />
            <FlowedMetric title="Uptime" value={moment.unix(ec2.launchTime).fromNow(true)} columns={2}/>
            <FlowedMetric title="Instance" value={ec2.instanceType} columns={2} />
            <FlowedMetric title="Zone" value={ec2.placement.availabilityZone}  columns={2} />
            <GridTitle title="Resource Reservation" />
            <GuageRechart title="CPU" amount={usedCpuValue(ci)} total={registeredCpuValue(ci)} key={k.nextKey()}/>
            <GuageRechart title="Memory" amount={usedMemoryValue(ci)} total={registeredMemoryValue(ci)} key={k.nextKey()}/>
          </MetricGrid>
        </Bar>
        <Card expandable style={mergedStyles.expansionContainer}>
          <MetricGrid columns={14} >
            <GridTitle title="EC2 Instance"/>
            <FlowedMetric title="Container Instance ARN" value={shortArn(ci.containerInstanceArn)} columns={3}/>
            <FlowedMetric title="EC2 Instance ID" value={ec2.instanceId} columns={3}/>
            <FlowedMetric title="Uptime" value={uptimeString(ec2.launchTime)} columns={4} />
            <FlowedMetric title="Launch" value={moment.unix(ec2.launchTime).format()} columns={3}/>
            <FlowedMetric title="AMI ID" value={ec2.imageId} columns={2} />
            <FlowedMetric title="Image Arch" value={ec2.architecture} columns={2} />

            <GridTitle title="IAM" />
            <FlowedMetric title="Profile" value={shortArn(ec2.iamInstanceProfile.arn)} columns={2} />
            <FlowedMetric title="SSH Key" value={ec2.keyName} columns={2} />

            <GridTitle title="EC2 Network" />
            <FlowedMetric title="Public IP" value={ec2.ipAddress} columns={2} />
            <FlowedMetric title="Private IP" value={ec2.privateIpAddress} columns={2} />
            <FlowedMetric title="Subnet" value={ec2.subnetId} columns={2} />
            <FlowedMetric title="VPC ID" value={ec2.vpcId} columns={2} />

            <GridTitle title="Security Groups" />
            {securityGroups.map( (sg) => this.renderSg(sg))}

            <GridTitle title="Resources" />
            <GridTitle title="CPU" sub1 />
            <FlowedMetric title="Registered" value={registeredCpuValue(ci)} />
            <FlowedMetric title="Remaining" value={remainingCpuValue(ci)} />
            <FlowedMetric title="Used" value={usedCpuValue(ci)} />
            <GridTitle title="Memory" sub1 />
            <FlowedMetric title="Registered" value={registeredMemoryValue(ci)} />
            <FlowedMetric title="Remaining" value={remainingMemoryValue(ci)} />
            <FlowedMetric title="Used" value={usedMemoryValue(ci)} />
            <GridTitle title="TCP Ports" sub1 />
            {tcp.length > 0 ? (tcp.map( (p) => <FlowedMetric title={p.t} value={p.v} key={k.nextKey()} />)) : <GridTitle title="no ports" sub2 />}
            <GridTitle title="UDP Ports" sub1 />
            {(udp.length > 0) ? udp.map( (p) => <FlowedMetric title={p.t} value={p.v} key={k.nextKey()} /> ) : <GridTitle title="no ports" sub2 />}
          </MetricGrid>

        </Card>
      </Card>
    );
  }
}
/*          
          <FlexContainer flexWrap="wrap" justifyContent="flex-start" alignItems="stretch">
            <ContainerInstanceDetail instance={instance} />
            <EC2NetworkDetail instance={instance} />
            {securityGroups.map( (sg) => <SecurityGroupDetails securityGroup={sg}/>)}
            <InstanceComputeResourceDetail instance={instance} />
            <InstanceNetworkResourceDetail instance={instance} />
          </FlexContainer> 
*/
