import * as colors from './colors';


export const xSmallRelativeSpace = ".25em";     // Small space between text (e.g. Title and subtitle)
export const smallRelativeSpace = ".5em";     // Small space between text (e.g. Title and subtitle)
export const primaryRelativeSpace = "2em";    // Basic space between text and visual elements.

function ptToStyle(p) {return p + "pt";}
export const smallAbsoluteSpacePt = 4;
export const smallAbsoluteSpace = ptToStyle(smallAbsoluteSpacePt);          // very small spaces (e.g. small space between metric boxes and title bar and group)
export const primaryAbsoluteSpacePt = 20;
export const primaryAbsoluteSpace = ptToStyle(primaryAbsoluteSpacePt);    
export const largerAbsoluteSpacePt = 2 * primaryAbsoluteSpacePt;
export const largerAbsoluteSpace = ptToStyle(largerAbsoluteSpacePt);

// n*10pt
export const columnWidthPt = 60;
export const columnWidth = ptToStyle(columnWidthPt);
export const rowHeightPt = columnWidthPt;
export const rowHeight = ptToStyle(rowHeightPt);

export const columnGutterPt = 4;
export const rowGutterPt = smallAbsoluteSpacePt;
export const columnGutter = ptToStyle(columnGutterPt);
export const rowGutter = ptToStyle(rowGutterPt);
export const gridTitleFontSize = "12pt";

export const metricFontSize = "x-large";
export const metricSeparator = columnGutter;
export const metricWidth = columnWidth;
export const metricBackgroundColor = colors.metricBackground;
export const longMetricFontSize = "large";
export const metricTitleSize = "medium";

export const titleFontSize = "x-large";
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
};

export const altColorTitle = {
  fontSize: titleFontSize,
  color: colors.altTitle,
};

export const altColorSubtitle = {
  fontSize: subtitleFontSize,
  color: colors.altSubtitle
};


export const shadow = `5px 5px 20px 1px ${colors.shadow}`;

