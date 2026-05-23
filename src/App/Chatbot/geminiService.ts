import type { PointOfInterest } from '../../types';

// Inicializar la API key
// Asumimos que la API key está en el .env.local como VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export const askGemini = async (
  question: string,
  points: PointOfInterest[],
  history: { text: string; sender: 'user' | 'bot' }[] = []
): Promise<string> => {
  if (!apiKey) {
    return 'Lo siento, no puedo responder porque la API Key de Gemini no está configurada. Por favor, añádela en tu archivo .env.local como VITE_GEMINI_API_KEY.';
  }

  try {
    // Preparar el contexto con la información de los puntos
    const contextText = points.map(p => 
      `Lugar: ${p.name}\nDescripción: ${p.description}`
    ).join('\n\n');

    const systemPrompt = `
Eres un asistente virtual experto e interactivo del proyecto "Kenedy", un mapa interactivo de la localidad de Kennedy en Bogotá.
Tu objetivo principal es conversar con los usuarios de manera natural, fluida, humana y muy acogedora.

Pautas críticas para una conversación natural y fluida:
1. Sé empático, cercano y amigable. Exprésate como un guía turístico local entusiasta y apasionado.
2. Recuerda el contexto y mantén el hilo de la conversación. Si el usuario te hace preguntas de seguimiento o relativas a mensajes anteriores, analízalas y respóndelas de forma coherente usando el historial del chat.
3. ¡NO saludes repetidamente ni uses la palabra "Hola" en cada respuesta! Si la conversación ya comenzó o el usuario ya fue saludado en el historial, continúa hablando fluidamente sin saludar de nuevo.
4. Explica y relata con estilo narrativo. En vez de recitar datos de forma robótica, integra los detalles históricos y culturales de manera amena.
5. Siempre que hables de un lugar, aporta datos curiosos o relatos fascinantes sobre el mismo, basándote en la información oficial y en un conocimiento histórico seguro de Kennedy.
6. Si te preguntan sobre temas totalmente ajenos al mapa y la localidad de Kennedy, responde de manera educada e ingeniosa reencaminando la conversación hacia los puntos culturales y de interés de Kennedy.

INFORMACIÓN DE LOS LUGARES REGISTRADOS:
${contextText}
`;

    // Formatear el historial reciente de conversación para dar contexto
    const historyText = history.length > 0
      ? history.map(msg => `${msg.sender === 'user' ? 'Usuario' : 'Asistente'}: ${msg.text}`).join('\n')
      : '';

    // Usamos la API REST directa de Gemini (compatible 100% con navegadores sin Node.js)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\n${historyText ? `Historial de la conversación:\n${historyText}\n` : ''}Usuario: ${question}\nAsistente:`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error de API Gemini:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude formular una respuesta.';
  } catch (error) {
    console.error('Error al consultar Gemini:', error);
    return 'Hubo un error al procesar tu pregunta. Por favor intenta de nuevo más tarde.';
  }
};
