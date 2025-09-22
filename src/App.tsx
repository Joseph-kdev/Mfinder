import './global.css'
import { Routes, Route } from "react-router-dom";
import SignInPage from './pages/SignIn';
import Home from './pages/Home';
import SignUpPage from './pages/SignUp';
import MovieDetails from './pages/MovieDetails';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </>
  )
}
