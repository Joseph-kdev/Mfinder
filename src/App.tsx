import './global.css'
import { Routes, Route } from "react-router-dom";
import MovieList from "./pages/Home";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MovieList />} />
      </Routes>
    </>
  )
}
