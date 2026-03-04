import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUserMd, FaPaperPlane, FaUser, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { messageAPI, doctorAPI } from '../../services/api';
import PatientLayout from '../../components/Patient/PatientLayout';
import toast from 'react-hot-toast';
import './PatientPages.css';

const PatientMessages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    loadConversations();
    pollingRef.current = setInterval(loadConversations, 5000);
    return () => clearInterval(pollingRef.current);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.username);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUsername) => {
    try {
      const res = await messageAPI.getHistory(otherUsername);
      setMessages(res.data);
      loadConversations();
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;
    try {
      await messageAPI.sendMessage(selectedChat.username, messageText.trim());
      setMessageText('');
      loadMessages(selectedChat.username);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await doctorAPI.getActiveDoctors();
      setDoctors(res.data.map(d => ({
        username: d.username,
        name: d.firstName && d.lastName ? `Dr. ${d.firstName} ${d.lastName}` : d.username
      })));
      setShowNewChat(true);
    } catch (err) {
      toast.error('Failed to load doctors');
    }
  };

  const startNewConversation = (doctorUsername) => {
    setShowNewChat(false);
    setSearchTerm('');
    const existing = conversations.find(c => c.username === doctorUsername);
    if (existing) {
      setSelectedChat(existing);
    } else {
      setSelectedChat({ username: doctorUsername, lastMessage: '', unreadCount: 0 });
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const oneDay = 86400000;
    if (diff < oneDay && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 2 * oneDay) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PatientLayout>
      <div className="page-container messages-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Messages</h1>
            <p className="page-subtitle">Communicate with your doctors</p>
          </div>
          <button className="btn-primary" onClick={handleNewChat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaPlus /> New Message
          </button>
        </div>

        <div className="messages-layout">
          <div className="conversations-list">
            <div className="conversations-header">
              <h3>Conversations</h3>
            </div>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No conversations yet. Start a new message!
              </div>
            ) : (
              conversations.map((conv, index) => (
                <motion.div
                  key={conv.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`conversation-item ${selectedChat?.username === conv.username ? 'active' : ''}`}
                  onClick={() => setSelectedChat(conv)}
                >
                  <div className="conversation-avatar">
                    <FaUserMd />
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header-row">
                      <h4>{conv.username}</h4>
                      <span className="conversation-time">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="conversation-preview-row">
                      <p className="conversation-preview">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="messages-content">
            {selectedChat ? (
              <>
                <div className="messages-header">
                  <div className="chat-user-info">
                    <div className="chat-avatar">
                      <FaUserMd />
                    </div>
                    <div>
                      <h3>{selectedChat.username}</h3>
                      <p className="user-status">Doctor</p>
                    </div>
                  </div>
                </div>

                <div className="messages-body">
                  {messages.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`message ${msg.senderUsername === user?.username ? 'me' : 'other'}`}>
                        <div className="message-bubble">
                          <p>{msg.content}</p>
                          <span className="message-time">{formatTime(msg.sentAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="messages-input-container">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="message-input"
                  />
                  <button onClick={handleSendMessage} className="send-btn">
                    <FaPaperPlane />
                  </button>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <FaUserMd className="no-chat-icon" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '450px' }}
            >
              <div className="modal-header">
                <h2>New Message</h2>
                <button className="modal-close" onClick={() => setShowNewChat(false)}>
                  <FaTimes />
                </button>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 12px 12px 38px', border: '1px solid #e0e0e0',
                      borderRadius: '10px', fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredDoctors.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      No doctors found.
                    </p>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.username}
                        onClick={() => startNewConversation(doctor.username)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                          borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s',
                          marginBottom: '4px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                        }}>
                          <FaUserMd />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#333' }}>{doctor.name}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>@{doctor.username}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default PatientMessages;
