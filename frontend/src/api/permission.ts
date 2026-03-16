import api from "./axios";

export const getAllPermissions = () => api.get("/permissions");

// export const getDroitPermission = (droitId: number) =>
//   api.get(`/droitPermission/${droitId}/permissions`);

export const getPermissionsByDroitId = async (droitId: number) => {
  const response = await api.get(`/droits/${droitId}`);
  return response.data.Permissions || []; // Retourne directement les permissions
};

export const updateDroitPermissions = async (
  droitId: number,
  permissionIds: number[],
) => {
  const response = await api.put(`/droitPermission/${droitId}/permissions`, {
    permissions: permissionIds,
  });
  return response.data;
};
