#!/bin/bash

while true; do
  HEAD="$(cat .git/refs/heads/master)"

  echo "Updating from git's http remote..."
  git fetch http
  git reset --hard http/master

  NEWHEAD="$(cat .git/refs/heads/master)";

  if [ "$HEAD" != "$NEWHEAD" ]; then
    echo checking npm dependencies...
    npm install
  fi

  echo Starting Wallace
  node main.js

  echo Pausing for 30 seconds to restart...
  sleep 30
done;
