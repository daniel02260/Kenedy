import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { askGemini } from './geminiService';
import './Chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const WELCOME_GREETINGS = [
  "¡Bienvenido! Soy el guía virtual de Kenedy. ¿Qué rincón de nuestra hermosa localidad te gustaría explorar hoy?",
  "¡Hola, explorador! Estoy aquí para contarte las historias y secretos de los lugares más emblemáticos de Kennedy. ¿Por dónde empezamos?",
  "¡Qué alegría tenerte por aquí! Soy tu guía virtual. Pregúntame sobre cualquier lugar de nuestra localidad y te revelaré datos curiosos fascinantes.",
  "¡Saludos! Soy el asistente del mapa de Kenedy. ¿De qué punto histórico te gustaría descubrir un secreto hoy?",
  "¡Hola! Soy el asistente virtual de Kenedy. ¿Sobre qué lugar te gustaría conocer un dato curioso hoy?",
  "¿Listo para un viaje por la historia de Kennedy? Soy tu asistente virtual. Dime qué lugar te llama la atención hoy."
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const randomGreeting = WELCOME_GREETINGS[Math.floor(Math.random() * WELCOME_GREETINGS.length)];
    return [
      {
        id: 'welcome',
        text: randomGreeting,
        sender: 'bot',
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { points, registerPointChatQuery, isAdmin } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Todos los hooks DEBEN estar antes de cualquier return condicional
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botResponseText = await askGemini(userMessage.text, points, messages);

    // Buscar si se menciona algún punto y registrar consulta
    points.forEach(p => {
      if (
        userMessage.text.toLowerCase().includes(p.name.toLowerCase()) ||
        botResponseText.toLowerCase().includes(p.name.toLowerCase())
      ) {
        registerPointChatQuery(p.id);
      }
    });

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: 'bot',
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  // Ocultar el chatbot completamente para administradores
  // Este return va DESPUÉS de todos los hooks para no violar las Reglas de Hooks de React
  if (isAdmin) return null;

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>🤖 Guía Virtual Kenedy</h3>
            <button className="close-btn" onClick={toggleChat}>
              ✕
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre un lugar..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="chatbot-button" onClick={toggleChat} title="Habla con nuestro asistente">
          💬 Chat para descubrir curiosidades de Kennedy
        </button>
      )}
    </div>
  );
};

export default Chatbot;
