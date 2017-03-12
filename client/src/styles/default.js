import * as colors from './colors';


export const xSmallRelativeSpace = ".25em";     // Small space between text (e.g. Title and subtitle)
export const smallRelativeSpace = ".5em";     // Small space between text (e.g. Title and subtitle)
export const primaryRelativeSpace = "2em";    // Basic space between text and visual elements.

export const smallAbsoluteSpace = 5;          // very small spaces (e.g. small space between metric boxes and title bar and group)
export const primaryAbsoluteSpace = "2em";    // TODO THIS IS NOT ABSOLUTE!
export const largerAbsoluteSpace = "4em";

export const columnWidth = "6em";             // TODO: This should be an absolute number

export const titleFontSize = "x-large";

export const subtitleFontSize = "11pt";

export const title = {
  fontSize: titleFontSize,
  color: colors.title,
};

export const subtitle = {
  fontSize: subtitleFontSize,
  color: colors.subtitle,
};

export const metricSeparator = 5;
export const metricWidth = columnWidth;

export const shadow = `5px 5px 20px 1px ${colors.shadow}`;

