package interactive

import(
  "fmt"
  "os"
  "strings"
  "text/tabwriter"
  "time"
  "github.com/aws/aws-sdk-go/service/ecs"
)
func collectStringPointers(strs []*string) (string) {
  cs := "["
  for _, s := range strs {
    cs += *s + ","
  }
  cs = strings.TrimRight(cs, ",")
  cs += "]"
  return cs
}

func shortDurationString(d time.Duration) (s string) {
  days := int(d.Hours()) / 24
  hours := int(d.Hours()) % 24
  minutes := int(d.Minutes()) % 60
  seconds := int(d.Seconds()) % 60

  if days == 0 && hours == 0 {
    return fmt.Sprintf("%dm %ds", minutes, seconds)
  }

  if days == 0 {
    return fmt.Sprintf("%dh %dm", hours, minutes)
  } 

  return fmt.Sprintf("%dd %dh %dm", days, hours, minutes)
}

func printFailures(failures []*ecs.Failure) {
  w := tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sARN\tReason%s\n", titleColor, resetColor)
  for _, f := range failures {
    reason := *f.Reason
    if strings.Compare("MISSING", *f.Reason) == 0 {
      reason += " service is likely not defined as spelled."
    }
    fmt.Fprintf(w, "%s%s\t%s%s\n", nullColor, *f.Arn, reason, resetColor)
  }
  w.Flush()
}

func nowString() (string) {
  return fmt.Sprintf("[%s] ", time.Now().Local().Format(time.RFC1123))
}