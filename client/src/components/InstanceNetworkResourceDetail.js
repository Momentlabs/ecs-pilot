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
  const mergedStyles = mergeStyles(styles, style, "container");

  const tcp = remainingTcpPortsValue(ci).map( (p) => {return {t: ((registeredTcpPortsValue(ci).includes(p)) ? "in use" : "avail"), v: p}; });
  const udp = remainingUdpPortsValue(ci).map( (p) => {return {t: ((registeredUdpPortsValue(ci).includes(p)) ? "in use" : "avail"), v: p}; });
  return (
    <MetricGroup title="Instance Network Resources" style={mergedStyles.container}>
      <MetricGroup title="TCP Ports">
        {tcp.map( (p) => <FlowedMetric title={p.t} value={p.v} />)} 
      </MetricGroup>
      <MetricGroup title="UDP Ports">
        {udp.map( (p) => <FlowedMetric title={p.t} value={p.v} />)}
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
