import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function Dashboard() {
  const { isAuthenticated, user } = useContext(AuthContext);
  console.log('🚀 ~ file: dashboard.tsx ~ line 6 ~ Dashboard ~ user', user);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
