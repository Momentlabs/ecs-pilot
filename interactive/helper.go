package interactive

import(
  "fmt"
  "strings"
  "time"
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