@echo off
:loop
git fetch http
git reset --hard http/master
npm install
node main.js
PING 1.1.1.1 -n 1 -w 60000 >NUL
goto loop
