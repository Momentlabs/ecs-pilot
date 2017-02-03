import React, {PropTypes } from 'react';
import { KeyGenerator } from '../helpers/ui';
import { shortArn } from '../helpers/aws';
import { uptimeString, displayTime, isoDisplayTime } from '../helpers/time';

import DetailCard from '../components/common/DetailCard';
import DetailItem from '../components/common/DetailItem';

import { List } from 'material-ui/List';

// Since this component is simple and static, there's no parent component for it.
const TaskCard = ({ task, width }) => {

  const uptime  = uptimeString(task.createdAt);
  const start =   isoDisplayTime(task.createdAt);

  let kg = new KeyGenerator;
  return (
    <DetailCard title="Task" subtitle={`Started: ${displayTime(task.createdAt)}`} width={width}>
      <List>
        <DetailItem listKey={kg.nextKey()} name="Last Status" value={task.lastStatus} />
        <DetailItem listKey={kg.nextKey()} name="Desired Status" value={task.desiredStatus} />
        <DetailItem listKey={kg.nextKey()} name="Start time" value={start} />
        <DetailItem listKey={kg.nextKey()} name="Uptime" value={uptime} />
        <DetailItem listKey={kg.nextKey()} name="Task Arn" value={shortArn(task.taskArn)} />
        <DetailItem listKey={kg.nextKey()} name="Task Definition Arn" value={shortArn(task.taskDefinitionArn)} />
      </List>
    </DetailCard>
  );
};

TaskCard.defaultProps = {
  width: "40em",
}

TaskCard.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  task: PropTypes.object.isRequired,
};

export default TaskCard;
