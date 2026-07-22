import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div>
      <Navbar className="sticky top-0" />
      <Outlet />
    </div>
  );
};

export default MainLayout;
