import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { aiAPI } from '../services/api';
import './Chatbot.css';

const Chatbot = ({ apiEndpoint, userRole }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello! I'm your medical assistant. ${
        userRole === 'patient'
          ? 'I can help you understand symptoms and provide health information.'
          : 'I can help you with medical information and patient care guidance.'
      }`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAPI.chat(inputMessage);
      const botResponse = {
        id: Date.now() + 1,
        text: response.data || "I'm sorry, I couldn't process your request.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    'Book an appointment',
    'View my history',
    'Common symptoms',
    'Emergency contacts',
  ];

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="bot-avatar">
            <FaRobot />
          </div>
          <div>
            <h3>Medical AI Assistant</h3>
            <span className="bot-status">
              <span className="status-dot"></span> Online
            </span>
          </div>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`chatbot-message ${msg.sender}`}
          >
            {msg.sender === 'bot' && (
              <div className="message-avatar">
                <FaRobot />
              </div>
            )}
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="chatbot-message bot">
            <div className="message-avatar">
              <FaRobot />
            </div>
            <div className="message-bubble typing">
              <FaSpinner className="spinner" />
              <span>Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="quick-action-btn"
            onClick={() => setInputMessage(action)}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="chatbot-input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="chatbot-input"
        />
        <button
          onClick={handleSend}
          className="chatbot-send-btn"
          disabled={isLoading || !inputMessage.trim()}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
