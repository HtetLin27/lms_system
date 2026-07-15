import {Navigate} from 'react-router-dom';
import { useCurrentUser } from '../../stores/authStore';

const ProtectedRoute = ({children}) => {
   const user = useCurrentUser();
   if(!user){
    return<Navigate to="/login"/>
   }
   return children
};

export default ProtectedRoute