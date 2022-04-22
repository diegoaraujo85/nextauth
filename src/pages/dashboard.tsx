import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { setupApiClient } from '../services/api';
import { api } from '../services/apiClient';
import { withSSRAuth } from '../utils/withSSRAuth';

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

export const getServerSideProps = withSSRAuth(async ctx => {
  const apiClient = setupApiClient(ctx);
  const response = await apiClient.get('/me');
  console.log(response.data);

  return {
    props: {},
  };
});
