import React, { PropTypes } from 'react';

import moment from 'moment';
import {  usedCpuValue, usedMemoryValue, 
          registeredCpuValue,registeredMemoryValue,
        } from '../ecs/instance';
import { KeyGenerator } from '../helpers/ui';


import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';
import { shortArn } from '../helpers/aws';

import Card from 'material-ui/Card';
import Bar from './common/Bar';
import FlexContainer from './common/FlexContainer';
import MetricGroup from './common/MetricGroup'
import FlowedMetric from './common/FlowedMetric';
import GuageRechart from './common/GuageRechart'; // TODO: OH FOR GODS SAKE RENAME THIS.
import EC2NetworkDetail from './EC2NetworkDetail';
import ContainerInstanceDetail from './ContainerInstanceDetail';
import InstanceComputeResourceDetail from './InstanceComputeResourceDetail';
import InstanceNetworkResourceDetail from './InstanceNetworkResourceDetail';
import SecurityGroupDetails from './SecurityGroupDetails';


export default class InstanceBar extends React.Component {

  static propTypes = {
    style: PropTypes.object,
    instance: PropTypes.object,
    securityGroups: PropTypes.array,
    clusterName: PropTypes.string.isRequired,
  };

  static defaultProps = {
    style: {},
    instances: {},
    securityGroups: []
  };

  constructor(props, context) {
    super(props, context);

    this.handleExpanded = this.handleExpanded.bind(this);
    this.state = {
      expanded: false
    };
  }

  handleExpanded(newExpanded) {
    console.log("InstanceBar:handleExpanded", "newExpanded:", newExpanded);
    this.setState({
      expanded: newExpanded
    });
  }

  render() {
    const { expanded } = this.state;
    const { clusterName, instance, securityGroups, style } = this.props;

    console.log("InstanceBar:render()", "clusterName", clusterName, "instance:", instance, "securityGroups:", securityGroups);
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
          <MetricGroup title="EC2 Container Instance"  key={k.nextKey()} >
            <FlowedMetric title="Tasks" value={ci.runningTasksCount} />
            <FlowedMetric title="Uptime" value={moment.unix(ec2.launchTime).fromNow(true)} width="auto" />
            <FlowedMetric title="Instance" value={ec2.instanceType} width="auto" />
            <FlowedMetric title="Zone" value={ec2.placement.availabilityZone} width="auto" />
          </MetricGroup>
          <MetricGroup title="Resource Reservation"key={k.nextKey()}>
            <GuageRechart title="CPU" amount={usedCpuValue(ci)} total={registeredCpuValue(ci)} key={k.nextKey()}/>
            <GuageRechart title="Memory" amount={usedMemoryValue(ci)} total={registeredMemoryValue(ci)} key={k.nextKey()}/>
          </MetricGroup>
        </Bar>
        <Card expandable style={mergedStyles.expansionContainer}>
          <FlexContainer flexWrap="wrap" justifyContent="flex-start" alignItems="stretch">
            <ContainerInstanceDetail instance={instance} />
            <EC2NetworkDetail instance={instance} />
            <InstanceComputeResourceDetail instance={instance} />
            <InstanceNetworkResourceDetail instance={instance} />
              {securityGroups.map( (sg) => <SecurityGroupDetails securityGroup={sg}/>)}
          </FlexContainer>
        </Card>
      </Card>
    );
  }
}

