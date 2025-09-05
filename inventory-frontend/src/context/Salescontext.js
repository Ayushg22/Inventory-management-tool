// src/context/SalesContext.js
import { createContext, useState, useContext } from "react";

const SalesContext = createContext();

export const useSales = () => useContext(SalesContext);

export const SalesProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const triggerRefresh = () => setRefreshTrigger(prev => !prev);

  return (
    <SalesContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </SalesContext.Provider>
  );
};