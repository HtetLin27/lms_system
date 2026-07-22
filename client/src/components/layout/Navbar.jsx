import { Link, useNavigate } from 'react-router-dom';
import { useIsInstructor, useIsAdmin, useIsLoggedIn, useIsStudent } from '../../stores/authStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const isInstructor = useIsInstructor();
  const isAdmin = useIsAdmin();
  const isLogin = useIsLoggedIn();
  const isStudent = useIsStudent();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b px-6 py-3 flex items-center justify-between">
      <Link to="/courses" className="font-bold text-lg">
        LMS
      </Link>
      <div className="flex items-center gap-3">
        {!isLogin && (
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
        )}
        {!isLogin && (
          <Link to="/register">
            <Button>Register</Button>
          </Link>
        )}
        {isLogin && isStudent && <Link to="/my-course">My Courses</Link>}
        {isLogin && isStudent && <Link to="/certificates">Certificates</Link>}
        {isLogin && (isInstructor || isAdmin) && <Link to="/instructor">Dashboard</Link>}
        {isLogin && <Button onClick={handleLogout}>Logout</Button>}
      </div>
    </nav>
  );
};

export default Navbar;
