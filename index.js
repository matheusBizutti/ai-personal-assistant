require('dotenv').config();

const venom = require('venom-bot');
const express = require('express');

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

let client; // client of venom (WhatsApp)

// Call GPT with roles
async function callGPT(userMessage) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente pessoal amigável e prestativo, sempre claro e objetivo.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 150,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Erro na OpenAI:', error);
    return 'Desculpe, não consegui processar sua mensagem no momento.';
  }
}


// Start the venom-bot
venom
  .create({
    session: 'tempobot-session',
    multidevice: true,
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  .then((clientInstance) => {
    client = clientInstance;
    console.log('WhatsApp conectado! Escaneie o QR code se for a primeira vez.');

    // Listening WhatsApp Messages
    client.onMessage(async (message) => {
      if (!message.isGroupMsg) {
        console.log('Mensagem recebida:!!!!', message.body);
        console.log('Mensagem recebida:', message.body);

        // Call GPT to anwser
        const resposta = await callGPT(message.body);

        // send awnser to the same contact
        await client.sendText(message.from, resposta);
      }
    });
  })
  .catch((error) => {
    console.error('Erro ao iniciar o venom-bot:', error);
  });

// Endpoint test to verify if server is running ok
app.get('/', (req, res) => {
  res.send('Servidor rodando! Envie mensagens no WhatsApp para testar.');
});

// start the express server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);
});