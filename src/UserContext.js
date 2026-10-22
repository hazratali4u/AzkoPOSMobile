import { createContext, useContext } from 'react';

const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

export default UserContext;
