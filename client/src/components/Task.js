import React, {PropTypes } from 'react';
import * as c from '../styles/colors';
import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import { shortArn } from '../helpers/aws';
import moment from 'moment';
import { KeyGenerator } from '../helpers/ui';

// import { containerBindingsTableData, containerLinksTableData } from '../ecs/deepTask';

import { Card } from 'material-ui/Card';

// import SimpleTable from './common/SimpleTable';
// import DetailCard from './common/DetailCard';
import ContainerNetworkCard from './ContainerNetworkCard';
import ContainerResourcesCard from './ContainerResourcesCard';
import FlexContainer from './common/FlexContainer';
import Bar from './common/Bar';
import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';
import TaskCard from './TaskCard';
import TaskDefinitionCard from './TaskDefinitionCard';
import ContainerCard from './ContainerCard';
import ContainerEnvironmentCard from './ContainerEnvironmentCard';
// import BindingsCard from '../components/BindingsCard';



export default class Task extends React.Component {

  static propTypes = {
    deepTask: PropTypes.object.isRequired,
    style: PropTypes.object,
  };

  static defaultProps = {
    style: {}
  }

  constructor(props, context) {
    super(props,context);

    this.handleExpanded = this.handleExpanded.bind(this);

    this.state = {
      expanded: false
    };
  }

  handleExpanded(newExpanded) {
    console.log("Taksk:handleExpanded()", "newExpanded:", newExpanded);
    this.setState({
      expanded: newExpanded
    });
  }

  // Since this component is simple and static, there's no parent component for it.
  render() {
    const {deepTask, style} = this.props;
    const {expanded} = this.state;
    // console.log("Task:render()", "deepTask:", deepTask);

    // TODO: Change the outline color based on health.
    const outlineColor = c.expandableOutlineColor;
    // const outlineColor = colors.red500;
    const styles = {
      container: {
        boxShadow: "unset"
        // boxShadow: defaultStyles.shadow,
        // paddingTop: defaultStyles.smallAbsoluteSpace,
        // paddingLeft: defaultStyles.smallAbsoluteSpace,
        // paddingRight: defaultStyles.smallAbsoluteSpace,
        // padding: defaultStyles.smallAbsoluteSpace,
        // outline: `2px solid ${outlineColor}`
      },
      bar: {
        marginBottom: defaultStyles.primaryAbsoluteSpace
      },
      metric: {
        marginRight: defaultStyles.metricSeparator,
      },
      expansionContainer: {
        // background: c.metricBackground,
        boxShadow: 'unset'
      }
    };
    const mergedStyles = mergeStyles(styles, style, "container");

    const task = deepTask.task;
    const ec2 = deepTask.ec2Instance;
    // const ci = deepTask.containerInstance;
    const td = deepTask.taskDefinition;

    const ncTitle = task.containers.length <= 1 ? "Container" : "Containers";
    const status = task.lastStatus[0] + task.lastStatus.toLowerCase().slice(1);
    let uptime = moment.unix(task.createdAt).fromNow(true);
    let kg = new KeyGenerator();
    return (
      <Card expanded={expanded} style={mergedStyles.container}>
        <Bar 
          title={shortArn(task.taskDefinitionArn)} 
          subtitle={`Instance Private IP: ${ec2.privateIpAddress}`} 
          onExpandChange={this.handleExpanded} 
          showExpandableButton={true}
          style={mergedStyles.bar}
        >
          <MetricGroup title="Task">
            <FlowedMetric title="Status" value={status} 
                          style={mergedStyles.metric} width={"6em"} valueFontSize="large" 
                          key={kg.nextKey()} 
            />
            <FlowedMetric title={ncTitle} value={task.containers.length}  
                          style={mergedStyles.metric} width={"6em"} 
                          key={kg.nextKey()}
            />
            <FlowedMetric title="Uptime" value={uptime}  
                          style={mergedStyles.metric} width={"6em"} valueFontSize="large" 
                          key={kg.nextKey()}
            />
            <FlowedMetric title="Public IP" value={ec2.ipAddress} 
                          width={"11em"} valueFontSize="large" 
                          key={kg.nextKey()}
            />
          </MetricGroup>
        </Bar>
        <Card  style={mergedStyles.expansionContainer} expandable>
          <FlexContainer flexDirection="row" flexWrap="wrap" alignItems="stretch" justifyContent="space-around">
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


