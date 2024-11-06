- externalUpdate e internalUpdate

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

---

DEPLOY con PM2 + Grafana e Prometheus
