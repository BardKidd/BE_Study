import { Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Main from './pages/Main';
import MyFormStudy from './pages/Form';
import Unauthorized from './pages/Unauthorized';
import { PermissionLink } from './components/PermissionLink';

export default function AppRoutes() {
  return (
    <>
      <nav>
        <PermissionLink to="/" subject="A01">
          Main
        </PermissionLink>
        <PermissionLink to="/about" subject="B01">
          About
        </PermissionLink>
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
