const fastify = require('fastify')({ logger: true });
const mercurius = require('mercurius');
const schema = require('./schema')
fastify.register(require('@fastify/basic-auth'), { validate })


function validate (username, password, req, reply, done) {
    if (username === 'Tyrion' && password === 'wine') {
      done()
    } else {
      done(new Error('Winter is coming'))
    }
  }

fastify.register(mercurius, {
  schema,
  context: (request) => {
    return {
      user: request.user || null, // Attach the authenticated user to context
    };
  },
});

fastify.after(() => {
    fastify.addHook('onRequest', fastify.basicAuth)
})

const start = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

