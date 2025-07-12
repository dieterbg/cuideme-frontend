import React from 'react';
import './ChatMessage.css'; // Vamos criar este arquivo de estilo a seguir

function ChatMessage({ message }) {
  // Determina a classe CSS para diferenciar mensagens do paciente e do sistema
  const messageClassName = `chat-message ${message.sender === 'patient' ? 'patient' : 'system'}`;

  return (
    <div className={messageClassName}>
      <div className="message-bubble">
        <p className="message-text">{message.text}</p>
        <span className="message-timestamp">{message.timestamp}</span>
      </div>
    </div>
  );
}

export default ChatMessage;
