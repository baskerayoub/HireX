import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './Screens/Dashboard.jsx'
import Login from './Screens/Login.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
