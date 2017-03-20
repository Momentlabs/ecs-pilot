export const shortArn = (arn) => {
  let splits = arn.split('/');
  let short = splits[0];
  if (splits.length >= 2) {
    short = splits[1];
  }
  return short;
};

// TODO: This only works really on AWS ECR repos.
// need to discover the repo source from the name 
// and act accordingly. In particular this will break
// for dockerhub repos like:  gilderlabs/logspout.
export const shortRepoName = (repo) => {
  let splits = repo.split('/');
  let short = splits[0];
  if (splits.length >= 2) {
    short = "aws-ecr:" + splits[1];
  }
  // return repo;
  return short;
};