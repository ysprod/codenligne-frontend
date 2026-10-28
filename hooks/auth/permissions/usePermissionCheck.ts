import { useMemo } from 'react';
import { useAuth } from '@/lib/hooks';
import { Permission } from '@/lib/interfaces';

interface UsePermissionCheckOptions {
  requiredPermissions: Permission | Permission[];
  requireAll?: boolean;
}

export function usePermissionCheck({ requiredPermissions, requireAll = false, }: UsePermissionCheckOptions) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  const permissionsArray = useMemo(
    () =>
      Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions],
    [requiredPermissions]
  );

  const hasRequiredPermissions = useMemo(() => {
    if (!isAuthenticated) return false;

    return requireAll
      ? permissionsArray.every((perm) => hasPermission(perm))
      : permissionsArray.some((perm) => hasPermission(perm));
  }, [isAuthenticated, permissionsArray, requireAll, hasPermission]);

  return { isAuthenticated, isLoading, hasRequiredPermissions, permissionsArray, };
}