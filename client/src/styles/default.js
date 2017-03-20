import * as colors from './colors';


export const xSmallRelativeSpace = ".25em";     // Small space between text (e.g. Title and subtitle)
export const smallRelativeSpace = ".5em";     // Small space between text (e.g. Title and subtitle)
export const primaryRelativeSpace = "2em";    // Basic space between text and visual elements.

export const smallAbsoluteSpace = 5;          // very small spaces (e.g. small space between metric boxes and title bar and group)
export const primaryAbsoluteSpace = "2em";    // TODO THIS IS NOT ABSOLUTE!
export const largerAbsoluteSpace = "4em";

// n*10pt
export const columnWidthPt = 60;
export const columnWidth = columnWidthPt + "pt";             // TODO: This should be an absolute number

export const titleFontSize = "x-large";

// export const metricFontSize = "xx-large";
export const metricFontSize = "large";
export const longMetricFontSize = "large";
export const metricTitleSize = "medium";

export const subtitleFontSize = "11pt";

export const titleBox = {};

export const title = {
  fontSize: titleFontSize,
  color: colors.title,
};

export const subtitle = {
  fontSize: subtitleFontSize,
  color: colors.subtitle,
};

export const altColorTitleBox = {
  background: colors.primary,
  padding: smallAbsoluteSpace
}

export const altColorTitle = {
  fontSize: titleFontSize,
  color: colors.altTitle,
}

export const altColorSubtitle = {
  fontSize: subtitleFontSize,
  color: colors.altSubtitle
}



export const metricSeparator = 5;
export const metricWidth = columnWidth;
export const metricBackgroundColor = colors.metricBackground;

export const shadow = `5px 5px 20px 1px ${colors.shadow}`;

