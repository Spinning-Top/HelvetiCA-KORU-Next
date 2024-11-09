- template e-mails nel database

- trasforma il mail service in un microservice con i relativi rabbits

- manda le e-mail transazionali previste

- externalUpdate e internalUpdate

AUTH

- durata del refreshToken aumentata
- revoca i refreshTokens in caso di cambio password o attività sospette
- la registrazione deve essere abilitata o meno da qualche parte
- Utilizzare un campo tokenVersion per invalidare accessToken
- invalidare il recoveryToken quando utilizzato

---

MODULES

core

- backup
- changelog
- feedback
- guide
- storage

feature

- article
- broadcast
- candidate
- emergencyDoc
- group
- inquiry
- language
- member
- section
- status
- unit

---

- Su iOS, salva il refreshToken nel Keychain, Su Android, utilizza il Secure Storage o il Keystore

- DEPLOY con PM2 + Grafana e Prometheus

---

{ name: "app", script: "./deno.js", interpreter: "deno", interpreter_args: "run --allow-net --allow-read", },

    3.	cwd: La directory di lavoro del processo.
    12.	error_file: Percorso per il file di log degli errori.
    13.	out_file: Percorso per il file di log dell’output.
