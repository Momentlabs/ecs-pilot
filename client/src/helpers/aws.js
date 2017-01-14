export const shortArn = (arn) => {
  let splits = arn.split('/');
  let short = splits[0];
  if (splits.length >= 2) {
    short = splits[1];
  }
  return short;
};