import type { PointOfInterest } from '../../types';

// Inicializar la API key
// Asumimos que la API key está en el .env.local como VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export const askGemini = async (question: string, points: PointOfInterest[]): Promise<string> => {
  if (!apiKey) {
    return 'Lo siento, no puedo responder porque la API Key de Gemini no está configurada. Por favor, añádela en tu archivo .env.local como VITE_GEMINI_API_KEY.';
  }

  try {
    // Preparar el contexto con la información de los puntos
    const contextText = points.map(p => 
      `Lugar: ${p.name}\nDescripción: ${p.description}`
    ).join('\n\n');

    const systemPrompt = `
Eres un asistente virtual experto del proyecto "Kenedy", un mapa interactivo de la localidad de Kennedy en Bogotá.
Tu objetivo principal es responder a las preguntas de los usuarios estrictamente basándote en la siguiente información de los lugares registrados en el mapa.
Además, siempre que puedas, aporta "datos curiosos" sobre el lugar por el que te preguntan, basándote en la descripción o en tu conocimiento general seguro sobre esos lugares específicos de Kennedy, pero mantén tus respuestas concisas, amables y muy atractivas.

Si te preguntan algo que no tiene NADA que ver con los lugares mencionados, responde educadamente que tu especialidad es hablar sobre los puntos de interés del proyecto Kenedy.

INFORMACIÓN DE LOS LUGARES:
${contextText}
`;

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
                text: `${systemPrompt}\n\nPregunta del usuario: ${question}`
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
