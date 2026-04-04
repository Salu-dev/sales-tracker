// Backend URL configuration utility

export const getBackendUrl = () => {
    const storedUrl = localStorage.getItem('backendUrl');
    return storedUrl || 'http://localhost:8000';
};

export const setBackendUrl = (url) => {
    localStorage.setItem('backendUrl', url.trim());
};

export const isBackendUrlConfigured = () => {
    const storedUrl = localStorage.getItem('backendUrl');
    return storedUrl && storedUrl.trim() !== '';
};
