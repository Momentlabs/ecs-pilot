import React, {PropTypes } from 'react';
import * as c from '../styles/colors';
import { shortArn } from '../helpers/aws';
import moment from 'moment';

import { Card, CardTitle, CardText, CardExpandable } from 'material-ui/Card';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'

import MetricBar from '../components/common/MetricBar';
import FlexContainer from '../components/common/FlexContainer';
import FlowedMetric from '../components/common/FlowedMetric';

const toggleExpand = (event) => {
  console.log("Task#toggleExpand()", "event:", event);
};


// Since this component is simple and static, there's no parent component for it.
const Task = ({deepTask}) => {
  console.log("Task:render()", "deepTask:", deepTask);

  const styles = {
    container: {
      marginTop: "1em",
      // outline: "1px solid black"
    },
    barContainer: {
      // marginLeft: 200,
      // marginRight: 100,
      width: 'inherit',
      display: "WebkitBox",
      display: "WebkitFlex",
      display: 'flex',
      "WebkitFlexFlow": "row wrap",
      flexDirection: "row",
      justifyContent: 'space-between',
      // outline: "1px dotted blue"
    },
    metricBarTitleContainer: {
      // width: 100,
      padding: "1em",
      diplsay: "inline-block",
      // outline: "2px solid red"
    },
    metricBarTitle: {
      paddingBottom: ".5em",
      fontSize: "x-large",
      // outline: "1px solid black"
    },
    metricBarSubtitle: {
      // paddingTop: 0,
      fontSize: "larger",
      color: c.subtitle
      // outline: "1px solid black"
    }
  };

  const task = deepTask.task;
  const ec2 = deepTask.ec2Instance;
  const ci = deepTask.containerInstance;
  const td = deepTask.taskDefinition;

  const ncTitle = task.containers.length <= 1 ? "Container" : "Containers";
  let uptime = moment.unix(ec2.launchTime).fromNow(true);

  return (
    <Card style={styles.container}>
      <div style={styles.barContainer}>
        <div style={styles.metricBarTitleContainer}>
          <div style={styles.metricBarTitle}>{shortArn(task.taskDefinitionArn)}</div>
          <div style={styles.metricBarSubtitle}>{`Private IP: ${ec2.privateIpAddress}`}</div>
        </div>
        <MetricBar >
          <FlowedMetric key="metric-1" title={ncTitle} value={task.containers.length}/>
          <FlowedMetric key="metric-2" width={"6em"} valueFontSize="large" title="Uptime" value={uptime} />
          <FlowedMetric key="metric-3" width={"11em"} valueFontSize="large"  title="Public IP" value={ec2.ipAddress} />
        </MetricBar>
      </div>
      <Card expandable>
        <CardText title="Details" subtitle={`${task.containers.length} containers`}/>
      </Card>
    </Card>
  );
};

// Task.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

// Task.defaultProps = {
//   aProp: "Remove me"
// };

Task.propTypes = {
  deepTask: PropTypes.object.isRequired
};

export default Task;