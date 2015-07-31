@echo off
:loop
    echo Updating from git's http remote...
    set /p HEAD=<.git/refs/heads/master
    git fetch http
    git reset --hard http/master
    set /p NEWHEAD=<.git/refs/heads/master
    if %HEAD% == %NEWHEAD% goto start

    echo checking npm dependencies...
    cmd /c npm install

    :start
    echo Starting Wallace...
    title Wallace
    node main.js
    echo Pausing for 30 seconds to restart...
    PING 1.1.1.1 -n 1 -w 30000 >NUL
goto loop
