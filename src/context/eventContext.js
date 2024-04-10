import React, { createContext, useContext, useState } from "react";

// Creamos un contexto para almacenar los datos del evento
const EventContext = createContext();

// Provider para el contexto del evento
export const EventProvider = ({ children }) => {
  const [eventData, setEventData] = useState(null);

  const setEvent = (event) => {
    setEventData(event);
  };

  const clearEvent = () => {
    setEventData(null);
  };

  return (
    <EventContext.Provider value={{ eventData, setEvent, clearEvent }}>
      {children}
    </EventContext.Provider>
  );
};

// Hook personalizado para acceder al contexto del evento
export const useEventContext = () => useContext(EventContext);
