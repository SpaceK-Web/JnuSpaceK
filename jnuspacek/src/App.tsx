import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ElderlyPage from './pages/ElderlyPage';
import GuardianPage from './pages/GuardianPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/elderly"  element={<ElderlyPage />} />
        <Route path="/guardian" element={<GuardianPage />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
