import * as defaultStyles from '../styles/default';

export class KeyGenerator {
  constructor(keyString="Key-") {
    this.counter = 0;
    this.keyString=keyString;
  }

  reset() { this.counter = 0;}
  nextKey() { return this.keyString + this.counter++; }
}

// This isn't perfect, but should allow us to merge a baselevel style object
// into a single Component Styel
export function mergeStyles(original, mergeIn, keyToMergeTo) {

  let newObject = (original === undefined) ? {} : JSON.parse(JSON.stringify(original)); // this should deep copy fine for style objects.
  let mergeTo = (keyToMergeTo && (keyToMergeTo != "")) ? newObject[keyToMergeTo] : newObject;
  for (var k in mergeIn) {
    mergeTo[k] = mergeIn[k];
  }
  return newObject;
}

export function columnWidth(n) {
  const width = (defaultStyles.columnWidthPt * n) + (n-1)*defaultStyles.columnGutterPt;
  console.log("helpers#ui#columWidth()", "columns:", n, "width:", width);
  const styleVal = (width === 0) ? "auto" : width;
  return "" + styleVal + "pt";
}