import { useState } from 'react';
import { AbilityContext } from './contexts';
import defineAbilityFor from './utility/defineAbilityFor';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import UserPermissions from './mock/permission';

function App() {
  const [userPermissions] = useState(UserPermissions);
  return (
    <BrowserRouter>
      <AbilityContext.Provider value={defineAbilityFor(userPermissions)}>
        <AppRoutes />
      </AbilityContext.Provider>
    </BrowserRouter>
  );
}

export default App;
