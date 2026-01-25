import api from "./axios";

export const getAllPermissions = () => api.get("/permissions");

export const getDroitPermission = (droitId: number) =>
  api.get(`/droitPermission/${droitId}/permissions`);

export const updateDroitPermissions = (
  droitId: number,
  permissionIds: number[]
) =>
  api.put(`/droitPermission/${droitId}/permissions`, {
    permissions: permissionIds,
  });
