import { useState, useEffect } from 'react';

export default function BackendUrlModal({ onSave, initialUrl = '' }) {
    const [backendUrl, setBackendUrl] = useState(initialUrl);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if backend URL is already stored
        const storedUrl = localStorage.getItem('backendUrl');
        
        if (!storedUrl || storedUrl.trim() === '') {
            setShow(true);
        } else {
            setBackendUrl(storedUrl);
        }
    }, []);

    const handleSave = () => {
        if (backendUrl.trim() === '') {
            alert('Please enter a valid backend URL to continue');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('backendUrl', backendUrl.trim());
        onSave(backendUrl.trim());
        setShow(false);
    };

    // Prevent app from rendering until URL is configured
    if (show) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    maxWidth: '500px',
                    width: '90%'
                }}>
                    <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
                        Backend Configuration Required
                    </h2>
                    
                    <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.5' }}>
                        Please configure your backend server URL to continue. This is required to connect to your Frappe backend system.
                    </p>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 'bold', 
                            color: '#333' 
                        }}>
                            Backend URL <span style={{ color: 'red' }}>*</span>:
                        </label>
                        <input
                            type="text"
                            value={backendUrl}
                            onChange={(e) => setBackendUrl(e.target.value)}
                            placeholder="http://localhost:8000"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            autoFocus
                        />
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Example: http://localhost:8000 or https://your-server.com
                        </small>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        justifyContent: 'space-between',
                        marginTop: '25px'
                    }}>
                        
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                flex: 1
                            }}
                        >
                            Continue →
                        </button>
                    </div>
                    
                    <p style={{ 
                        textAlign: 'center', 
                        color: '#999', 
                        fontSize: '12px', 
                        marginTop: '15px' 
                    }}>
                        This URL will be saved for future sessions
                    </p>
                </div>
            </div>
        );
    }

    return null; // Don't render anything if URL is configured
}
