import React from 'react';
import './ChatMessage.css';

function ChatMessage({ message }) {
  // Adiciona uma classe 'professional' se a mensagem foi enviada pelo profissional
  const messageClass = message.sender === 'professional' ? 'message professional' : 'message patient';
  
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={messageClass}>
      <div className="message-bubble">
        <p className="message-text">{message.text}</p>
        <span className="message-time">{formattedTime}</span>
      </div>
    </div>
  );
}

export default ChatMessage;
