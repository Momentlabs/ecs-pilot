import React, {PropTypes } from 'react';
import * as c from '../styles/colors';
import { shortArn } from '../helpers/aws';
import moment from 'moment';
import { KeyGenerator } from '../helpers/ui';

// import { containerBindingsTableData, containerLinksTableData } from '../ecs/deepTask';

import { Card } from 'material-ui/Card';

// import SimpleTable from './common/SimpleTable';
// import DetailCard from './common/DetailCard';
import ContainerNetworkCard from './ContainerNetworkCard';
import ContainerResourcesCard from './ContainerResourcesCard';
import FlexContainer from '../components/common/FlexContainer';
import MetricBar from '../components/common/MetricBar';
import MetricGroup from '../components/common/MetricGroup';
import FlowedMetric from '../components/common/FlowedMetric';
import TaskCard from '../components/TaskCard';
import TaskDefinitionCard from '../components/TaskDefinitionCard';
import ContainerCard from '../components/ContainerCard';
import ContainerEnvironmentCard from './ContainerEnvironmentCard';
// import BindingsCard from '../components/BindingsCard';



export default class Task extends React.Component {

  // static contextTypes = {
  //   muiTheme: PropTypes.object.isRequired
  // };

  // static defaultProps = {
  //   aProp: "Remove me"
  // };

  static propTypes = {
    deepTask: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props,context);

    this.handleExpanded = this.handleExpanded.bind(this);

    this.state = {
      expanded: false
    };
  }

  handleExpanded(newExpanded) {
    // console.log("Taksk#handleExpanded()", "newExpanded:", newExpanded);
    this.setState({
      expanded: newExpanded
    });
  }

  // Since this component is simple and static, there's no parent component for it.
  render() {
    const {deepTask} = this.props;
    const {expanded} = this.state;
    // console.log("Task:render()", "deepTask:", deepTask);

    // TODO: Change the outline color based on health.
    const outlineColor = c.expandableOutlineColor;
    // const outlineColor = colors.red500;
    const styles = {
      container: {
        boxShadow: "unset",
         // marginTop: "1em",
         marginBottom: "2em",
         // paddingBottom: "1em",
        // padding:
        // outline: `2px solid ${outlineColor}`
      },
      barContainer: {
        // marginLeft: 200,
        // marginRight: 100,
        width: 'inherit',
        paddingTop: "1em",
        paddingBottom: "1em",
        display: "WebkitBox",
        display: "WebkitFlex", // eslint-disable-line no-dupe-keys
        display: 'flex', // eslint-disable-line no-dupe-keys
        "WebkitFlexFlow": "row wrap",
        flexFlow: "row wrap",
        // jc: flex-start, flex-end, center, space-between, space-around
        justifyContent: 'space-between',
        alignItems: "center",
        // alignContent: "center",
        // ai: flex-start, flex-end, center, stretch, baseline
        // outline: "2px dotted blue"
      },
      metricBarTitleContainer: {
        // width: 100,
        // padding: "1em",
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
        color: c.subtitle,
        // outline: "1px solid black"
      },
      metric: {
        marginRight: 5,
      },
    };

    const task = deepTask.task;
    const ec2 = deepTask.ec2Instance;
    // const ci = deepTask.containerInstance;
    const td = deepTask.taskDefinition;

    const ncTitle = task.containers.length <= 1 ? "Container" : "Containers";
    const status = task.lastStatus[0] + task.lastStatus.toLowerCase().slice(1);
    let uptime = moment.unix(task.createdAt).fromNow(true);
    let kg = new KeyGenerator();
    return (
      <Card expanded={expanded} style={styles.container}>
        <div style={styles.barContainer}>
          <div style={styles.metricBarTitleContainer}>
            <div style={styles.metricBarTitle}>{shortArn(task.taskDefinitionArn)}</div>
            <div style={styles.metricBarSubtitle}>{`Instance Private IP: ${ec2.privateIpAddress}`}</div>
          </div>
         <MetricBar onExpandChange={this.handleExpanded} showExpandableButton >
            <MetricGroup title="Task">
              <FlowedMetric title="Status" value={status} style={styles.metric} width={"6em"} valueFontSize="large" key={kg.nextKey()} />
              <FlowedMetric title={ncTitle} value={task.containers.length}  style={styles.metric} width={"6em"} key={kg.nextKey()}/>
              <FlowedMetric title="Uptime" value={uptime}  style={styles.metric} width={"6em"} valueFontSize="large" key={kg.nextKey()}/>
              <FlowedMetric title="Public IP" value={ec2.ipAddress} width={"11em"} valueFontSize="large" key={kg.nextKey()}/>
            </MetricGroup>
          </MetricBar>
        </div>
        <Card expandable>
          <FlexContainer flexDirection="row" flexWrap="wrap" alignItems="stretch" justifyContent="space-around" >
            <TaskCard task={task} />
            <ContainerNetworkCard deepTask={deepTask} />
            <TaskDefinitionCard taskDefinition={td} />
            <ContainerResourcesCard deepTask={deepTask} />
            {task.containers.map( (c) => <ContainerCard width={"40em"} key={kg.nextKey()} ecsContainer={c} containerDefinition={td.containerDefinitions.find((cd) => cd.name === c.name)}/>)}
            <ContainerEnvironmentCard deepTask={deepTask} />
          </FlexContainer>
        </Card>
      </Card>
    );
  }
}


