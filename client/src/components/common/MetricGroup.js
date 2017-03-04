import React, { PropTypes } from 'react';

import * as c from '../../styles/colors';


// TODO: This doesn't play well with a non-grouped Metric in a metric bar.
// That's probably a MetricBar problem, but ...
const MetricGroup = ( { title, children }, context) => {

  const flexFlow = "row nowrap";
  const justifyContent = "space-around";
  const alignItems = "stretch";
  const alignContent = "flex-start";
  const styles = {
    container: {
      outline: "0px solid black"
    },
    banner: {
      marginRight: 1, // TODO: contstants and magic numbers (seperators?)
      background: c.metricBannerBackground,
      color: c.metricBannerColor,
    },
    title: {
      paddingLeft: ".5em",
    },
    metrics: {
      // width: width,
      display: "WebkitBox",
      display: "WebkitInlineFlex", // eslint-disable-line no-dupe-keys
      display: 'inline-flex', // eslint-disable-line no-dupe-keys
      WebkitFlexFlow: flexFlow,
      flexFlow: flexFlow,
      WebkitJustifyContent: justifyContent,
      justifyContent: justifyContent,
      WebkitAlignItems: alignItems,
      alignItems: alignItems,
      WebkitAlignContent: alignContent,
      alignContent: alignContent,
    }
  };

  return (
    <div style={styles.container}>
      {title ?  <div style={styles.banner}><div style={styles.title}>{title}</div></div> : ""}
      <div style={styles.metrics}>{children}</div>
    </div>
  );
};

MetricGroup.contextTypes = {
  muiTheme: PropTypes.object.isRequired
};

MetricGroup.propTypes = {
  title: PropTypes.string,
  banner: PropTypes.bool,
  children: PropTypes.node
};

MetricGroup.defaultProps = {
  title: false,
};

export default MetricGroup;