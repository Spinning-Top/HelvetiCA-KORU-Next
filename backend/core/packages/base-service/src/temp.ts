/*
  // init jwt
  this.hono.use("*", jwt({ secret: this.getHandler().getGlobalConfig().auth.jwtSecret }));

  this.hono.get('/', async (c: Context) => {
    const data = await c.req.parseBody();
    return c.json({ message: 'Hello, world!', data });
  })

  this.hono.post('/', async (c: Context) => {
    // Recupera i dati inviati nella richiesta
    const data = await c.req.parseBody();
  
    // Stampa i dati su schermo
    console.log('Dati ricevuti:', data);
  
    return c.json({ message: 'Dati ricevuti con successo', data });
  });

  this.hono.get('/test', (c) => {
    const payload = c.get('jwtPayload')
    return c.json(payload) // eg: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
  })
*/
