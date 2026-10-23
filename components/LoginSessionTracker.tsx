import { useEffect } from 'react';
import { useAccess } from './AccessContext';
import { syncLoginSession } from './loginHistory';

/** Ghi nhận phiên đăng nhập của người dùng đang sử dụng hệ thống (không hiển thị giao diện). */
export const LoginSessionTracker: React.FC = () => {
  const { currentUser } = useAccess();
  useEffect(() => {
    syncLoginSession(currentUser.email, currentUser.name, currentUser.department);
  }, [currentUser.id]);
  return null;
};

export default LoginSessionTracker;
