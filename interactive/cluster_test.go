package interactive

import(
  "fmt"
  "math/rand"
  "testing"
  "github.com/stretchr/testify/assert"

  // "awslib"
  "github.com/jdrivas/awslib"
)

func TestClusterCache(t *testing.T) {
  skipOnShort(t)
  cn := fmt.Sprintf("UNIT-TEST-CLUSTER-%d", rand.Intn(1000))

  sess := testSession(t)
  cCache.Update(sess)
  there, err := cCache.Contains(cn, sess)
  if assert.Nil(t, err, "Error checking cache.") {
    assert.False(t, there, "Unexpectedly found cluster name in cache \"%s\"", cn)
  }

  _, err = awslib.CreateCluster(cn, sess)
  if assert.Nil(t, err, "Error creating cluster \"%s\"", cn) {
    there, err = cCache.Contains(cn, sess)
    if assert.Nil(t, err, "Error checking for name in cache.") {
      assert.True(t, there, "Failed to find new cluster name in cache \"%s\"", cn)
    }

    _, err = awslib.DeleteCluster(cn, sess)
    // NOTE: Note the line below implements the expecged behavior of DoDeleteCache in the app.
    cCache.Update(sess) 
    if assert.Nil(t, err, "Error deleting cluster \"%s\"", cn)  {
      there, err = cCache.Contains(cn, sess)
      if assert.Nil(t, err, "Error checking for name in cache.") {
        assert.False(t, there, "Found deleted cluster still in cache: \"%s\"", cn)
      }
    }
  }
}