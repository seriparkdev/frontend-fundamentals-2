import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type Message = { type: 'success' | 'error'; text: string } | null;

export function useReservationMessage() {
  const location = useLocation();
  const locationState = location.state as { message?: string } | null;

  const [message, setMessage] = useState<Message>(
    locationState?.message ? { type: 'success', text: locationState.message } : null
  );

  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  return { message, setMessage };
}
