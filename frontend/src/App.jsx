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

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" />}
      />

      <Route
        element={
          user ? <DashboardLayout /> : <Navigate to="/login" />
        }
      >

        <Route
          path="/"
          element={
            <Navigate
              to={
                user?.role === "ADMIN" || user?.role === "MANAGER"
                  ? "/dashboard"
                  : "/rooms"
              }
            />
          }
        />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms" element={<RoomMap />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/ai-feedback" element={<AIFeedback />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/payroll-list" element={<PayrollList />} />
        <Route path="/my-payroll" element={<MyPayroll />} />
        <Route path="/my-bonus-penalty" element={<MyBonusPenalty />} />
        <Route path="/bonus-penalty" element={<BonusPenaltyManagement />} />
        <Route path="/shifts" element={<Shifts />} />
        <Route path="/staff-assignment" element={<StaffAssignment />} />
        <Route path="/products" element={<Products />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/settings" element={<RoomPricing />} />
        <Route path="/profile" element={<Profile />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Route>
    </Routes>
  );
}

export default App;