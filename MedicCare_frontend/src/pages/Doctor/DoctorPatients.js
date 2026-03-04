import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaNotesMedical,
  FaPlus,
  FaHistory,
} from 'react-icons/fa';
import DoctorLayout from '../../components/Doctor/DoctorLayout';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './DoctorPages.css';

const DoctorPatients = () => {
  const { user } = useAuth();
  const doctorName = user?.name || user?.username || '';
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [experienceType, setExperienceType] = useState('online');
  const [patients, setPatients] = useState([]);
  const [patientNotes, setPatientNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorName) fetchPatients();
  }, [doctorName]);

  const fetchPatients = async () => {
    try {
      const res = await doctorAPI.getAppointments(doctorName);
      const appointments = res.data || [];
      const uniquePatients = {};
      appointments.forEach(apt => {
        const p = apt.patient;
        if (p && p.username && !uniquePatients[p.username]) {
          uniquePatients[p.username] = {
            id: p.id,
            username: p.username,
            name: p.firstName ? `${p.firstName} ${p.lastName || ''}` : p.username,
            email: '',
            phone: p.phoneNumber || '',
            lastVisit: apt.appointmentDate,
            condition: apt.reason || 'General',
          };
        }
      });
      setPatients(Object.values(uniquePatients));
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      const res = await doctorAPI.getNotes(patient.username);
      setPatientNotes(res.data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setPatientNotes([]);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }
    try {
      await doctorAPI.addNote({
        patientUsername: selectedPatient.username,
        doctorName: doctorName,
        note: noteText,
        type: experienceType,
      });
      toast.success('Patient note added successfully!');
      setNoteText('');
      const res = await doctorAPI.getNotes(selectedPatient.username);
      setPatientNotes(res.data || []);
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  return (
    <DoctorLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Patient Records</h1>
            <p className="page-subtitle">Manage patient information and add clinical notes</p>
          </div>
        </div>

        <div className="patients-layout">
          <div className="patients-list-section">
            <h2 className="section-title">My Patients</h2>
            <div className="patients-list">
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`patient-list-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="patient-list-avatar">
                    <FaUser />
                  </div>
                  <div className="patient-list-info">
                    <h4>{patient.name}</h4>
                    <p>{patient.condition}</p>
                    <span className="last-visit">Last visit: {patient.lastVisit}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="patient-details-section">
            {selectedPatient ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="patient-details"
              >
                <div className="patient-header-card">
                  <div className="patient-avatar-large">
                    <FaUser />
                  </div>
                  <div className="patient-header-info">
                    <h2>{selectedPatient.name}</h2>
                    <p className="patient-condition">{selectedPatient.condition}</p>
                    <div className="patient-contact">
                      <div className="contact-item">
                        <FaEnvelope />
                        <span>{selectedPatient.email}</span>
                      </div>
                      <div className="contact-item">
                        <FaPhone />
                        <span>{selectedPatient.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="add-note-section">
                  <h3 className="subsection-title">
                    <FaPlus /> Add New Note/Experience
                  </h3>
                  <div className="experience-type-selector">
                    <label>
                      <input
                        type="radio"
                        value="online"
                        checked={experienceType === 'online'}
                        onChange={(e) => setExperienceType(e.target.value)}
                      />
                      <span>Website Consultation</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="in-person"
                        checked={experienceType === 'in-person'}
                        onChange={(e) => setExperienceType(e.target.value)}
                      />
                      <span>In-Person Visit</span>
                    </label>
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter clinical notes, observations, treatment updates..."
                    rows="4"
                    className="note-textarea"
                  />
                  <button className="btn btn-primary" onClick={handleAddNote}>
                    <FaPlus /> Add Note
                  </button>
                </div>

                <div className="notes-history-section">
                  <h3 className="subsection-title">
                    <FaHistory /> Clinical Notes History
                  </h3>
                  <div className="notes-timeline">
                    {patientNotes.length > 0 ? patientNotes.map((note, index) => (
                      <div key={note.id || index} className="note-item">
                        <div className="note-header">
                          <span className="note-date">{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}</span>
                          <span className={`note-type ${note.type}`}>
                            {note.type === 'online' ? 'Website' : 'In-Person'}
                          </span>
                        </div>
                        <p className="note-text">{note.note}</p>
                      </div>
                    )) : (
                      <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '10px' }}>No clinical notes yet</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="no-selection">
                <FaNotesMedical className="no-selection-icon" />
                <p>Select a patient to view details and add notes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatients;
