import React, { PropTypes } from 'react';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';
import { separateChildrenRow } from '../../helpers/react';
import * as c from '../../styles/colors';

// TODO: This doesn't play well with a non-grouped Metric in a metric bar.
// That's probably a MetricBar problem, but ...
// TODO: Remove the minWidth?
const MetricGroup = ({ title, children, minWidth, separateMetricWidth, tabTitle, style }) => {

  const separatorWidth = defaultStyles.metricSeparator;
  const styles = {
    container: {
      height: 'auto',
      display: 'flex',
      // marginRight: separatorWidth,
      flexFlow: "column nowrap",
      justifyContent: "stretch",
      // outline: "1px solid green"
    },
    banner: {
      // marginLeft: 0,
      // marginRight: 0, // TODO: contstants and magic numbers (seperators?)
      marginBottom: separatorWidth,
      background: c.metricBannerBackground,
      color: c.metricBannerColor,
    },
    title: {
      paddingLeft: defaultStyles.smallRelativeSpace
    },
    metrics: {
      minWidth: minWidth,
      height: 'inherit',
      flexGrow: 5,
      display: 'inline-flex', // eslint-disable-line no-dupe-keys
      flexFlow: "row nowrap",
      justifyContent: "stretch",
      alignItems: "stretch",
      // alignContent: alignContent,
      // outline: "2px solid red",
    }
  };

  let mergedStyles = mergeStyles(styles, style, "container");
  if (tabTitle) mergedStyles = mergeStyles(mergedStyles, {alignSelf: "flexStart"}, "title");

  // console.log("MetricGroup:render()", "children:", children);
  if (React.Children.count(children) === 0) { 
    return <div /> 
  }
  return (
    <div style={mergedStyles.container}>
      {title ?  <div style={mergedStyles.banner}><div style={mergedStyles.title}>{title}</div></div> : ""}
      <div style={mergedStyles.metrics}>{separateChildrenRow(children, separateMetricWidth)}</div>
    </div>
  );
};

MetricGroup.propTypes = {
  title: PropTypes.string,
  tabTitle: PropTypes.bool,
  style: PropTypes.object,
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  separateMetricWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  banner: PropTypes.bool,
  children: PropTypes.node
};

MetricGroup.defaultProps = {
  tabTitle: false,
  style: {},
  minWidth: "auto",
  separateMetricWidth: defaultStyles.smallAbsoluteSpace,
  title: undefined,
};

export default MetricGroup;