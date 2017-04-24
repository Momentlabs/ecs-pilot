import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';
import * as c from '../../styles/colors';

const LongStringLength = 4;
function longString(value) {
  return ((typeof(value) === "string") && (value.length > LongStringLength)) ? true : false;
}

function fontSizeOfValue(value) {
  return longString(value) ? defaultStyles.longMetricFontSize : defaultStyles.metricFontSize;
}

// function widthFromValue(value) {
//   return longString(value) ? "auto" : defaultStyles.metricWidth;
// }

const FlowedMetric = (props) => {
  // console.log("FlowedMetric#render()", "props:", props);
  const { title, value, defaultValue, valueFontSize, valueStyles, 
          titleFontSize, columns, style } = props;

  const vfs = (valueFontSize === undefined) ? fontSizeOfValue(value) : valueFontSize;
  // const mWidth = (width === undefined) ? widthFromValue(value) : width;

  const columnSpec = (columns !== undefined) ? `span ${columns}` : "";

  const styles = {
    metricBox: {
      // width: mWidth,  // GRID EXPERIMENT
      // padding: defaultStyles.smallAbsoluteSpace,
      backgroundColor: c.metricBackground,
      display: 'inline-flex',
      flexDirection: "column",
      justifyContent: 'space-between',
      alignItems: "center",
      gridColumn: columnSpec,
      // alignContent: 'space-around',
      // alignSelf: "center",
      // outline: "2px solid black"
    },
    metricValue: {
      display: "flex",
      flexDirection :"column",
      justifyContent: "center",
      flexGrow: 5,
      // flexShrink: 5,
      // paddingLeft: defaultStyles.smallRelativeSpace,
      // paddingRight: defaultStyles.smallRelativeSpace,
      marginTop: defaultStyles.xSmallRelativeSpace,
      alignSelf: "center",
      fontSize: vfs,
      textAlign: "center",

      marginBottom: defaultStyles.smallRelativeSpace,
      // outline: '2px solid blue',
    },
    metricTitle: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      flexGrow: 1,
      paddingTop: 0,
      paddingBottom: 0,
      margin: 0,
      // paddingLeft: defaultStyles.smallRelativeSpace,
      // paddingRight: defaultStyles.smallRelativeSpace,
      fontSize: titleFontSize,
      textAlign: "center",

      color: c.metricName,
      // outline: '2px dotted green'
    }
  };
  let mergedStyles = mergeStyles(styles, style, "metricBox");
  mergedStyles = mergeStyles(mergedStyles, valueStyles, "metricValue");

  const v = (value !== undefined) ? value : (defaultValue !== undefined) ? defaultValue : undefined;
  // console.log("FlowedMetric", "title:", title, ", styles:", mergedStyles.metricBox);
  return (
    <div style={mergedStyles.metricBox} >
      { (v !== undefined) ? <div style={mergedStyles.metricValue} >{v}</div> : undefined}
      { (title !== undefined) ? <div style={mergedStyles.metricTitle} >{title}</div> : undefined}
    </div>
  );
};

// FlowedMetric.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

FlowedMetric.defaultProps = {
  style: {},
  columns: 1,
  defaultValue: undefined,
  value: undefined,
  valueFontSize: undefined,
  valueStyles: {},
  title: undefined,
  titleFontSize: defaultStyles.metricTitleSize,
  width: undefined
};

FlowedMetric.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  columns: PropTypes.number,
  valueFontSize: PropTypes.string,
  valueStyles: PropTypes.oneOfType([PropTypes.string,PropTypes.object]),
  title: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
  titleFontSize: PropTypes.string,
  // width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.element
};

export default FlowedMetric;