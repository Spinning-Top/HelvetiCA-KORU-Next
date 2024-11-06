# HelvetiCA KORU Next

-------------------------------------------------------------------------------------------

- externalUpdate e internalUpdate

- questione del salvataggio da controller oppure autonomo

- ma sti rabbit per user li uso o lascio stare?

- lingua di default nello user

- template e-mails nel database

- trasforma il mail service in un microservice con i relativi rabbits

AUTH

- durata del refreshToken aumentata
- Su iOS, salva il refreshToken nel Keychain, Su Android, utilizza il Secure Storage o il Keystore
- revoca i refreshTokens in caso di cambio password o attività sospette
- la registrazione deve essere abilitata o meno da qualche parte
- Utilizzare un campo tokenVersion per invalidare accessToken
- invalidare il recoveryToken quando utilizzato

-------------------------------------------------------------------------------------------

DOMINIO

api.helvetica.aero            backend produzione
api-dev.helvetica.aero        backend sviluppo

services.helvetica.aero       accesso servizi
  /pgadmin
  /portainer
  /rabbitmq-dev
  /rabbitmq-prod

app.helvetica.aero            frontend produzione
app-dev.helvetica.aero        frontend sviluppo

certificates.helvetica.aero   verifica certificati

-------------------------------------------------------------------------------------------

DNS

api.helvetica.aero            A       [SERVER_IP]
api-dev.helvetica.aero        A       [SERVER_IP]
app.helvetica.aero            A       [SERVER_IP]
app-dev.helvetica.aero        A       [SERVER_IP]
services.helvetica.aero       A       [SERVER_IP]

@                             MX      korumail.helvetica.aero
@                             TXT     v=spf1 a ip4:[SERVER_IP] mx -all
_dmarc                        TXT     v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@helvetica.aero; ruf=mailto:dmarc-failures@helvetica.aero; fo=1
korumail._domainkey           TXT     [KEY_DATA]
korumail                      A       [SERVER_IP]

-------------------------------------------------------------------------------------------

DEPLOY con PM2 + Grafana e Prometheus
