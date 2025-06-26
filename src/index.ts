
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { askQuestion } from './controllers/chat.controller';



const app = express();
app.use(cors());
app.use(express.json());

app.post('/ask', (req, res, next) => {
  Promise.resolve(askQuestion(req, res)).catch(next);
});

app.get('/', (req, res) => {
  res.send('Generic Chatbot API is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chatbot API running on port ${PORT}`);
});
