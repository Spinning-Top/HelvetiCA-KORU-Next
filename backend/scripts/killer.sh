#!/bin/bash

porta_inizio=8100
porta_fine=8400

# Loop attraverso l'intervallo di porte
for ((porta=porta_inizio; porta<=porta_fine; porta++))
do
  # Trova il PID del processo che sta usando la porta specifica
  pid=$(lsof -t -i :$porta)

  # Se esiste un PID, termina il processo
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $porta"
    kill -9 $pid
  fi
done

porta_inizio=9100
porta_fine=9400

# Loop attraverso l'intervallo di porte
for ((porta=porta_inizio; porta<=porta_fine; porta++))
do
  # Trova il PID del processo che sta usando la porta specifica
  pid=$(lsof -t -i :$porta)

  # Se esiste un PID, termina il processo
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $porta"
    kill -9 $pid
  fi
done