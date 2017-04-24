import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles, columnWidth  } from '../helpers/ui';
import { shortArn } from '../helpers/aws';

import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';



const TaskDefinitionDetail = ({ taskDefinition, style }) => {

  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      outline: "0px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <MetricGroup title="Task Definition" style={mergedStyles.container}>
        <FlowedMetric title="ARN" value={shortArn(taskDefinition.taskDefinitionArn)} width={columnWidth(2)} />
        <FlowedMetric title="Family" value={taskDefinition.family} width={columnWidth(2)} />
        <FlowedMetric title="Revision" value={taskDefinition.revision} width={columnWidth(1)} />
        <FlowedMetric title="Active" value={taskDefinition.status} width={columnWidth(2)} />
        <FlowedMetric title="NetworkMode" value={taskDefinition.networkMode} width={columnWidth(2)} />
{/*}      <MetricGroup title="Container Images" >
        {taskDefinition.containerDefinitions.map( (cd) => <FlowedMetric title={cd.name} value={shortRepoName(cd.image)} width={columnWidth(3)} /> )}
      </MetricGroup>{*/}
    </MetricGroup>
  );
};

TaskDefinitionDetail.propTypes = {
  taskDefinition: PropTypes.object.isRequired,
  style: PropTypes.object
};

TaskDefinitionDetail.defaultProps = {
  style: {}
};

export default TaskDefinitionDetail;
