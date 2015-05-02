#!/bin/bash
proID=$(netstat -tlnp|grep 6001|awk '{print $7}'|awk -F '/' '{print $1}')
kill $proID;
nohup node server.js 6001 >> server.log &
