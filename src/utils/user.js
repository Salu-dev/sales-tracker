import { getBackendUrl } from './backend';

export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${getBackendUrl()}/api/method/time_tracking_system.auth.get_logged_user`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.message && data.message.authenticated) {
            return data.message; // Return the nested message object
        }
        return null;
    } catch (err) {
        console.error('Failed to get current user:', err);
        return null;
    }
};

export const hasSalesRole = async () => {
    const userData = await getCurrentUser();
    if (userData && userData.roles) {
        return userData.roles.includes('Sales User');
    }
    return false;
};
