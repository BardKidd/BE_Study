import { Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Main from './pages/Main';
import MyFormStudy from './pages/Form';
import Unauthorized from './pages/Unauthorized';
import GeminiPage from './pages/GeminiPage';
import { PermissionLink } from './components/PermissionLink';

export default function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex gap-4 justify-center items-center py-4 bg-gray-950 shadow-xl px-4">
        <PermissionLink
          to="/"
          subject="A01"
          className="px-6 py-2 rounded-full bg-gray-800 text-blue-300 hover:bg-gray-700 hover:text-blue-200 font-semibold transition duration-150 w-32 text-center"
        >
          Main
        </PermissionLink>
        <PermissionLink
          to="/about"
          subject="B01"
          className="px-6 py-2 rounded-full bg-gray-800 text-purple-300 hover:bg-gray-700 hover:text-purple-200 font-semibold transition duration-150 w-32 text-center"
        >
          About
        </PermissionLink>
        <Link
          to="/form"
          className="px-6 py-2 rounded-full bg-gray-800 text-cyan-300 hover:bg-gray-700 hover:text-cyan-200 font-semibold transition duration-150 w-32 text-center"
        >
          Form
        </Link>
        <PermissionLink
          to="/gemini"
          subject="C01"
          className="px-6 py-2 rounded-full bg-gray-800 text-green-300 hover:bg-gray-700 hover:text-green-200 font-semibold transition duration-150 w-32 text-center"
        >
          Gemini
        </PermissionLink>
      </nav>

      <main className="flex-grow w-full">
        <Routes className="flex w-full h-full">
          <Route path="/" element={<Main />} />
          <Route path="/about" element={<About />} />
          <Route path="/form" element={<MyFormStudy />} />
          <Route path="/gemini" element={<GeminiPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </main>
    </div>
  );
}
