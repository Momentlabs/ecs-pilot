package server

import (
    "github.com/Sirupsen/logrus"
)

func addHeaders(f logrus.Fields, headers map[string][]string) (logrus.Fields) {
  for k, v := range headers {
    f[k] = v
  }
  return f
}

func dupLogFields(f logrus.Fields) (logrus.Fields) {
  g := logrus.Fields{}
  for k, v := range f {
    g[k] = v
  }
  return g
}
