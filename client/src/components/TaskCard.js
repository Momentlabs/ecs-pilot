import React, {PropTypes } from 'react';
import { KeyGenerator } from '../helpers/ui';
import { shortArn } from '../helpers/aws';
import { uptimeString, displayTime, isoDisplayTime } from '../helpers/time';
import moment from 'moment';

import DetailCard from '../components/common/DetailCard';
import DetailItem from '../components/common/DetailItem';

import { List, ListItem,  } from 'material-ui/List';

// Since this component is simple and static, there's no parent component for it.
const TaskCard = ({task}, context) => {

  const styles = {
    container: {
      outline: "0px solid black"
    },
    listItem: {
      textAlign: "right"
    }
  };

  const uptime  = uptimeString(task.createdAt);
  const start =   isoDisplayTime(task.createdAt);

  let kg = new KeyGenerator;
  return (
    <DetailCard title="Task" subtitle={`Started: ${displayTime(task.createdAt)}`} width={"40em"}>
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

// TaskCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

// TaskCard.defaultProps = {
// };

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
};

export default TaskCard;

/*
  itemHeader(title) { return <Subheader style={{color: c.metricTitle, paddingTop: "1m"}} key={title}>{title}</Subheader>; }
  itemResource(port) {
    return <ListItem disabled key={port} style={{textAlign: "right"}} primaryText={port} />;
  }
  itemHeaderPair(title, value, key) { 
    const keyValue = key ? key : value;
    return <ListItem disabled key={keyValue} primaryText={<ItemPair firstItemHeader itemOne={title} itemTwo={value}/>}/>;
  }
*/