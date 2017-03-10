import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

import { mergeStyles } from '../../helpers/ui';
import * as c from '../../styles/colors';


// Since this component is simple and static, there's no parent component for it.
const FlowedMetric = ({value, valueFontSize, title, titleFontSize, width, style }, context) => {

  const styles = {
    metricBox: {
      width: width,
      // marginRight: "1em",
      padding: ".5em",
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
      padding: 0,
      margin: 0,
      marginTop: ".25em",
      alignSelf: "center",

      fontSize: valueFontSize,
      textAlign: "center",
      // outline: '2px solid blue',
    },
    metricTitle: {
      padding: 0,
      margin: 0,
      marginTop: ".5em",

      fontSize: titleFontSize,
      textAlign: "center",

      color: c.metricName,
      // outline: '1px solid green'
    }
  };

  const mergedStyles = mergeStyles(styles, style, "metricBox");
  return (
    <div style={mergedStyles.metricBox} >
      <div style={mergedStyles.metricValue} >{value}</div>
      <div style={mergedStyles.metricTitle} >{title}</div>
    </div>
  );
};

// FlowedMetric.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

FlowedMetric.defaultProps = {
  style: {},
  value: 0,
  valueFontSize: 'xx-large',
  title: "Remove me",
  titleFontSize: 'medium',
  width: "auto"
};

FlowedMetric.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  style: PropTypes.object,
  valueFontSize: PropTypes.string,
  title: PropTypes.string.isRequired,
  titleFontSize: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.element
};

export default FlowedMetric;