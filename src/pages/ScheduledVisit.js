
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCSRFToken } from "../utils/csrf";
import { getBackendUrl } from "../utils/backend";

export default function ScheduledVisit() {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try { 
            const response = await fetch(`${getBackendUrl()}/api/method/time_tracking_system.api.get_todays_scheduled_visits`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok) {
                setVisits(data.data || data.message || []);
            } else {
                setError(data.message || 'Failed to fetch visits');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleViewVisit = (visitId) => {
        navigate(`/visit/${visitId}`);
    };
    
    
    
    return (
        <div>
            
            
            {loading && <div>Loading scheduled visits...</div>}
            
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
            
            {!loading && !error && (
                <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                    <div style={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        padding: '20px',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <h2 style={{ color: '#007bff', marginBottom: '15px' }}>Today's Schedule</h2>
                        {visits.length === 0 ? (
                            <p>No visits scheduled for today</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                                {visits.map((visit) => (
                                    <div key={visit.name} style={{
                                        border: '1px solid #eee',
                                        borderRadius: '6px',
                                        padding: '15px',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <strong>{visit.customer || visit.customer_name || 'N/A'}</strong>
                                            <br />
                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                {visit.sales_person || 'N/A'}
                                            </div>

                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                {visit.scheduled_date ||  'N/A'}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleViewVisit(visit.name)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                   
                </div>
            )}
        </div>
        
    );
}