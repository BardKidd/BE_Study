import { withPageAccess } from '../components/PageAccess';
const Main = () => {
  return (
    <>
      <h1>Main Page</h1>
      <p>This is a normal page...</p>
    </>
  );
};

const WrappedMain = withPageAccess('A01')(Main);

export default WrappedMain;
