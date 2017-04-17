import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import * as c from '../styles/colors'
import { mergeStyles, columnWidth } from '../helpers/ui';

import FlexContainer from './common/FlexContainer';
import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';


const Block = ({title, style}) => {
  return(<div style={style} >{title}</div>)
}

const TestLayout = ({ style }) => {
  // const col_1 = columnWidth(1);
  // const col_2 = columnWidth(2);
  // const col_3 = columnWidth(3);
  // const col_4 = columnWidth(4);
  const col_1 = 60;
  const col_2 = 124;
  const col_3 = 188;
  const col_4 = 240;
  console.log("Col1:", col_1, "col2:", col_2, "col3", col_3, "col4", col_4);

  const styles = {
    container: {
      width: col_3,
      padding: 0,
      margin: 0,
      marginTop: 20,
      marginLeft: 20,
      backgroundColor: c.metricBackground,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      // outline: "1px solid black"
    },
    flexContainer: {
      width: col_2,
      backgroundColor: c.metricBackground,
      marginTop: defaultStyles.largerAbsoluteSpace,
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      // outline: "1px solid black"
    },
    block: {
      width: col_1,
      // padding: defaultStyles.smallRelativeSpace,
      margin: 0,
      padding: 0,
      marginRight: 4,
      // marginBottom: defaultStyles.primaryAbsoluteSpace,
      // marginRight: defaultStyles.columnGutter,
      backgroundColor: c.primary,
      color: c.textOnPrimary,
      textAlign: "center",
      // outline: "1px solid white"
    },
    blockEnd: {
      width: col_1,
      margin: 0,
      padding: 0,
      backgroundColor: c.primary,
      color: c.textOnPrimary,
      textAlign: "center",
      // outline: "1px solid white"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");


  return (
    <div style={mergedStyles.container} >
      <Block title="one" style={mergeStyles(mergedStyles.block, {width: col_1}, "")}/>
      <Block title="two" style={mergeStyles(mergedStyles.block, {width: col_1}, "")}/>
      <Block title="three" style={mergeStyles(mergedStyles.blockEnd, {width: col_1}, "")} />
      <Block title="four" style={mergeStyles(mergedStyles.block, {width: col_2}, "")}/>
      <Block title="five" style={mergeStyles(mergedStyles.blockEnd, {width: col_1}, "")} />
      <Block title="six" style={mergeStyles(mergedStyles.block, {width: col_2}, "")} />
      <Block title="seven" style={mergeStyles(mergedStyles.blockEnd, {width: col_3}, "")} />
    </div>
  );

};


TestLayout.propTypes = {
  style: PropTypes.object
};

TestLayout.defaultProps = {
  style: {}
};

export default TestLayout;
