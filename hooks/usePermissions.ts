/**
 * AGRAGATI SCHOOL OS — usePermissions React Hook
 *
 * Provides reactive permission checks for the current authenticated user.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import { Permission } from "@/types/permissions";
import {
  hasPermission,
  getRolePermissions,
  hasAllPermissions,
  hasAnyPermission,
} from "@/lib/services/permission-service";

export interface UsePermissionsResult {
  /** Check if the current user has a specific permission */
  can: (permission: Permission) => boolean;
  /** Check if the current user has all specified permissions */
  canAll: (permissions: Permission[]) => boolean;
  /** Check if the current user has any of the specified permissions */
  canAny: (permissions: Permission[]) => boolean;
  /** All permissions for current user's role */
  permissions: Permission[];
  /** Convenience: user role */
  role: string | null;
}

export function usePermissions(): UsePermissionsResult {
  const { role } = useAuth();

  const permissions = React.useMemo(() => {
    return getRolePermissions(role);
  }, [role]);

  const can = React.useCallback(
    (permission: Permission) => {
      return hasPermission(role, permission);
    },
    [role]
  );

  const canAll = React.useCallback(
    (perms: Permission[]) => {
      return hasAllPermissions(role, perms);
    },
    [role]
  );

  const canAny = React.useCallback(
    (perms: Permission[]) => {
      return hasAnyPermission(role, perms);
    },
    [role]
  );

  return {
    can,
    canAll,
    canAny,
    permissions,
    role,
  };
}
