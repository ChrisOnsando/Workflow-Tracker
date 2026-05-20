import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ApplicationList from './pages/ApplicationList'
import ApplicationForm from './pages/ApplicationForm'
import ApplicationDetail from './pages/ApplicationDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicationList />} />
        <Route path="/applications/new" element={<ApplicationForm />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route path="/applications/:id/edit" element={<ApplicationForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
