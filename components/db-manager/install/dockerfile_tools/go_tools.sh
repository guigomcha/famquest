# Only apply in dockerfile
#!/bin/sh
git init \
  && git config --global user.email "ci@eviden.com" \
  && git config --global user.name "CI" \
  && git config --global safe.directory '*' \
  && git add . \
  && git commit -m "before" \
  && go mod tidy \
  && go fmt $(go list ./... | grep -v /vendor/) \
  && go vet $(go list ./... | grep -v /vendor/) \
  && git diff --exit-code # Exits if there is a change