/*
// hono setup
      this.hono.use("*", async (c: Context, next) => {
        // Logga la richiesta
        const method = c.req.method;
        const url = c.req.url;
        this.handler.getLog().info(`Received ${method} request for ${url}`);
      
        // Cerca l'endpoint corrispondente
        const endpoint: Endpoint | undefined = this.endpoints.find(
          (e) => e.getUrl() === url && e.getMethod() === method
        );
        console.log(endpoint);
      
        // Passa al prossimo middleware o route handler
        await next();
      });



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
