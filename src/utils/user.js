import { getBackendUrl } from './backend';

export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${getBackendUrl()}/api/method/frappe.auth.get_logged_user`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return data.message; // Returns the user ID
        }
        return null;
    } catch (err) {
        console.error('Failed to get current user:', err);
        return null;
    }
};

export const getUserRoles = async () => {
    try {
        const response = await fetch(`${getBackendUrl()}/api/method/frappe.auth.get_user_roles`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return data.message || []; // Returns array of roles
        }
        return [];
    } catch (err) {
        console.error('Failed to get user roles:', err);
        return [];
    }
};

export const hasSalesRole = async () => {
    const roles = await getUserRoles();
    return roles.includes('Sales User');
};
