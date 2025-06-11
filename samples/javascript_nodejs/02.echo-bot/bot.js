const { ActivityHandler } = require('botbuilder');

// ⬇⬇  SDK de Voz
const speech = require('microsoft-cognitiveservices-speech-sdk');

// Configuración de voz (usa las variables de entorno que ya agregaste)
const speechCfg = speech.SpeechConfig.fromSubscription(
  process.env.SPEECH_KEY,
  process.env.SPEECH_REGION
);
speechCfg.speechSynthesisVoiceName = 'es-CO-SalomeNeural';  // voz colombiana

// Función auxiliar: devuelve un Buffer WAV
async function synthesize(text) {
  return new Promise((resolve, reject) => {
    const synthesizer = new speech.SpeechSynthesizer(speechCfg);
    synthesizer.speakTextAsync(
      text,
      result => resolve(Buffer.from(result.audioData)),
      err   => reject(err)
    );
  });
}

class EchoBot extends ActivityHandler {
  constructor() {
    super();

    // Evento mensaje
    this.onMessage(async (context, next) => {
      const userText = context.activity.text;

      // 1) síntesis
      const audioBuffer = await synthesize(userText);

      // 2) envía texto + audio
      await context.sendActivity({
        text: userText,
        attachments: [{
          contentType: 'audio/wav',
          contentUrl: `data:audio/wav;base64,${audioBuffer.toString('base64')}`,
          name: 'respuesta.wav'
        }]
      });
      await next();
    });

    // Evento conversación iniciada
    this.onMembersAdded(async (context, next) => {
      const welcome = '¡Hola! Soy Ceci. Escríbeme algo y te responderé con voz.';
      const audioBuffer = await synthesize(welcome);
      await context.sendActivity({
        text: welcome,
        attachments: [{
          contentType: 'audio/wav',
          contentUrl: `data:audio/wav;base64,${audioBuffer.toString('base64')}`,
          name: 'bienvenida.wav'
        }]
      });
      await next();
    });
  }
}

module.exports.EchoBot = EchoBot;

