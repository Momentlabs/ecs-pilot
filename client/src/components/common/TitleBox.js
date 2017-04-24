import React, { PropTypes } from 'react';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';

const TitleBox = ({title, subtitle, style, altColor}) => {

  const titleBoxStyle = (altColor) ? (defaultStyles.altColorTitleBox) : defaultStyles.titleBox;
  const titleStyle = (altColor) ? (defaultStyles.altColorTitle) : defaultStyles.title;
  const subtitleStyle = (altColor) ? (defaultStyles.altColorSubtitle) : defaultStyles.subtitle;

  const styles = {
    container: titleBoxStyle,
    title: mergeStyles(titleStyle, {
      marginBottom: defaultStyles.smallRelativeSpace,
    }),
    subtitle: subtitleStyle
  };

  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <div style={mergedStyles.container} >
      <div style={mergedStyles.title} >{title}</div>
      <div style={mergedStyles.subtitle} >{subtitle}</div>
    </div>
  );
};

TitleBox.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  altColor: PropTypes.bool,
  style: PropTypes.object
};

TitleBox.defaultProps = {
  title: "Title",
  subtitle: undefined,
  altColor: false,
  sytle: {}
};

export default TitleBox;
