#!/bin/bash

start_port=8100
end_port=8400

for ((port=start_port; port<=end_port; port++))
do
  pid=$(lsof -t -i :$port)
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid
  fi
done

start_port=9100
end_port=9400

for ((port=start_port; port<=end_port; port++))
do
  pid=$(lsof -t -i :$port)
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid
  fi
done
