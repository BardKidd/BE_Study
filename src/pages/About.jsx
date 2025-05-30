import { withPageAccess } from '../components/PageAccess.jsx';

const About = () => {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the about page.</p>
    </div>
  );
};

const WrappedAbout = withPageAccess('B01')(About);
export default WrappedAbout;
