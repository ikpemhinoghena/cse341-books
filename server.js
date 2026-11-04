import app from './app.js';

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('PORT environment variable is required.');
}

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
