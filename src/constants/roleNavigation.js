import { ROLES } from './config';

export const ROLE_DISPLAY_NAMES = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.STAFF]: 'Staff',
  [ROLES.USER]: 'Fan',
};

export const ROLE_DASHBOARD_ROUTES = {
  [ROLES.ADMIN]: 'AdminDashboard',
  [ROLES.SUPERVISOR]: 'SupervisorDashboard',
  [ROLES.STAFF]: 'StaffDashboard',
  [ROLES.USER]: 'FanDashboard',
};

export function getRoleDisplayName(role) {
  return ROLE_DISPLAY_NAMES[role] || 'User';
}

export function getDashboardRoute(role) {
  return ROLE_DASHBOARD_ROUTES[role] || ROLE_DASHBOARD_ROUTES[ROLES.USER];
}

export function getAllowedRoles(userInfo) {
  const explicitRoles = Array.isArray(userInfo?.availableRoles) ? userInfo.availableRoles : [];
  const legacyRoles = Array.isArray(userInfo?.roles) ? userInfo.roles : [];
  const fallbackRoles = userInfo?.role ? [userInfo.role] : [];
  const roles = explicitRoles.length > 0 ? explicitRoles : legacyRoles.length > 0 ? legacyRoles : fallbackRoles;

  return Array.from(new Set(roles.filter(Boolean)));
}

export function getSwitchableRoles(userInfo) {
  return getAllowedRoles(userInfo).filter((role) => role !== userInfo?.role);
}

export function canSwitchToRole(userInfo, targetRole) {
  return getAllowedRoles(userInfo).includes(targetRole) && targetRole !== userInfo?.role;
}
