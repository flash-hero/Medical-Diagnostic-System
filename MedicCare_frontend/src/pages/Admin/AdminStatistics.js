import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaCalendarCheck, FaUserMd, FaUsers } from 'react-icons/fa';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/Admin/AdminLayout';
import './AdminPages.css';

const AdminStatistics = () => {
  const monthlyData = [
    { month: 'Jan', appointments: 345, revenue: 34500, users: 120 },
    { month: 'Feb', appointments: 398, revenue: 39800, users: 145 },
    { month: 'Mar', appointments: 412, revenue: 41200, users: 168 },
    { month: 'Apr', appointments: 445, revenue: 44500, users: 189 },
    { month: 'May', appointments: 478, revenue: 47800, users: 210 },
    { month: 'Jun', appointments: 520, revenue: 52000, users: 235 },
  ];

  const specialtyData = [
    { specialty: 'Cardiology', count: 245 },
    { specialty: 'General', count: 456 },
    { specialty: 'Dermatology', count: 189 },
    { specialty: 'Pediatrics', count: 312 },
    { specialty: 'Neurology', count: 178 },
  ];

  const performanceMetrics = [
    { label: 'Avg Response Time', value: '2.5 min', icon: FaChartLine },
    { label: 'Satisfaction Rate', value: '94%', icon: FaUsers },
    { label: 'Doctor Availability', value: '87%', icon: FaUserMd },
    { label: 'Booking Rate', value: '76%', icon: FaCalendarCheck },
  ];

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="admin-page-title">Statistics & Analytics</h1>
          <p className="admin-page-subtitle">Detailed insights and performance metrics</p>
        </motion.div>

        <div className="metrics-grid">
          {performanceMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="metric-card"
            >
              <div className="metric-icon">
                <metric.icon />
              </div>
              <h3 className="metric-value">{metric.value}</h3>
              <p className="metric-label">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="admin-chart-card large"
        >
          <h2 className="chart-title">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3B3B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF3B3B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="appointments"
                stroke="#0066FF"
                fillOpacity={1}
                fill="url(#colorAppointments)"
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#FF3B3B"
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="admin-dashboard-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="admin-chart-card"
          >
            <h2 className="chart-title">Appointments by Specialty</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={specialtyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="specialty" stroke="#9CA3AF" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#0066FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="admin-chart-card"
          >
            <h2 className="chart-title">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStatistics;
