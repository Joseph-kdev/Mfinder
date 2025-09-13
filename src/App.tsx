import Home from "./pages/Home";
import './global.css'
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  )
}
