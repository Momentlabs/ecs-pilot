import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles, columnWidth } from '../helpers/ui';
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
      <FlowedMetric title="Started" value={displayTime(task.createdAt)} width={columnWidth(3)} />
      <FlowedMetric title="Uptime" value={uptimeString(task.createdAt)} width={columnWidth(2)} />
      <FlowedMetric title="Last Status" value={task.lastStatus} width={columnWidth(2)} />
      <FlowedMetric title="Desired Status" value={task.desiredStatus} width={columnWidth(2)} />
{/*}      <FlowedMetric title="Task Definition" value={shortArn(task.taskDefinitionArn)} width={columnWidth(2)} /> {*/}
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
