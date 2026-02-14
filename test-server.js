import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ status: 'OK' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

