package server

import (
  "fmt"
  "net/http"
  "os"
  "strings"
  "github.com/Sirupsen/logrus"
  jwt "github.com/dgrijalva/jwt-go"
)

const (
  AUTH_HEADER = "Authorization"
)

// Look at each request, determine if the token
// provided in the Authorization header is a JWT that
// has been signed by someone we recognize.
// If so then we'll carry on with the request,
// if not then we reject the request: http.StatusUnauthorized (401).
// TODO: Put the JWT Claims into context.
func JWTHandler(handler http.Handler) http.Handler {
  return http.HandlerFunc( func (w http.ResponseWriter, r *http.Request) {
    f := logrus.Fields{
      "middleware": "JWTHandler",
      "method": r.Method,
      "url": r.URL.String(),
    }
    log.Info(f, "Checking Authorization")

    auth := r.Header.Get(AUTH_HEADER)
    if auth == "" {
      g := dupLogFields(f)
      addHeaders(g, r.Header)
      log.Debug(g, "No Authorization Header")
    } else {
      f["Authorization"] = auth
      log.Debug(f, "Authorization Header Found.")
    }

    token, err := getJWT(r);
    if err != nil {
      log.Error(f, "Failed to verify JWT. Stopping Request.", err)
      http.Error(w, fmt.Sprintf("Failed to marshall JSON for response: %s", err), http.StatusUnauthorized)
    } else {
      f["jwtRAW"] = token.Raw
      f["jwtClaims"] = fmt.Sprintf("%#v", token.Claims)
      f["jstHeader"] = tokenHeaderString(token)

      log.Debug(f, "Got JWT the token.")
      handler.ServeHTTP(w,r)
    }
  })
}

func getJWT(r*http.Request) (*jwt.Token, error){

  f := logrus.Fields{
    "middleware": "JWTHandler",
    "method": r.Method,
    "url": r.URL.String(),
  }

  token, err := fromAuthHeader(r)

  if err != nil {
    return nil, fmt.Errorf("Error extracting token: %s", err)
  }

  parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error ) {
      secret := []byte(os.Getenv("AUTH0_CLIENT_SECRET"))
      if len(secret) == 0 {
        return nil, fmt.Errorf("Missing Client Secret")
      }
      log.Debug(nil, fmt.Sprintf("Parse is using secert: %s", secret))
      return secret, nil
    })

  f["unparsedToken"] = token
  if err != nil {
    log.Error(f, "Can't parse token", err)
    return nil, err
  }

  f["parsedToken"] = parsedToken
  log.Debug(f, "Got a parsed token.")

  // TODO: Consider adding a check for which signing method we used against
  // what the parsedTokenHeader['alg'] says.

  if !parsedToken.Valid {
    err := fmt.Errorf("Parsed token is invlaid")
    log.Error(f, "Invalid token", err)
    return parsedToken, err
  }

  return parsedToken, nil
}

// If there is no header we quitely return an empty string.
func fromAuthHeader(r *http.Request) (string, error) {
  f := logrus.Fields{
    "middleware": "JWTHandler",
    "method": r.Method,
    "url": r.URL.String(),
  }

  authHeader := r.Header.Get(AUTH_HEADER);
  f[AUTH_HEADER] = authHeader;
  if authHeader == "" {
    err := fmt.Errorf("No Authorization header: %s", AUTH_HEADER)
    log.Error(f, "No token.", err )
    return "", err
  } else {
    log.Debug(f, "Got an AUTHORIZATION_HEADER")
  }

  authHeaderParts := strings.Split(authHeader, " ")
  if (len(authHeaderParts) != 2 || strings.ToLower(authHeaderParts[0]) != "bearer") {
    err := fmt.Errorf("Authorization header formatted incorrectly. Expecting \"bearer <TOKEN>\" got: %s", authHeader);
    log.Error(f, "Bad Authorization header.", err)
    return "", err;
  }

  f["token-encoded"] = authHeaderParts[0]
  log.Debug(f, "Got token from header")
  return authHeaderParts[1], nil
}

func tokenHeaderString(token *jwt.Token) (hs string) {
  for k, v := range token.Header {
    hs += fmt.Sprintf("[%s]: %#v,  ", k, v)
  }
  return hs
}

