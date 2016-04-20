#!/bin/bash
# proID=$(netstat -tlnp|grep 6001|awk '{print $7}'|awk -F '/' '{print $1}')
# kill $proID;
PIDFile="./config/pids"
kill -9 $(<"$PIDFile")
rm -rf ./config/pids
nohup node server.js 6001 >> server.log &
nohup node s-server.js 6002 >> s-server.log &
