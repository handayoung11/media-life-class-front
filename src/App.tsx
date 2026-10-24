import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from '@/lib/user-context';
import { LoginPage } from '@/components/LoginPage';
import { LoginCallback } from '@/components/LoginCallback';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/dashboard/*" element={<DashboardLayout />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
