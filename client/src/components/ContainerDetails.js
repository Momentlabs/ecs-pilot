import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles, columnWidth } from '../helpers/ui';

import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';
import { shortRepoName } from '../helpers/aws';



const ContainerDetails = ({ container, containerDef, style }) => {

  let epValueStyle = {};
  if (containerDef.entryPoint) {
    epValueStyle = {
      width: columnWidth(3),
      textAlign: "left",
      fontSize: "x-smallest,"
    };
  }

  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      outline: "0px solid black"
    },
    entryPointValue: epValueStyle
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  const command = (containerDef.command) ? containerDef.command.join(" ") : "<empty>";
  const entryPoint = (containerDef.entryPoint) ? containerDef.entryPoint.join(" ") : "<empty>";

  return (
    <MetricGroup title={`Container: ${container.name}`} style={mergedStyles.container}>
{/*}      <FlowedMetric title="Name" value={container.name} /> {*/}
      <FlowedMetric title="Command" value={command} width={columnWidth(2)} />
      <FlowedMetric title="Entry Point" value={entryPoint} valueStyles={mergedStyles.entryPointValue} width={columnWidth(3)} />
      <FlowedMetric title="Image" value={shortRepoName(containerDef.image)}  width={columnWidth(2.5)} />
      <FlowedMetric title="Essential" value={(containerDef.essential) ? "yes" : "no"} width={columnWidth(1)} />
    </MetricGroup>
  );
};


ContainerDetails.propTypes = {
  container: PropTypes.object.isRequired,
  containerDef: PropTypes.object.isReqiured,
  style: PropTypes.object
};

ContainerDetails.defaultProps = {
  style: {}
};

export default ContainerDetails;
