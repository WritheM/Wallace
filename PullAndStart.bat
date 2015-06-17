@echo off
:loop
echo "Updating from git's http remote..."
git fetch http
git reset --hard http/master
echo "checking npm dependancies..."
npm install
echo "Starting BotPlug..."
node main.js
echo "Pausing for 60 seconds to restart..."
PING 1.1.1.1 -n 1 -w 60000 >NUL
goto loop