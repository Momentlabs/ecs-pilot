import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';
import { displayTime,  uptimeString } from '../helpers/time';
import { shortArn } from '../helpers/aws';

import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';


const TaskDetail = ({ task, style }) => {

  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      outline: "0px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <MetricGroup title={`Task ${task.taskArn}`} style={mergedStyles.container} >
      <FlowedMetric title="Started" value={displayTime(task.createdAt)} />
      <FlowedMetric title="Uptime" value={uptimeString(task.createdAt) } />
      <FlowedMetric title="Last Status" value={task.lastStatus} />
      <FlowedMetric title="Desired Status" value={task.desiredStatus} />
      <FlowedMetric title="Task Definition" value={shortArn(task.taskDefinitionArn)} />
    </MetricGroup>
  );
};


TaskDetail.propTypes = {
  task: PropTypes.object.isRequired,
  style: PropTypes.object
};

TaskDetail.defaultProps = {
  style: {}
};

export default TaskDetail;
