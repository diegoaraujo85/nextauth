import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Dashboard() {
  const { isAuthenticated, user } = useContext(AuthContext);
  useEffect(() => {
    api
      .get('/me')
      .then(response => console.log(response.data))
      .catch(error => console.log(error));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
