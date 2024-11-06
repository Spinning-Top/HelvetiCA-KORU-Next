#!/bin/bash

# Genera la chiave privata in memoria
PRIVATE_KEY=$(openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048)

# Genera la chiave pubblica dalla chiave privata
PUBLIC_KEY=$(echo "$PRIVATE_KEY" | openssl rsa -pubout 2>/dev/null)

# Rimuove i delimitatori e le nuove righe dalla chiave pubblica
DNS_PUBLIC_KEY=$(echo "$PUBLIC_KEY" | sed -n '/-----BEGIN PUBLIC KEY-----/,/-----END PUBLIC KEY-----/p' | sed '/-----/d' | tr -d '\n')

# Stampa la chiave privata
echo "Chiave privata DKIM:"
echo "$PRIVATE_KEY"
echo ""
echo "-----------------------------------"
echo ""

# Stampa la chiave pubblica in formato DNS
echo "Chiave pubblica DKIM da aggiungere nel record DNS (senza le virgolette iniziali e finali):"
echo "v=DKIM1; h=sha256; k=rsa; p=$DNS_PUBLIC_KEY"