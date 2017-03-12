import React, { PropTypes } from 'react';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';

const TitleBox = ({title, subtitle, style}) => {

  const styles = {
    container: {
      // outline: "1px solid black"
    },
    title: mergeStyles(defaultStyles.title,{
      marginBottom: defaultStyles.smallRelativeSpace,
    }),
    subtitle: defaultStyles.subtitle,
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
  style: PropTypes.object
};

TitleBox.defaultProps = {
  title: "Title",
  subtitle: undefined,
  sytle: {}
};

export default TitleBox;
