import React from 'react';
import { motion } from 'framer-motion';
import PatientLayout from '../../components/Patient/PatientLayout';
import Chatbot from '../../components/Chatbot';
import './PatientPages.css';

const PatientChatbot = () => {
  return (
    <PatientLayout>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="page-title">AI Health Assistant</h1>
          <p className="page-subtitle">
            Get instant insights about your symptoms and health concerns
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Chatbot apiEndpoint="/patient/chatbot" userRole="patient" />
        </motion.div>
      </div>
    </PatientLayout>
  );
};

export default PatientChatbot;
