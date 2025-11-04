import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';

function Inicio() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return <Dashboard user={user} />;
}

export default Inicio;
