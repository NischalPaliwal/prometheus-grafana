import express from 'express';
import { requestCountMiddleware, promClient } from './middleware.js';

const app = express();

app.use(requestCountMiddleware);

app.get('/cpu', (req, res) => {
  for (let i = 0; i < 10000000; i++) {
    Math.random();
  }
  res.json({
    message: "cpu"
  });
});

app.get('/user', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  res.json({
    message: {
      name: "Nischal Paliwal",
      profession: "Software Developer"
    }
  });
});

app.get('/metrics', async (req, res) => {
  const metrics = await promClient.register.metrics();
  res.set('Content-Type', promClient.register.contentType);
  res.end(metrics);
});

app.listen(4000);