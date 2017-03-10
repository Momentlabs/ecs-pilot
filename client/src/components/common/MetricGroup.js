import React, { PropTypes } from 'react';

import { mergeStyles } from '../../helpers/ui';
import * as c from '../../styles/colors';


// TODO: This doesn't play well with a non-grouped Metric in a metric bar.
// That's probably a MetricBar problem, but ...
// TODO: Remove the minWidth?
const MetricGroup = ( { title, children, minWidth, style }, context) => {

  // This is for the metrics.
  const flexFlow = "row nowrap";
  const justifyContent = "space-between";
  const alignItems = "stretch";
  const alignContent = "flex-start";

  const seperatorWidth = 5;

  const styles = {
    container: {
      height: 'auto',
      display: 'flex',
      marginRight: seperatorWidth,
      flexFlow: "column nowrap",
      justifyContent: "center",
      // outline: "1px solid black"
    },
    banner: {
      // marginLeft: 0,
      // marginRight: 0, // TODO: contstants and magic numbers (seperators?)
      marginBottom: seperatorWidth,
      background: c.metricBannerBackground,
      color: c.metricBannerColor,
    },
    title: {
      paddingLeft: ".5em",
    },
    metrics: {
      minWidth: minWidth,
      hieght: 'inherit',
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
      // outline: "2px solid red",
    }
  };

  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <div style={mergedStyles.container}>
      {title ?  <div style={mergedStyles.banner}><div style={mergedStyles.title}>{title}</div></div> : ""}
      <div style={mergedStyles.metrics}>{children}</div>
    </div>
  );
};


MetricGroup.propTypes = {
  title: PropTypes.string,
  style: PropTypes.object,
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  banner: PropTypes.bool,
  children: PropTypes.node
};

MetricGroup.defaultProps = {
  style: {},
  minWidth: "auto",
  title: false,
};

export default MetricGroup;