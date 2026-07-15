
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../../stores/authStore';

const RoleRoute = ({ children, allowedRoles }) => {
  const user = useCurrentUser();
  if (!user) return <Navigate to="/login" />; 
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default RoleRoute;