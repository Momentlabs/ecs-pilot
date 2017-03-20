import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';
import { shortArn, shortRepoName } from '../helpers/aws';

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
      <MetricGroup title={`ARN: ${shortArn(taskDefinition.taskDefinitionArn)}`} >
        <FlowedMetric title="Family" value={taskDefinition.family} />
        <FlowedMetric title="Revision" value={taskDefinition.revision} />
        <FlowedMetric title="Active" value={taskDefinition.status} />
        <FlowedMetric title="NetworkMode" value={taskDefinition.networkMode} />
      </MetricGroup>
      <MetricGroup title="Container Images" >
        {taskDefinition.containerDefinitions.map( (cd) => <FlowedMetric title={cd.name} value={shortRepoName(cd.image)} /> )}
      </MetricGroup>
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

