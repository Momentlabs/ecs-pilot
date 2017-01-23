import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

import * as c from '../../styles/colors';


// Since this component is simple and static, there's no parent component for it.
const FlowedMetric = ({value, valueFontSize, title, titleFontSize, width}, context) => {

  const styles = {
    metricBox: {
      width: width,
      margin: ".5em",
      padding: ".5em",
      backgroundColor: c.metricBackground,
      boxShadow: "1px 1px 6px 0px rgba(0,0,0,0.25)",
      display: "WebkitBox",
      display: "WebkitInlineFlex",
      display: 'inline-flex',
      "WebkitFlexFlow": "row wrap",
      flexDirection: "column",
      justifyContent: 'space-between',
      // flexShrink: 1,
      // alignItems: ,
      // alignContent: 'space-between',
      // outline: "2px solid black"
    },
    metricValue: {
      padding: 0,
      margin: 0,
      marginTop: ".25em",
      fontSize: valueFontSize,
      textAlign: "center",
      // outline: '1px solid blue'

    },
    metricTitle: {
      padding: 0,
      margin: 0,
      marginTop: ".5em",
      color: c.metricName,
      fontSize: titleFontSize,
      textAlign: "center",
      // outline: '1px solid green'
    }
  };

  return (
    <div style={styles.metricBox} >
      <div style={styles.metricValue} >{value}</div>
      <div style={styles.metricTitle} >{title}</div>
    </div>
  );
};

FlowedMetric.contextTypes = {
  muiTheme: PropTypes.object.isRequired
};

FlowedMetric.defaultProps = {
  value: 0,
  valueFontSize: 'xx-large',
  title: "Remove me",
  titleFontSize: 'medium',
  width: "auto"
};

FlowedMetric.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  valueFontSize: PropTypes.string,
  title: PropTypes.string.isRequired,
  titleFontSize: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.element
};

export default FlowedMetric;