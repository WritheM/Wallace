@echo off
:loop
git fetch http
git reset --hard http/master
node main.js
goto loop