import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaUserMd,
  FaCalendarCheck,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/Admin/AdminLayout';
import { adminAPI } from '../../services/api';
import './AdminPages.css';

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState({ totalPatients: 0, totalDoctors: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          adminAPI.getStats().catch(() => ({ data: { totalPatients: 0, totalDoctors: 0 } })),
          adminAPI.getUsers().catch(() => ({ data: [] })),
        ]);
        setStatsData(statsRes.data || {});
        setAllUsers(usersRes.data || []);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalUsers = allUsers.length;
  const doctorCount = allUsers.filter(u => u.role?.toLowerCase() === 'doctor').length;
  const patientCount = allUsers.filter(u => u.role?.toLowerCase() === 'patient').length;

  const stats = [
    { label: 'Total Users', value: totalUsers.toString(), change: '', trend: 'up', icon: FaUsers },
    { label: 'Doctors', value: (statsData.totalDoctors || doctorCount).toString(), change: '', trend: 'up', icon: FaUserMd },
    { label: 'Patients', value: (statsData.totalPatients || patientCount).toString(), change: '', trend: 'up', icon: FaUsers },
    { label: 'Appointments', value: '-', change: '', trend: 'up', icon: FaCalendarCheck },
  ];

  const userGrowthData = [
    { month: 'Jan', patients: 850, doctors: 120 },
    { month: 'Feb', patients: 920, doctors: 135 },
    { month: 'Mar', patients: 980, doctors: 142 },
    { month: 'Apr', patients: 1020, doctors: 148 },
    { month: 'May', patients: 1050, doctors: 152 },
    { month: 'Jun', patients: 1091, doctors: 156 },
  ];

  const appointmentData = [
    { name: 'Completed', value: 1854, color: '#10B981' },
    { name: 'Pending', value: 287, color: '#F59E0B' },
    { name: 'Cancelled', value: 200, color: '#FF3B3B' },
  ];

  const recentActivity = allUsers.slice(-4).reverse().map((u, i) => ({
    id: u.id || i,
    user: u.username,
    action: `registered as ${u.role}`,
    time: '',
  }));

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="admin-page-title">System Dashboard</h1>
          <p className="admin-page-subtitle">Monitor and manage your healthcare platform</p>
        </motion.div>

        <div className="admin-stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="admin-stat-card"
            >
              <div className="admin-stat-header">
                <div className="admin-stat-icon">
                  <stat.icon />
                </div>
                <span className={`admin-stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                  {stat.change}
                </span>
              </div>
              <h3 className="admin-stat-value">{stat.value}</h3>
              <p className="admin-stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="admin-dashboard-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="admin-chart-card"
          >
            <h2 className="chart-title">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="patients" stroke="#0066FF" strokeWidth={2} />
                <Line type="monotone" dataKey="doctors" stroke="#FF3B3B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="admin-chart-card"
          >
            <h2 className="chart-title">Appointment Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-activity-card"
        >
          <h2 className="chart-title">Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p>
                    <strong>{activity.user}</strong> {activity.action}
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
