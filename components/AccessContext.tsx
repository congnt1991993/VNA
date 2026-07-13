import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import {
  MOCK_USERS,
  UserProfile,
  getEffectiveFormGrants,
  isAdminUser,
} from '../data/accessControl';

interface AccessContextValue {
  currentUser: UserProfile;
  setCurrentUserId: (userId: string) => void;
  viewAsRoleId: string | null;
  setViewAsRoleId: (roleId: string | null) => void;
  isAdmin: boolean;
  effectiveFormGrants: ReturnType<typeof getEffectiveFormGrants>;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
}

const AccessContext = createContext<AccessContextValue | null>(null);

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(
    () => new URLSearchParams(window.location.search).get('user') || 'admin'
  );
  const [viewAsRoleId, setViewAsRoleId] = useState<string | null>(null);

  const currentUser = MOCK_USERS.find(user => user.id === currentUserId) || MOCK_USERS[0];
  const isAdmin = isAdminUser(currentUser);
  const effectiveViewAsRoleId = isAdmin ? viewAsRoleId : null;
  const effectiveFormGrants = useMemo(
    () => getEffectiveFormGrants(currentUser, effectiveViewAsRoleId),
    [currentUser, effectiveViewAsRoleId],
  );

  const [selectedDepartment, setSelectedDepartment] = useState<string>('Tổ Khai thác (TTĐHKT)');

  const changeUser = (userId: string) => {
    setCurrentUserId(userId);
    setViewAsRoleId(null);
  };

  return (
    <AccessContext.Provider
      value={{
        currentUser,
        setCurrentUserId: changeUser,
        viewAsRoleId: effectiveViewAsRoleId,
        setViewAsRoleId,
        isAdmin,
        effectiveFormGrants,
        selectedDepartment,
        setSelectedDepartment,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = (): AccessContextValue => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccess must be used inside AccessProvider');
  }
  return context;
};
