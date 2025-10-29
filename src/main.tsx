import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from "react-router";
import ElectricPrice from './pages/ElectricPrice.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/electric-price" element={<ElectricPrice />} />
    </Routes>
  </BrowserRouter>,
)
