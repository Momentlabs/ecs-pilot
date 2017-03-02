import React, {PropTypes } from 'react';
import * as c from '../styles/colors';
import { shortArn } from '../helpers/aws';
import moment from 'moment';
import { KeyGenerator } from '../helpers/ui';

// import { containerBindingsTableData, containerLinksTableData } from '../ecs/deepTask';

import * as colors from 'material-ui/styles/colors';
import { Card } from 'material-ui/Card';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up'
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down'

// import SimpleTable from './common/SimpleTable';
// import DetailCard from './common/DetailCard';
import ContainerNetworkCard from './ContainerNetworkCard';
import ContainerResourcesCard from './ContainerResourcesCard';
import FlexContainer from '../components/common/FlexContainer';
import MetricBar from '../components/common/MetricBar';
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
         marginTop: "1em",
        // padding:
        outline: `2px solid ${outlineColor}`
      },
      barContainer: {
        // marginLeft: 200,
        // marginRight: 100,
        width: 'inherit',
        display: "WebkitBox",
        display: "WebkitFlex",
        display: 'flex',
        "WebkitFlexFlow": "row wrap",
        flexFlow: "row wrap",
        // jc: flex-start, flex-end, center, space-between, space-around
        justifyContent: 'space-between',
        // ai: flex-start, flex-end, center, stretch, baseline
        // alignItems: "stretch",
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
    const status = task.lastStatus[0] + task.lastStatus.toLowerCase().slice(1);
    let uptime = moment.unix(task.createdAt).fromNow(true);
    let kg = new KeyGenerator;
    return (
      <Card expanded={expanded} style={styles.container}>
        <div style={styles.barContainer}>
          <div style={styles.metricBarTitleContainer}>
            <div style={styles.metricBarTitle}>{shortArn(task.taskDefinitionArn)}</div>
            <div style={styles.metricBarSubtitle}>{`Instance Private IP: ${ec2.privateIpAddress}`}</div>
          </div>
          <MetricBar onExpandChange={this.handleExpanded} showExpandableButton >
            <FlowedMetric width={"6em"} title="Status" value={status} valueFontSize="large" key={kg.nextKey()} />
            <FlowedMetric width={"6em"} title={ncTitle}  value={task.containers.length} key={kg.nextKey()}/>
            <FlowedMetric width={"6em"} valueFontSize="large" title="Uptime" value={uptime} key={kg.nextKey()}/>
            <FlowedMetric width={"11em"} valueFontSize="large"  title="Public IP" value={ec2.ipAddress} key={kg.nextKey()}/>
          </MetricBar>
        </div>
        <Card expandable>
          <FlexContainer flexDirection="row" flexWrap="wrap" alignItems="stretch" justifyContent="space-between" >
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


