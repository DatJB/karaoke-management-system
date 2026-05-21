import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RoomMap from './pages/RoomMap'
import Customers from './pages/Customers'
import Invoices from './pages/Invoices'
import Employees from './pages/Employees'
import AIFeedback from './pages/AIFeedback'
import Payroll from './pages/Payroll'
import PayrollList from './pages/PayrollList'
import MyPayroll from './pages/MyPayroll'
import MyBonusPenalty from './pages/MyBonusPenalty'
import BonusPenaltyManagement from './pages/BonusPenaltyManagement'
import Shifts from './pages/Shifts'
import StaffAssignment from './pages/StaffAssignment'
import Products from './pages/Products'
import Accounts from './pages/Accounts'
import RoomPricing from './pages/RoomPricing'
import Profile from './pages/Profile'
import Revenue from './pages/Revenue'
import InvoiceSecurity from './pages/InvoiceSecurity'
import KeyManagement from './pages/KeyManagement'
const RequireRole = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  const ADMIN_ONLY = ['ADMIN'];
  const MANAGERS = ['ADMIN', 'MANAGER'];
  const PERSONAL_ONLY = ['STAFF', 'RECEPTIONIST'];
  const NO_STAFF = ['ADMIN', 'MANAGER', 'RECEPTIONIST'];
  const NO_RECEPTIONIST = ['ADMIN', 'MANAGER', 'STAFF'];
  const ALL_ROLES = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF'];

  const getHomeRoute = (role) => {
    if (MANAGERS.includes(role)) return "/dashboard";
    if (role === 'RECEPTIONIST' || role === 'STAFF') return "/rooms";
    return "/login";
  };

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

      <Route element={user ? <DashboardLayout /> : <Navigate to="/login" />}>

        <Route path="/" element={<Navigate to={getHomeRoute(user?.role)} />} />

        {/* ADMIN ONLY */}
        <Route element={<RequireRole allowedRoles={ADMIN_ONLY}><RoomPricing /></RequireRole>} path="/settings" />

        {/* ADMIN, MANAGER */}
        <Route element={<RequireRole allowedRoles={MANAGERS}><Dashboard /></RequireRole>} path="/dashboard" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><Employees /></RequireRole>} path="/employees" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><AIFeedback /></RequireRole>} path="/ai-feedback" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><Payroll /></RequireRole>} path="/payroll" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><PayrollList /></RequireRole>} path="/payroll-list" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><BonusPenaltyManagement /></RequireRole>} path="/bonus-penalty" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><Revenue /></RequireRole>} path="/revenue" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><StaffAssignment /></RequireRole>} path="/staff-assignment" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><Accounts /></RequireRole>} path="/accounts" />

        {/* ADMIN, MANAGER, RECEPTIONIST */}
        <Route element={<RequireRole allowedRoles={NO_STAFF}><Customers /></RequireRole>} path="/customers" />
        <Route element={<RequireRole allowedRoles={NO_STAFF}><Invoices /></RequireRole>} path="/invoices" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><InvoiceSecurity /></RequireRole>} path="/invoices/security" />
        <Route element={<RequireRole allowedRoles={MANAGERS}><KeyManagement /></RequireRole>} path="/security/keys" />
        {/* ADMIN, MANAGER, STAFF */}
        <Route element={<RequireRole allowedRoles={NO_RECEPTIONIST}><Products /></RequireRole>} path="/products" />

        {/* STAFF, RECEPTIONIST */}
        <Route element={<RequireRole allowedRoles={PERSONAL_ONLY}><MyPayroll /></RequireRole>} path="/my-payroll" />
        <Route element={<RequireRole allowedRoles={PERSONAL_ONLY}><MyBonusPenalty /></RequireRole>} path="/my-bonus-penalty" />

        {/* ALL ROLES */}
        <Route element={<RequireRole allowedRoles={ALL_ROLES}><RoomMap /></RequireRole>} path="/rooms" />
        <Route element={<RequireRole allowedRoles={ALL_ROLES}><Shifts /></RequireRole>} path="/shifts" />
        <Route element={<RequireRole allowedRoles={ALL_ROLES}><Profile /></RequireRole>} path="/profile" />

        <Route path="*" element={<Navigate to="/" />} />

      </Route>
    </Routes>
  );
}

export default App;