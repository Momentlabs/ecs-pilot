import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import { registeredTcpPortsValue, registeredUdpPortsValue,
         remainingTcpPortsValue, remainingUdpPortsValue
       } from '../ecs/instance';



import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';

const InstanceNetworkResourceDetail = ({ instance, style }, context) => {

  const ci = instance.containerInstance;
  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace
      // outline: "0px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style);

  const tcp = remainingTcpPortsValue(ci).map( (p) => (registeredTcpPortsValue(ci).includes(p)) ? p + "*" : p);
  const udp = remainingUdpPortsValue(ci).map( (p) => (registeredUdpPortsValue(ci).includes(p)) ? p + "*" : p);
  return (
    <MetricGroup title="Instance Network Resources" mergedStyles={mergedStyles.container}>
      <MetricGroup title="TCP Ports">
        {tcp.map( (p) => <FlowedMetric title="port" value={p} />)} 
      </MetricGroup>
      <MetricGroup title="UDP Ports">
        {udp.map( (p) => <FlowedMetric title="port" value={p} />)}
      </MetricGroup>
    </MetricGroup>
  );
};


InstanceNetworkResourceDetail.propTypes = {
  instance: PropTypes.object
};

InstanceNetworkResourceDetail.defaultProps = {
  instance: {}
};

export default InstanceNetworkResourceDetail;
