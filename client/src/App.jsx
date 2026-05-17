import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NotFoundPage from './pages/NotFoundPage';


export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/"   element={<Navigate to="/courses" replace />} />
          <Route path="*"   element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
  );
}