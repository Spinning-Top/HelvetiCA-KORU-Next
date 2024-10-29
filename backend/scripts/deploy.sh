#!/bin/bash

# Parametri del server SFTP
SFTP_USER="tuo_username"
SFTP_HOST="sftp.example.com"
SFTP_DIR="/percorso/remoto"

LOCAL_DIRS=(
    "./core"
    "./feature"
)

# Funzione per caricare i file via SFTP
upload_to_sftp() {
  local file_list="$1"
  local sftp_user="$2"
  local sftp_host="$3"
  local sftp_dir="$4"

  # Creiamo un file temporaneo per i comandi SFTP
  temp_sftp_script=$(mktemp)

  # Creiamo il comando SFTP per caricare i file
  echo "cd $sftp_dir" > "$temp_sftp_script"
  for file in $file_list; do
    echo "put $file" >> "$temp_sftp_script"
  done

  # Eseguiamo lo script SFTP
  sftp "$sftp_user@$sftp_host" < "$temp_sftp_script"

  # Rimuoviamo il file temporaneo
  rm "$temp_sftp_script"
}

# Lista dei file trovati
file_list=""

# Scansiona ricorsivamente le cartelle specificate
for dir in "${LOCAL_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "Scansione della cartella: $dir"
    build_dirs=$(find "$dir" -type d -name "build")
    for build_dir in $build_dirs; do
      echo "Trovata cartella 'build' in: $build_dir"
      files=$(find "$build_dir" -type f)
      file_list="$file_list $files"
    done
  else
      echo "La directory $dir non esiste"
  fi
done

# Se abbiamo trovato file, carichiamo su SFTP
if [ -n "$file_list" ]; then
  echo "Caricamento dei file trovati su SFTP..."
  echo $file_list
  # upload_to_sftp "$file_list" "$SFTP_USER" "$SFTP_HOST" "$SFTP_DIR"
else
  echo "Nessun file trovato nelle cartelle 'build'."
fi
