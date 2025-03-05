package logger

import (
	"fmt"
	"io"
	"os"

	logging "github.com/op/go-logging"
)

var (
	Log = ConfigureLogger("common")
)

func ConfigureLogger(name string) *logging.Logger {
	// Example format string. Everything except the message has a custom color
	// which is dependent on the log level. Many fields have a custom output
	// formatting too, eg. the time returns the hour down to the milli second.
	format := logging.MustStringFormatter(
		`%{color}%{time:15:04:05.000} %{shortpkg}/%{shortfile} %{level:.3s} %{id:03x}%{color:reset} ▶ %{message}`,
	)
	if os.Getenv("LOGS_FORMAT") != "" {
		format = logging.MustStringFormatter(os.Getenv("LOGS_FORMAT"))
	}
	logging.SetFormatter(format)
	log := logging.MustGetLogger(name)
	backend := logging.NewLogBackend(os.Stdout, "", 0)
	if os.Getenv("LOGS_DISCARD") == "True" {
		backend = logging.NewLogBackend(io.Discard, "", 0)
	}
	backendLeveled := logging.AddModuleLevel(backend)
	backendLeveled.SetLevel(logging.DEBUG, name)
	if os.Getenv("LOG_LEVEL") != "" {
		level, err := logging.LogLevel(os.Getenv("LOG_LEVEL"))
		if err != nil {
			log.Errorf("Unable to set log level. Setting DEBUG: %s\n", err.Error())
			backendLeveled.SetLevel(logging.DEBUG, name)
		} else {
			backendLeveled.SetLevel(level, name)
		}
	}
	// Set the backends to be used.
	logging.SetBackend(backendLeveled)
	return log
}

// Useful as a deferred function to make sure we see panic errors when LOGS_DISCARD == True
func PrintPanic() {
	if r := recover(); r != nil {
		fmt.Println("Internal Error due to: ", r)
	}
}
