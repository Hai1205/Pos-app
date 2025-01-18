import React from 'react';
import { useRole } from '../../hooks/useRole';

const RoleSelect = ({ value, onChange }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { roles, loading, error } = useRole(apiUrl);

  if (loading) return <p>Loading roles...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Quyền</label>
      <select
        id="role"
        name="role"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm"
        required
      >
        <option value="" disabled>Chọn vai trò</option>
        {roles.map(role => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelect;
