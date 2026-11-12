import express from 'express';
import router from './src/router.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: 'json' };

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

app.use((error, req, res, next) => {
  const bookWrite = (req.method === 'POST' && /^\/books\/?$/i.test(req.path))
    || (req.method === 'PUT' && /^\/books\/[^/]+\/?$/i.test(req.path));
  if (!bookWrite) {
    return next(error);
  }
  if (error.type === 'entity.parse.failed' || error.status === 415) {
    return res.status(400).json({ message: 'Invalid book data' });
  }
  console.error('Failed to parse book request.');
  return res.status(500).json({ message: 'Internal server error' });
});

app.use((error, req, res, next) => {
  const authorWrite = (req.method === 'POST' && /^\/authors\/?$/i.test(req.path))
    || (req.method === 'PUT' && /^\/authors\/[^/]+\/?$/i.test(req.path));
  if (!authorWrite) {
    return next(error);
  }
  if (error.type === 'entity.parse.failed' || error.status === 415) {
    return res.status(400).json({ message: 'Invalid author data' });
  }
  console.error('Failed to parse author request.');
  return res.status(500).json({ message: 'Internal server error' });
});

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Hello, world!' });
});

app.use(router);

export default app;
