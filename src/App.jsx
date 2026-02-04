import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VisitorForm from './components/VisitorForm';
import VisitorSuccess from './components/VisitorSuccess';
import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/Dashboard';
import Visitors from './admin/Visitors';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<VisitorForm />} />
        <Route path="/success" element={<VisitorSuccess />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/visitors"
          element={
            <ProtectedRoute>
              <Visitors />
            </ProtectedRoute>
          }
        />

        {/* Redirect /admin to /admin/login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
