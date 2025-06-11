// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// @ts-check
const path = require('path');
const dotenv = require('dotenv');
const restify = require('restify');

// ⬇ ⬇  IMPORTA el bot modificado
const { EchoBot } = require('./bot');     // <- bot con voz

// .env
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Bot Framework SDK
const {
    CloudAdapter,
    ConfigurationBotFrameworkAuthentication
} = require('botbuilder');

// 1. Crear servidor HTTP
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening : ${server.url}`);
    console.log('Abra el Bot Framework Emulator y seleccione "Open Bot"');
});

// 2. Crear adapter
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env);
const adapter = new CloudAdapter(botFrameworkAuthentication);

// 3. Manejo global de errores
adapter.onTurnError = async (context, error) => {
    console.error(`[onTurnError] ${error}`);
    await context.sendActivity('El bot encontró un error.');
};

// 4. Instanciar el bot
const myBot = new EchoBot();

// 5. End-points de mensajería
server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (ctx) => myBot.run(ctx));
});
server.on('upgrade', async (req, socket, head) => {
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);
    streamingAdapter.onTurnError = adapter.onTurnError;
    await streamingAdapter.process(req, socket, head, (ctx) => myBot.run(ctx));
});
