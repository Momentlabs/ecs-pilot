package interactive

import(
  "testing"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/stretchr/testify/assert"
)

func skipOnShort(t *testing.T){
  if testing.Short() { t.SkipNow() }
}

func testSession(t *testing.T) ( sess *session.Session ) {
  testProfile := "mclib-test"
  s, err := session.NewSessionWithOptions(session.Options{
    Profile: testProfile,
    SharedConfigState: session.SharedConfigEnable,  
  })
  if assert.NoError(t, err) {
    sess = s
  }
  return sess
}