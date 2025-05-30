import { createContext, useContext } from 'react';

export const AbilityContext = createContext(null);
export const useAbility = () => useContext(AbilityContext);
