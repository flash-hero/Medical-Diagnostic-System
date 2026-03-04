import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaUpload,
  FaHeartbeat,
  FaLungs,
  FaThermometerHalf,
  FaTint,
  FaWeight,
  FaUser,
  FaRobot,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import PatientLayout from '../../components/Patient/PatientLayout';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './PatientPages.css';

const PatientDiseasePrediction = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cancer');
  
  // Cancer Prediction State
  const [cancerImage, setCancerImage] = useState(null);
  const [cancerImagePreview, setCancerImagePreview] = useState(null);
  const [cancerResult, setCancerResult] = useState(null);
  const [cancerLoading, setCancerLoading] = useState(false);

  // Disease Prediction State
  const [diseaseData, setDiseaseData] = useState({
    age: '',
    sex: '',
    bloodType: '',
    bodyTemperature: '',
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    bmi: '',
    symptomCough: false,
    symptomFatigue: false,
    symptomSoreThroat: false,
    symptomShortnessOfBreath: false,
    symptomHeadache: false
  });
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);

  // Handle Cancer Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setCancerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCancerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Cancer Prediction
  const handleCancerPrediction = async () => {
    if (!cancerImage) {
      toast.error('Please upload an image first');
      return;
    }

    setCancerLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', cancerImage);
      const response = await aiAPI.scanCancer(formData);
      const data = response.data;
      setCancerResult({
        prediction: data.prediction || data.label || 'Unknown',
        confidence: data.confidence ? (data.confidence * 100).toFixed(2) : 'N/A',
        details: 'Based on the uploaded medical image analysis using deep learning model'
      });
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Cancer prediction error:', error);
      toast.error('Prediction failed. Make sure the AI server is running on port 8000.');
    } finally {
      setCancerLoading(false);
    }
  };

  // Handle Disease Form Input
  const handleDiseaseInput = (e) => {
    const { name, value, type, checked } = e.target;
    setDiseaseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle Disease Prediction
  const handleDiseasePrediction = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!diseaseData.age || !diseaseData.sex || !diseaseData.bloodType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setDiseaseLoading(true);
    try {
      const payload = {
        Age: parseInt(diseaseData.age),
        Sex: diseaseData.sex,
        Blood_Type: diseaseData.bloodType,
        Body_Temperature: parseFloat(diseaseData.bodyTemperature) || 37.0,
        Heart_Rate: parseInt(diseaseData.heartRate) || 72,
        Systolic_BP: parseInt(diseaseData.systolicBP) || 120,
        Diastolic_BP: parseInt(diseaseData.diastolicBP) || 80,
        BMI: parseFloat(diseaseData.bmi) || 22.0,
        Symptom_Cough: diseaseData.symptomCough ? 1 : 0,
        Symptom_Fatigue: diseaseData.symptomFatigue ? 1 : 0,
        Symptom_Sore_Throat: diseaseData.symptomSoreThroat ? 1 : 0,
        Symptom_Shortness_of_Breath: diseaseData.symptomShortnessOfBreath ? 1 : 0,
        Symptom_Headache: diseaseData.symptomHeadache ? 1 : 0,
      };
      const response = await aiAPI.predictDisease(payload);
      const data = response.data;
      setDiseaseResult({
        disease: data.prediction || data.disease || 'Unknown',
        confidence: data.confidence ? (typeof data.confidence === 'number' && data.confidence <= 1 ? (data.confidence * 100).toFixed(2) : parseFloat(data.confidence).toFixed(2)) : 'N/A',
        recommendations: [
          'Get adequate rest',
          'Stay hydrated',
          'Consult with a doctor if symptoms persist',
          'Monitor your temperature regularly'
        ]
      });
      toast.success('Prediction complete!');
    } catch (error) {
      console.error('Disease prediction error:', error);
      toast.error('Prediction failed. Make sure the AI server is running on port 8000.');
    } finally {
      setDiseaseLoading(false);
    }
  };

  // Navigate to Chatbot with Context
  const goToChatbot = (type) => {
    const data = type === 'cancer' 
      ? { type: 'cancer', result: cancerResult }
      : { type: 'disease', data: diseaseData, result: diseaseResult };
    
    navigate('/patient/chatbot', { state: { predictionData: data } });
  };

  return (
    <PatientLayout>
      <motion.div
        className="disease-prediction-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <h1>
            <FaHeartbeat /> Disease Prediction
          </h1>
          <p>Advanced AI-powered health analysis and disease prediction</p>
        </div>

        {/* Tab Navigation */}
        <div className="prediction-tabs">
          <button
            className={`tab-btn ${activeTab === 'cancer' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancer')}
          >
            <FaLungs /> Cancer Detection
          </button>
          <button
            className={`tab-btn ${activeTab === 'disease' ? 'active' : ''}`}
            onClick={() => setActiveTab('disease')}
          >
            <FaHeartbeat /> Disease Prediction
          </button>
        </div>

        {/* Cancer Detection Tab */}
        {activeTab === 'cancer' && (
          <motion.div
            className="prediction-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-card">
              <h2><FaLungs /> Cancer Image Analysis</h2>
              <p>Upload a medical image for AI-powered cancer detection</p>

              <div className="image-upload-area">
                {!cancerImagePreview ? (
                  <label htmlFor="cancer-image" className="upload-label">
                    <FaUpload />
                    <span>Click to upload or drag and drop</span>
                    <small>PNG, JPG up to 5MB</small>
                    <input
                      type="file"
                      id="cancer-image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                ) : (
                  <div className="image-preview">
                    <img src={cancerImagePreview} alt="Preview" />
                    <button 
                      className="remove-image-btn"
                      onClick={() => {
                        setCancerImage(null);
                        setCancerImagePreview(null);
                        setCancerResult(null);
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <button
                className="predict-btn primary"
                onClick={handleCancerPrediction}
                disabled={!cancerImage || cancerLoading}
              >
                {cancerLoading ? 'Analyzing...' : 'Analyze Image'}
              </button>

              {/* Cancer Result */}
              {cancerResult && (
                <motion.div
                  className="result-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`result-header ${cancerResult.prediction === 'Negative' ? 'negative' : 'positive'}`}>
                    {cancerResult.prediction === 'Negative' ? (
                      <FaCheckCircle className="result-icon" />
                    ) : (
                      <FaTimesCircle className="result-icon" />
                    )}
                    <h3>Result: {cancerResult.prediction}</h3>
                  </div>
                  <div className="result-details">
                    <p><strong>Confidence:</strong> {cancerResult.confidence}%</p>
                    <p>{cancerResult.details}</p>
                  </div>
                  <button 
                    className="ai-assistant-btn"
                    onClick={() => goToChatbot('cancer')}
                  >
                    <FaRobot /> Get AI Assistant Help
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Disease Prediction Tab */}
        {activeTab === 'disease' && (
          <motion.div
            className="prediction-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-card">
              <h2><FaHeartbeat /> Disease Prediction Form</h2>
              <p>Fill in your health information for AI-powered disease prediction</p>

              <form onSubmit={handleDiseasePrediction} className="disease-form">
                <div className="form-grid">
                  {/* Personal Information */}
                  <div className="form-group">
                    <label><FaUser /> Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={diseaseData.age}
                      onChange={handleDiseaseInput}
                      placeholder="Enter your age"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FaUser /> Sex *</label>
                    <select
                      name="sex"
                      value={diseaseData.sex}
                      onChange={handleDiseaseInput}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label><FaTint /> Blood Type *</label>
                    <select
                      name="bloodType"
                      value={diseaseData.bloodType}
                      onChange={handleDiseaseInput}
                      required
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  {/* Vital Signs */}
                  <div className="form-group">
                    <label><FaThermometerHalf /> Body Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bodyTemperature"
                      value={diseaseData.bodyTemperature}
                      onChange={handleDiseaseInput}
                      placeholder="e.g., 37.0"
                    />
                  </div>

                  <div className="form-group">
                    <label><FaHeartbeat /> Heart Rate (bpm)</label>
                    <input
                      type="number"
                      name="heartRate"
                      value={diseaseData.heartRate}
                      onChange={handleDiseaseInput}
                      placeholder="e.g., 72"
                    />
                  </div>

                  <div className="form-group">
                    <label>Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      name="systolicBP"
                      value={diseaseData.systolicBP}
                      onChange={handleDiseaseInput}
                      placeholder="e.g., 120"
                    />
                  </div>

                  <div className="form-group">
                    <label>Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      name="diastolicBP"
                      value={diseaseData.diastolicBP}
                      onChange={handleDiseaseInput}
                      placeholder="e.g., 80"
                    />
                  </div>

                  <div className="form-group">
                    <label><FaWeight /> BMI</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bmi"
                      value={diseaseData.bmi}
                      onChange={handleDiseaseInput}
                      placeholder="e.g., 22.5"
                    />
                  </div>
                </div>

                {/* Symptoms */}
                <div className="symptoms-section">
                  <h3>Symptoms</h3>
                  <div className="symptoms-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="symptomCough"
                        checked={diseaseData.symptomCough}
                        onChange={handleDiseaseInput}
                      />
                      <span>Cough</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="symptomFatigue"
                        checked={diseaseData.symptomFatigue}
                        onChange={handleDiseaseInput}
                      />
                      <span>Fatigue</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="symptomSoreThroat"
                        checked={diseaseData.symptomSoreThroat}
                        onChange={handleDiseaseInput}
                      />
                      <span>Sore Throat</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="symptomShortnessOfBreath"
                        checked={diseaseData.symptomShortnessOfBreath}
                        onChange={handleDiseaseInput}
                      />
                      <span>Shortness of Breath</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="symptomHeadache"
                        checked={diseaseData.symptomHeadache}
                        onChange={handleDiseaseInput}
                      />
                      <span>Headache</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="predict-btn primary"
                  disabled={diseaseLoading}
                >
                  {diseaseLoading ? 'Analyzing...' : 'Predict Disease'}
                </button>
              </form>

              {/* Disease Result */}
              {diseaseResult && (
                <motion.div
                  className="result-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`result-header ${diseaseResult.disease === 'Healthy' ? 'negative' : 'positive'}`}>
                    {diseaseResult.disease === 'Healthy' ? (
                      <FaCheckCircle className="result-icon" />
                    ) : (
                      <FaHeartbeat className="result-icon" />
                    )}
                    <h3>Prediction: {diseaseResult.disease}</h3>
                  </div>
                  <div className="result-details">
                    <p><strong>Confidence:</strong> {diseaseResult.confidence}%</p>
                    <div className="recommendations">
                      <h4>Recommendations:</h4>
                      <ul>
                        {diseaseResult.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button 
                    className="ai-assistant-btn"
                    onClick={() => goToChatbot('disease')}
                  >
                    <FaRobot /> Get AI Assistant Help
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </PatientLayout>
  );
};

export default PatientDiseasePrediction;
