import express from 'express';
import router from './src/router.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Hello, world!' });
});

app.use(router);

export default app;
