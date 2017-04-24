import React, {PropTypes } from 'react';
// import * as c from '../styles/colors';
import * as defaultStyles from '../styles/default';
import { mergeStyles, KeyGenerator  } from '../helpers/ui';

import { displayTime,  uptimeString } from '../helpers/time';
import { shortArn, shortRepoName } from '../helpers/aws';
import moment from 'moment';
import { containerBindings, containerLinks, containerResources, containerULimits, containerEnvironment } from '../ecs/deepTask';

import { Card } from 'material-ui/Card';

import Bar from './common/Bar';
import MetricGrid from './common/MetricGrid';
import GridTitle from './common/GridTitle';
import FlowedMetric from './common/FlowedMetric';


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
    this.renderBindings = this.renderBindings.bind(this);
    this.renderLinks = this.renderLinks.bind(this);
    this.renderULimits = this.renderULimits.bind(this);
    this.renderContainer = this.renderContainer.bind(this);
    this.renderEnvironment = this.renderEnvironment.bind(this);

    this.state = {
      expanded: false
    };
  }

  handleExpanded(newExpanded) {
    // console.log("Taksk:handleExpanded()", "newExpanded:", newExpanded);
    this.setState({
      expanded: newExpanded
    });
  }

  // TODO: This doesn't look right. Fonts are badly sized and 
  // the I think I want to lead with container not IP.
  // TODO: This functions need a little more FP please.
  renderBindings(bindings, containerName) {
    let result = [<GridTitle title={containerName} sub1 key={containerName} />];
    if (bindings.length >0) {
      bindings.forEach( (b) => {
        result.push(<GridTitle subtitle="IP" title={b.bindIP} sub2 />);
        result.push(<FlowedMetric title="Container" value={b.containerPort} />);
        result.push(<FlowedMetric title="Host" value={b.hostPort} />);
        result.push(<FlowedMetric title="Protocol" value={b.protocol} />);
      });
    } else {
      result.push(<GridTitle title="NONE" sub2 />);
    }
    return result;
  }

  renderLinks(links, cn) {
    let result = [<GridTitle title={cn} sub1 key={cn}/>];
    if (links.length > 0) {
      links.forEach( (l) => {
        result.push(<FlowedMetric title="Link" value={l} />);
      });
    } else {
      result.push(<GridTitle title="No Links" sub2/>);
    }
    return result;
  }

  renderResources(r, cn) {
    let result = [<GridTitle title={cn} sub1 key={cn} />];
    result.push(<FlowedMetric title="CPU" value={r.cpu} />);
    result.push(<FlowedMetric title="Memory" value={r.memory} />);
    result.push(<FlowedMetric title="Memory Reserved" value={r.memoryReservation} />);
    return result;
  }

  renderULimits(u, cn) {
    let result = [<GridTitle title={cn} sub1 key={cn} />];
    if (u) {
      result.push(<FlowedMetric title="ULimit" value={u.limitName} />);
      result.push(<FlowedMetric title="Soft" value={u.softLimit} />);
      result.push(<FlowedMetric title="Hard" value={u.hardLimit} />);
    } else {
      result.push(<GridTitle title="No ULimits" sub2 />);
    }
    return result;
  }

  renderContainer(ct, cd) {
    const command = (cd.command) ? cd.command.join(" ") : "<empty>";
    let entryPoint = "<empty>";
    let eps = undefined;
    let epCols = 2;
    if (cd.entryPoint) {
      entryPoint = cd.entryPoint.join(" ");
      eps = {textAlign: "left", fontSize: "small"};
      epCols = 3;
    }
    // const entryPoint = (cd.entryPoint) ? cd.entryPoint.join(" ") : "<empty>";

    let result=[<GridTitle title={ct.name} sub1 key={ct.name}/>];
    result.push(<FlowedMetric title="Essential" value={cd.essential ? "yes" : "no"} />);
    result.push(<FlowedMetric title="Image" value={shortRepoName(cd.image)} columns={3} />);
    result.push(<FlowedMetric title="Command" value={command} columns={2} />);
    result.push(<FlowedMetric title="Entry Point" value={entryPoint} valueStyles={eps} columns={epCols}/>);
    return result;
  }

  renderEnvironment(deepTask) {
    function compare(a,b) {
      if (a < b) return -1;
      if(a > b) return 1;
      return 0;
    }

    const env = containerEnvironment(deepTask).sort( (a,b) => compare(a.name, b.name));
    let results = [];
    let k = new KeyGenerator();
    env.forEach( (ev) => {
      const value = (ev.value) ? ev.value : "<empty>";
      results.push(<GridTitle title={ev.container} sub1 key={k.nextKey()} />);
      results.push(<FlowedMetric title="Variable" value={ev.name} columns={2} key={k.nextKey()} />);
      results.push(<FlowedMetric title="Value" value={value} columns={2} key={k.nextKey()} />);
      results.push(<FlowedMetric title="Override" value={ev.override} columns={2} key={k.nextKey()} />);
    });
    return results;
  }

  render() {
    const {deepTask, style} = this.props;
    const {expanded} = this.state;
    // console.log("Task:render()", "deepTask:", deepTask);

    const styles = {
      container: {
        boxShadow: "unset"
        // outline: `2px solid ${outlineColor}`
      },
      bar: {
        marginBottom: defaultStyles.primaryAbsoluteSpace
      },
      metric: {
        // marginRight: defaultStyles.metricSeparator,
      },
      expansionContainer: {
        // background: c.metricBackground,
        marginBottom: defaultStyles.primaryAbsoluteSpace,
        boxShadow: 'unset'
      },
    };
    const mergedStyles = mergeStyles(styles, style, "container");

    const task = deepTask.task;
    const ec2 = deepTask.ec2Instance;
    // const ci = deepTask.containerInstance;
    const td = deepTask.taskDefinition;
    const portBindings = containerBindings(deepTask);
    const links = containerLinks(deepTask);
    const resources = containerResources(deepTask);
    const ulimits = containerULimits(deepTask);

    const ncTitle = task.containers.length <= 1 ? "Container" : "Containers";
    const status = task.lastStatus[0] + task.lastStatus.toLowerCase().slice(1);
    let uptime = moment.unix(task.createdAt).fromNow(true);
    // const subTitle = `Instance Private IP: ${ec2.privateIpAddress}`
    const subTitle = `arn: ${shortArn(task.taskArn)}`;

    let kg = new KeyGenerator();
    return (
      <Card expanded={expanded} style={mergedStyles.container}>
        <Bar 
          title={shortArn(task.taskDefinitionArn)} 
          subtitle={subTitle} 
          onExpandChange={this.handleExpanded} 
          showExpandableButton={true}
          style={mergedStyles.bar}
        >
          <MetricGrid columns={6} >
            <GridTitle title="Task" columns={2} />
            <FlowedMetric title="Status" value={status} columns={2} valueFontSize="large" key={kg.nextKey()} />
            <FlowedMetric title="Public IP" value={ec2.ipAddress} columns={2} valueFontSize="large" key={kg.nextKey()} />
            <FlowedMetric title={ncTitle} value={task.containers.length} columns={2} key={kg.nextKey()} />
            <FlowedMetric title="Uptime" value={uptime} columns={2} valueFontSize="large" key={kg.nextKey()} />
            <FlowedMetric title="Private IP" value={ec2.privateIpAddress} columns={2} valueFontSize="large" />
          </MetricGrid>
        </Bar>
        <Card  style={mergedStyles.expansionContainer} expandable >
          <MetricGrid columns={14} >
            <GridTitle title="Task" />
            <FlowedMetric title="Started" value={displayTime(task.createdAt)} columns={5} />
            <FlowedMetric title="Uptime" value={uptimeString(task.createdAt)} columns={4} />
            <FlowedMetric title="Last Status" value={task.lastStatus} columns={2} />
            <FlowedMetric title="Desired Status" value={task.desiredStatus} columns={2} />

            <GridTitle title="Task Definition" />
            <FlowedMetric title="ARN" value={shortArn(td.taskDefinitionArn)} columns={2} />
            <FlowedMetric title="Family" value={td.family} columns={2} />
            <FlowedMetric title="Revision" value={td.revision} columns={1} />
            <FlowedMetric title="Active" value={td.status} columns={2} />
            <FlowedMetric title="Network Mde" value={td.networkMode} columns={2} />

            <GridTitle title="Container Port Bindings"/>
            {Object.keys(portBindings).map( (cn) => this.renderBindings(portBindings[cn], cn))}

            <GridTitle title="Container Links" />
            {Object.keys(links).map( (cn) => this.renderLinks(links[cn], cn))}

            <GridTitle title="Container Compute Resources" />
            {Object.keys(resources).map( (cn) => this.renderResources(resources[cn], cn))}

            <GridTitle title="Container ULimits" />
            {Object.keys(ulimits).map( (cn) => this.renderULimits(ulimits[cn], cn))}

            <GridTitle title="Containers"  />
            {task.containers.map( (ct) => this.renderContainer(ct, td.containerDefinitions.find((cd)=> cd.name === ct.name)))}

            <GridTitle title="Container Environment" columns={14} />
            {this.renderEnvironment(deepTask)}
          </MetricGrid>
        </Card>
      </Card>
    );
  }
}


