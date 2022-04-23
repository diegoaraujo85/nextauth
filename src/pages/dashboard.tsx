import { useContext, useEffect } from 'react';
import { Can } from '../components/Can';
import { AuthContext, signOut } from '../contexts/AuthContext';
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
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>SignOut</button>

      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async ctx => {
  const apiClient = setupApiClient(ctx);

  const response = await apiClient.get('/me');
  console.log('🚀 ~ file: dashboard.tsx ~ line 28 ~ response', response.data);

  return {
    props: {},
  };
});
