#!/bin/sh
cp install/.env-tests .env \
  && export $(grep -v '^#' .env | xargs) \
  && go test $(go list ./... | grep -v /vendor/) -v -coverprofile .testCoverage.txt -coverpkg=./... \
  && go tool cover -func=.testCoverage.txt > testReport.txt 