const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY
});

const openai = new OpenAIApi(configuration);

app.get('/', async (req, res) => {
  res.json({
    message: 'Server is running!',
  });
});

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Maximum 20 requests per minute
});

app.use('/ask', limiter);

app.post('/ask', async (req, res) => {
  const prompt = req.body.prompt;
  console.log(prompt);
  try {
    if (prompt == null) {
      throw new Error('Uh oh, no prompt was provided');
    }
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1.0,
      max_tokens: 1000,
      top_p: 0.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
     let gptResponse = response.data.choices[0].text;
      gptResponse.replace(/\n/g, "");
    return res.status(200).json({
      success: true,
      message: gptResponse
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
});


app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
