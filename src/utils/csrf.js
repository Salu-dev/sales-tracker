async function getCSRFToken() {
    // Get CSRF token first
    const csrfResponse = await fetch(`http://localhost:8000/api/method/time_tracking_system.auth.get_user_csrf_token`, {
        method: 'GET',
        credentials: 'include'
    });
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.message || csrfData.data?.csrf_token || csrfData.csrf_token;

    if (!csrfToken) {
        throw new Error('Failed to get CSRF token');
    }
    return csrfToken;
}
export { getCSRFToken };