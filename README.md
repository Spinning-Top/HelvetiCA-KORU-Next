# HelvetiCA KORU Next

## Domain details

### Structure

| Address | Purpose |
| ------- | ------- |
| api.helvetica.aero | production backend |
| api-dev.helvetica.aero | development backend |
| &nbsp; | &nbsp; |
| app.helvetica.aero | production frontend |
| app-dev.helvetica.aero | development frontend |
| &nbsp; | &nbsp; |
| services.helvetica.aero | services admin |
| | /pgadmin |
| | /portainer |
| | /rabbitmq-dev |
| | /rabbitmq-prod |
| &nbsp; | &nbsp; |
| certificates.helvetica.aero | QR code membership certificates |

### DNS

| Host | Type | Value |
| ---- | ---- | ----- |
| api.helvetica.aero | A | [SERVER_IP] |
| api-dev.helvetica.aero | A | [SERVER_IP] |
| app.helvetica.aero | A | [SERVER_IP] |
| app-dev.helvetica.aero | A | [SERVER_IP] |
| services.helvetica.aero | A | [SERVER_IP] |
| @ | MX | korumail.helvetica.aero |
| @ | TXT | v=spf1 a ip4:[SERVER_IP] mx -all |
| _dmarc | TXT | v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@helvetica.aero; ruf=mailto:dmarc-failures@helvetica.aero; fo=1 |
| korumail._domainkey | TXT | [KEY_DATA] |
| korumail | A | [SERVER_IP] |

## Server installation

## Helpful Commands

### Postfix external access

```
- installa socat
sudo apt install socat

- abilita porta 9090 su firewall
sudo ufw allow 9090/tcp comment "KORU Postfix-Server"

- attiva il portforwarding
socat TCP-LISTEN:9091,fork TCP:127.0.0.1:9090

- quando interrompi il comando socat con CTRL+C, anche il portforwarding si termina
```

### Docker delete all data

```
Rimuovere tutto da docker:

docker system prune -a --volumes
```