/*
    // TODO: Change the outline color based on health.
    // const outlineColor = c.expandableOutlineColor;
    // const outlineColor = colors.red500;

      container: {
        boxShadow: "unset"
        // boxShadow: defaultStyles.shadow,
        // paddingTop: defaultStyles.smallAbsoluteSpace,
        // paddingLeft: defaultStyles.smallAbsoluteSpace,
        // paddingRight: defaultStyles.smallAbsoluteSpace,
        // padding: defaultStyles.smallAbsoluteSpace,
        // outline: `2px solid ${outlineColor}`
      },

      tableContainer: {
        alignSelf: "stretch",
        marginBottom: defaultStyles.primaryAbsoluteSpace,
        backgroundColor: defaultStyles.metricBackgroundColor,
      },
      table3Col: {
        width: columnWidth(4.25),
        backgroundColor: defaultStyles.metricBackgroundColor,
      },
      table4Col: {
        width: columnWidth(4.25),
        backgroundColor: defaultStyles.metricBackgroundColor,
      },
      envStyle: {
        height: "1000px",
        selfAlign: "stretch"
      }

*/

/*              <MetricGroup title="Container Port Bindings" style={mergedStyles.tableContainer}>
                <SimpleTable data={containerBindingsTableData(deepTask)} style={mergedStyles.table4Col} />
              </MetricGroup>
              <MetricGroup title="Container Links" style={mergedStyles.tableContainer}>
                <SimpleTable data={containerLinksTableData(deepTask)} style={mergedStyles.table3Col} />
              </MetricGroup>
              <MetricGroup title="Container Compute Resources" style={mergedStyles.tableContainer}>
                <SimpleTable data={containerResourceTableData(deepTask)} style={mergedStyles.table4Col} />
              </MetricGroup>
              <MetricGroup title="Container ULimits" style={mergedStyles.tableContainer}>
                <SimpleTable data={containerULimitsTableData(deepTask)} style={mergedStyles.table4Col} />
              </MetricGroup>
              {task.containers.map( (c) => <ContainerDetails container={c} containerDef={td.containerDefinitions.find((cd) => cd.name === c.name)}/>)}


{/*}
          <FlexContainer flexDirection="row" flexWrap="nowrap" alignItems="stretch" justifyContent="space-between">
            <FlexContainer flexDirection="row" flexWrap="wrap" alignItems="flex-start" justifyContent="felx-start">
              <TaskDetail task={task} />
              <TaskDefinitionDetail taskDefinition={td} />
              </FlexContainer>
            <ContainerEnvironmentDetails deepTask={deepTask} style={mergedStyles.envStyle}/>
          </FlexContainer>
{/*}

{/*}            <ContainerNetworkDetail deepTask={deepTask} /> 
            <ContainerResourcesDetail deepTask={deepTask} /> */
/*            <TaskCard task={task} /> 
            {task.containers.map( (c) => <ContainerCard width={"40em"} key={kg.nextKey()} ecsContainer={c} containerDefinition={td.containerDefinitions.find((cd) => cd.name === c.name)}/>)}
              <TaskDefinitionCard taskDefinition={td} />
              <ContainerNetworkCard deepTask={deepTask} />
              <ContainerResourcesCard deepTask={deepTask} />
            <ContainerEnvironmentCard deepTask={deepTask} />
*/


