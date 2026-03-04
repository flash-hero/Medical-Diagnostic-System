# MedicCare - Healthcare Platform Frontend

A modern, futuristic medical website built with React.js featuring AI-powered diagnostics, appointment management, and comprehensive dashboards for patients, doctors, and administrators.

## 🌟 Features

### 🏥 Multi-Role System
- **Patient Portal**: AI chatbot, appointment booking, medical history
- **Doctor Dashboard**: Appointment management, patient records, direct messaging
- **Admin Panel**: User management, statistics, and analytics

### 🎨 Design
- Futuristic medical theme with blue, white, and red color scheme
- Smooth animations using Framer Motion
- Responsive design for all devices
- Toast notifications for user feedback
- Floating chat component for direct messaging

### 🤖 AI Features
- Chatbot for disease prediction and health advice
- Available for both patients and doctors
- Quick action buttons for common queries

### 📱 Core Features

#### Patient Features:
- Dashboard with upcoming appointments and quick stats
- AI Health Assistant for symptom checking
- Book, view, and manage appointments
- Complete medical history with filtering
- Direct messaging with doctors

#### Doctor Features:
- Dashboard with today's schedule
- Accept, decline, or reschedule appointments
- Patient records management
- Add clinical notes (online/in-person)
- Direct messaging with patients and colleagues
- AI assistant for medical information

#### Admin Features:
- Comprehensive dashboard with statistics
- User management (create, edit, delete users)
- Analytics with interactive charts
- Monitor system performance
- View recent activity

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- FastAPI backend (for API consumption)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Medic
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` and add your FastAPI backend URL:
```
REACT_APP_API_URL=http://localhost:8000
```

4. **Start the development server**
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Credentials

### Patient Account
- Email: `patient@test.com`
- Password: any (for demo)

### Doctor Account
- Email: `doctor@test.com`
- Password: any (for demo)

### Admin Account
- Email: `admin@test.com`
- Password: any (for demo)

## 📁 Project Structure

```
Medic/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── AdminLayout.js
│   │   │   └── AdminLayout.css
│   │   ├── Doctor/
│   │   │   ├── DoctorLayout.js
│   │   │   └── DoctorLayout.css
│   │   ├── Patient/
│   │   │   ├── PatientLayout.js
│   │   │   └── PatientLayout.css
│   │   ├── Chatbot.js
│   │   ├── Chatbot.css
│   │   ├── FloatingChat.js
│   │   ├── FloatingChat.css
│   │   └── ProtectedRoute.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminUsers.js
│   │   │   ├── AdminStatistics.js
│   │   │   └── AdminPages.css
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Auth.css
│   │   ├── Doctor/
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── DoctorAppointments.js
│   │   │   ├── DoctorPatients.js
│   │   │   ├── DoctorChatbot.js
│   │   │   ├── DoctorMessages.js
│   │   │   └── DoctorPages.css
│   │   ├── Landing/
│   │   │   ├── Landing.js
│   │   │   └── Landing.css
│   │   └── Patient/
│   │       ├── PatientDashboard.js
│   │       ├── PatientChatbot.js
│   │       ├── PatientAppointments.js
│   │       ├── PatientHistory.js
│   │       └── PatientPages.css
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🛠️ Technology Stack

- **React.js** - Frontend framework
- **React Router** - Navigation
- **Framer Motion** - Animations
- **React Icons** - Icon library
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Date-fns** - Date formatting

## 🎨 Color Scheme

- Primary Blue: `#0066FF`
- Dark Blue: `#003D99`
- Light Blue: `#E6F2FF`
- Red Accent: `#FF3B3B`
- White: `#FFFFFF`
- Success Green: `#10B981`
- Warning Yellow: `#F59E0B`

## 🔌 API Integration

The application is designed to work with a FastAPI backend. Update the `src/services/api.js` file to connect to your backend:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### API Endpoints Expected

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

#### Patient
- `GET /patient/appointments` - Get patient appointments
- `POST /patient/appointments` - Book new appointment
- `GET /patient/history` - Get medical history
- `POST /patient/chatbot` - AI chatbot interaction
- `GET /patient/messages` - Get messages
- `POST /patient/messages` - Send message

#### Doctor
- `GET /doctor/appointments` - Get doctor's appointments
- `PATCH /doctor/appointments/:id` - Update appointment status
- `GET /doctor/patients` - Get patient list
- `POST /doctor/patients/:id/notes` - Add patient note
- `POST /doctor/chatbot` - AI chatbot interaction
- `GET /doctor/messages` - Get messages
- `POST /doctor/messages` - Send message

#### Admin
- `GET /admin/statistics` - Get platform statistics
- `GET /admin/users` - Get all users
- `PATCH /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/dashboard` - Get dashboard data

## 📱 Features Overview

### Animations
- Fade-in animations on page load
- Hover effects on interactive elements
- Smooth transitions between pages
- Pulse animations for notifications
- Floating card animations on landing page

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Collapsible sidebars on mobile
- Adaptive grid layouts

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- High contrast color scheme

## 🚧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (one-way operation)
npm run eject
```

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For support, email your-email@example.com or open an issue in the repository.

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Framer Motion for smooth animations
- Recharts for beautiful data visualizations
- All contributors and users of this platform

---

**Built with ❤️ for better healthcare**
