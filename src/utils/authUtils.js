export const checkPermission = (role) => {
    const allowedRoles = ['owner','admin', 'kitchen_staff', 'sales_staff'];
    return allowedRoles.includes(role);
  };