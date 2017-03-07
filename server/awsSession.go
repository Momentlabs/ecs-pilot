package server

import (
  "context"
  "fmt"
  "net/http"
  "github.com/Sirupsen/logrus"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/credentials"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/sts"
  jwt "github.com/dgrijalva/jwt-go"

)

const (
  AWS_SESSION_CTX_KEY = "AWS_SESSION_CTX_KEY"
)

// This is how a controller gets the right AWS Session
func getAWSSession(r *http.Request) (sess *session.Session, err error) {
  ctx := r.Context()
  ctxSess := ctx.Value(AWS_SESSION_CTX_KEY)
  if ctxSess == nil {
    err = fmt.Errorf("Failed to get AWS Session from request context")
    log.Debug(nil,"getAWSSession(): Failed to get AWS Session from request context")
    return nil, err
  }
  sess  = ctxSess.(*session.Session)
  return sess, nil
}


// This is the middleware that puts the 'right session' into the context for
// the above.
// NOTE: For this to wrk in delegate mode it requires
// a JWT  inthe context at TOKEN_CTX_KEY.
// TODO:
// If this whole thing was going to have to work on it's own, without knoweldge
// of the auth.go piece, I'd  want to pass a 'getToken()' function into this
// handler function here.
func AwsSessionHandler(
    handler http.Handler, 
    baseSession *session.Session, 
    delegateWithJWT bool) (http.Handler) {
  return http.HandlerFunc( func (w http.ResponseWriter, r *http.Request) {

    f := logrus.Fields{
      "middleware": "AwsSessionHandler",
      "method": r.Method,
      "url": r.URL.String(),
    }
    log.Info(f, "Getting AWS Session")

    var err error
    sess := baseSession
    if delegateWithJWT {
      sess, err = sessionFromRequest(r, baseSession)
      if err != nil {
        log.Error(f, "Failed to get AWS session", err);
        http.Error(w, fmt.Sprintf("Failed to get AWS Session: %s", err), http.StatusFailedDependency)
        return;
      }
    }

    r = r.WithContext(context.WithValue(r.Context(), AWS_SESSION_CTX_KEY, sess))
    handler.ServeHTTP(w,r)

  })
}

func sessionFromRequest(r *http.Request, baseSession *session.Session) (sess *session.Session, err error){
  f := logrus.Fields{}  

  ctx := r.Context()
  token := ctx.Value(TOKEN_CTX_KEY)
  var jwToken *jwt.Token
  if token == nil {
    log.Debug(f, "No user JWT token found")
    // http.Error(w, fmt.Sprintf("No token: %s", err), http.
  } else {
    log.Debug(f, fmt.Sprintf("JwT Token from context: %#v", token));
    jwToken = token.(*jwt.Token)
    claims := jwToken.Claims.(jwt.MapClaims)
    f["name"] = claims["name"]
    f["sub"] = claims["sub"]
    f["nickname"] = claims["nickname"]
    log.Debug(f, "Token Claim Data retrieved")
  }
  return sessionForToken(baseSession, jwToken)
}

const (
  CLAIMS_KEY_USER_META_DATA = "user_metadata"
  META_DATA_KEY_ROLE_ARN = "awsRoleArn"
  META_DATA_KEY_EXTERNAL_ID = "awsExternalID"
)

func sessionForToken(baseSession *session.Session, token *jwt.Token) (sess *session.Session, err error) {
  claims := token.Claims.(jwt.MapClaims)

  md := claims[CLAIMS_KEY_USER_META_DATA]
  if md == nil {
    return nil, fmt.Errorf("Failed to obtain user_meta_data from JWT Claims")
  }
  metaData := md.(map[string]interface{})

  ra := metaData[META_DATA_KEY_ROLE_ARN]
  if ra == nil {
    return nil, fmt.Errorf("Failed to obtain RoleArn: Not in JWT Claims")
  }
  roleArn := ra.(string)


  xu := metaData[META_DATA_KEY_EXTERNAL_ID]
  if xu == nil {
    return nil, fmt.Errorf("Railed to obtain External User ID: Not in JWT Claims")
  }
  xUserID := xu.(string)
  sessionName := "ECS_PILOT_TEST_SESSION"

  stsSvc := sts.New(baseSession)
  // Request Credentials for role/xUser.
  params := &sts.AssumeRoleInput{
    RoleArn: aws.String(roleArn),
    RoleSessionName: aws.String(sessionName),
    DurationSeconds: aws.Int64(3600),
    ExternalId: aws.String(xUserID),
  }
  resp, err := stsSvc.AssumeRole(params)
  if err != nil {
    return nil, fmt.Errorf("Failed to create session for token. Failed to AssumeRole %s for user: %s. %s", roleArn, xUserID, err)
  }

  // Make a session from those credentials.
  stsCred := resp.Credentials
  creds := credentials.NewStaticCredentials(*stsCred.AccessKeyId, *stsCred.SecretAccessKey, *stsCred.SessionToken)
  cfg := &aws.Config{
    Credentials: creds,
    Region: baseSession.Config.Region,
  }

  sess, err = session.NewSession(cfg)
  return sess, err
}
 
