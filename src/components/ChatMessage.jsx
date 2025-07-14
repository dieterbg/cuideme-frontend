import React from 'react';
import './ChatMessage.css';

function ChatMessage({ message }) {
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
