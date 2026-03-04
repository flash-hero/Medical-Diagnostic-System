import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaUserMd,
  FaNotesMedical,
  FaFileMedical,
  FaFilter,
} from 'react-icons/fa';
import PatientLayout from '../../components/Patient/PatientLayout';
import { patientAPI } from '../../services/api';
import './PatientPages.css';

const PatientHistory = () => {
  const [filter, setFilter] = useState('all');
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await patientAPI.getHistory();
        const records = (res.data || []).map(r => ({
          id: r.id,
          type: r.type || 'appointment',
          date: r.date,
          doctor: r.doctorName,
          title: r.title,
          notes: r.notes || '',
          documents: [],
        }));
        setMedicalHistory(records);
      } catch (err) {
        console.error('Error fetching history:', err);
        setMedicalHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory =
    filter === 'all'
      ? medicalHistory
      : medicalHistory.filter((item) => item.type === filter);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <FaCalendarAlt />;
      case 'prescription':
        return <FaNotesMedical />;
      case 'lab':
        return <FaFileMedical />;
      default:
        return <FaUserMd />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'appointment':
        return 'Appointment';
      case 'prescription':
        return 'Prescription';
      case 'lab':
        return 'Lab Result';
      default:
        return 'Medical Record';
    }
  };

  return (
    <PatientLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Medical History</h1>
            <p className="page-subtitle">View your complete health records</p>
          </div>
        </div>

        <div className="filter-bar">
          <FaFilter className="filter-icon" />
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Records
            </button>
            <button
              className={`filter-btn ${filter === 'appointment' ? 'active' : ''}`}
              onClick={() => setFilter('appointment')}
            >
              Appointments
            </button>
            <button
              className={`filter-btn ${filter === 'prescription' ? 'active' : ''}`}
              onClick={() => setFilter('prescription')}
            >
              Prescriptions
            </button>
            <button
              className={`filter-btn ${filter === 'lab' ? 'active' : ''}`}
              onClick={() => setFilter('lab')}
            >
              Lab Results
            </button>
          </div>
        </div>

        <div className="history-timeline">
          {filteredHistory.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="history-item"
            >
              <div className="history-date">
                <span>{record.date}</span>
              </div>
              <div className="history-icon">
                {getTypeIcon(record.type)}
              </div>
              <div className="history-content">
                <div className="history-header">
                  <div>
                    <span className="history-type">{getTypeLabel(record.type)}</span>
                    <h3 className="history-title">{record.title}</h3>
                    <p className="history-doctor">
                      <FaUserMd /> {record.doctor}
                    </p>
                  </div>
                </div>
                <p className="history-notes">{record.notes}</p>
                {record.documents.length > 0 && (
                  <div className="history-documents">
                    <strong>Documents:</strong>
                    <div className="document-list">
                      {record.documents.map((doc, i) => (
                        <button key={i} className="document-btn">
                          <FaFileMedical />
                          {doc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientHistory;
