import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';
import * as c from '../../styles/colors';


// Since this component is simple and static, there's no parent component for it.
const FlowedMetric = (props) => {
  // console.log("FlowedMetric#render()", "props:", props);
  const { title, value, defaultValue, valueFontSize, titleFontSize, width, style } = props;

  const styles = {
    metricBox: {
      width: width,
      // marginRight: "1em",
      padding: defaultStyles.smallAbsoluteSpace,
      backgroundColor: c.metricBackground,
      // display: "WebkitBox",
      // display: "WebkitInlineFlex", // eslint-disable-line no-dupe-keys
      display: 'inline-flex',
      "WebkitFlexFlow": "row wrap",
      flexDirection: "column",
      justifyContent: 'space-between',
      alignItems: "center",
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
      paddingLeft: defaultStyles.smallRelativeSpace,
      paddingRight: defaultStyles.smallRelativeSpace,
      marginTop: defaultStyles.xSmallRelativeSpace,
      alignSelf: "center",

      fontSize: valueFontSize,
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
      paddingLeft: defaultStyles.smallRelativeSpace,
      paddingRight: defaultStyles.smallRelativeSpace,

      fontSize: titleFontSize,
      textAlign: "center",

      color: c.metricName,
      // outline: '2px dotted green'
    }
  };
  const mergedStyles = mergeStyles(styles, style, "metricBox");

  const v = (value !== undefined) ? value : (defaultValue !== undefined) ? defaultValue : undefined;
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
  defaultValue: undefined,
  value: undefined,
  valueFontSize: defaultStyles.metricFontSize,
  title: undefined,
  titleFontSize: defaultStyles.metricTitleSize,
  width: "auto"
};

FlowedMetric.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  valueFontSize: PropTypes.string,
  title: PropTypes.string,
  titleFontSize: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.element
};

export default FlowedMetric;