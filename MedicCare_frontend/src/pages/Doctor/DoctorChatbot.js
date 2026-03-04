import React from 'react';
import { motion } from 'framer-motion';
import DoctorLayout from '../../components/Doctor/DoctorLayout';
import Chatbot from '../../components/Chatbot';
import './DoctorPages.css';

const DoctorChatbot = () => {
  return (
    <DoctorLayout>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="page-title">Medical AI Assistant</h1>
          <p className="page-subtitle">Get clinical insights and medical information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Chatbot apiEndpoint="/doctor/chatbot" userRole="doctor" />
        </motion.div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorChatbot;
