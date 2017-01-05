package interactive

import(
  "fmt"
  "os"
  "sort"
  "time"
  // "strings"
  "text/tabwriter"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/dustin/go-humanize"

  "awslib"
  // "github.com/jdrivas/awslib"
)


func doListRepositories(sess *session.Session) (error) {
  repos, err := awslib.GetRepositories(sess)
  if err == nil {
    imageMap, err := awslib.GetAllImages(sess)    
    if err == nil {
      fmt.Printf("%sRepositories%s\n", titleColor, resetColor)
      w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
      fmt.Fprintf(w, "%sName\tImages\tCreatedAt\tLatest Update\tURI%s\n", titleColor, resetColor)
      // TODO: create a bit array that can be manipulated by these bools in the UI
      // and passed in as an argument to this function as an arg an evaluated by 
      // a different sort of switch state.
      switch {
        case sortByCreatedAt && sortByLastUpdate: return fmt.Errorf("Can't sort by both LastUpdte and CreatedAt.")
        case sortByCreatedAt: sort.Sort(awslib.ByRepoCreatedAt(repos))
        // case sortByLastUpdate: sort.Sort(awslib.ByRepoLastUpdate(repos))
        default: sort.Sort(awslib.ByRepoName(repos))
      }
      for _, r := range repos {
        il := imageMap[*r.RepositoryName]
        latestImage := il[0] // This is pre-sorted by GetAllImages.
        fmt.Fprintf(w, "%s%s\t%d\t%s\t%s\t%s%s\n", nullColor, 
          *r.RepositoryName, len(il), r.CreatedAt.Local().Format(time.RFC1123), 
          latestImage.ImagePushedAt.Local().Format(time.RFC1123), *r.RepositoryUri, 
          resetColor)
      }
      w.Flush()
    }
  }
  return err
}

func doListImages(repositoryName string, sess *session.Session) (error) {
  ids, err := awslib.GetImages(repositoryName, sess)
  if err == nil {
    fmt.Printf("%sImages for: \"%s\"%s\n", titleColor, repositoryName, resetColor)
    w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
    fmt.Fprintf(w, "%sPushedAt\tTags\tSize\tSHA%s\n", titleColor, resetColor)
    sort.Sort(sort.Reverse(awslib.ByPushedAt(ids)))
    for _, id := range ids {
      digest := "----"
      if id.ImageDigest != nil { digest = *id.ImageDigest }
      tags := "------"
      if len(id.ImageTags) != 0 {
        tags = awslib.JoinStringP(id.ImageTags, ", ")
      }
      bytes := uint64(*id.ImageSizeInBytes)
      fmt.Fprintf(w, "%s%s\t%s\t%s\t%s%s\n", nullColor, 
        id.ImagePushedAt.Local().Format(time.RFC1123), tags, humanize.Bytes(bytes), digest, resetColor)

    }
    w.Flush()
  }
  return err
}