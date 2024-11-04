# HelvetiCA KORU Next

---

externalUpdate e internalUpdate

AUTH

- durata del refreshToken aumentata
- Su iOS, salva il refreshToken nel Keychain, Su Android, utilizza il Secure Storage o il Keystore
- revoca i refreshTokens in caso di cambio password o attività sospette
- la registrazione deve essere abilitata o meno da qualche parte
- Utilizzare un campo tokenVersion per invalidare accessToken
