import { Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Main from './pages/Main';
import MyFormStudy from './pages/Form';
import Unauthorized from './pages/Unauthorized';
import { PermissionLink } from './components/PermissionLink';

export default function AppRoutes() {
  return (
    <>
      <nav className="flex gap-4 justify-center items-center py-6 bg-gray-900/90 shadow-lg">
        <PermissionLink
          to="/"
          subject="A01"
          className="px-5 py-2 rounded-xl bg-gray-700/70 text-blue-300 hover:ring-2 hover:ring-blue-400 hover:text-blue-200 font-semibold shadow transition duration-150"
        >
          Main
        </PermissionLink>
        <PermissionLink
          to="/about"
          subject="B01"
          className="px-5 py-2 rounded-xl bg-gray-700/70 text-purple-300 hover:ring-2 hover:ring-purple-400 hover:text-purple-200 font-semibold shadow transition duration-150"
        >
          About
        </PermissionLink>
        <Link
          to="/form"
          className="px-5 py-2 rounded-xl bg-gray-700/70 text-cyan-300 hover:ring-2 hover:ring-cyan-400 hover:text-cyan-200 font-semibold shadow transition duration-150"
        >
          Form
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="/form" element={<MyFormStudy />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}
