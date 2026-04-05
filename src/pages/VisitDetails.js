import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentLocation } from '../utils/location';
import { getCSRFToken } from '../utils/csrf';
import { getBackendUrl } from '../utils/backend';
import { hasSalesRole } from '../utils/user';

export default function VisitDetails() {
    const [visit, setVisit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [showStartVisitModal, setShowStartVisitModal] = useState(false);
    const [startDateTime, setStartDateTime] = useState('');
    const [notes, setNotes] = useState('');
    const [showNotesField, setShowNotesField] = useState(false);
    const [hasSalesAccess, setHasSalesAccess] = useState(false);
    const navigate = useNavigate();
    const { visitId } = useParams();

   
    useEffect(() => {
        fetchVisitDetails();
        checkUserRole();
    }, [visitId]);

    const checkUserRole = async () => {
        const salesAccess = await hasSalesRole();
        setHasSalesAccess(salesAccess);
    };

    const fetchVisitDetails = async () => {
        try {
            const response = await fetch(`${getBackendUrl()}/api/resource/Sales Visit/${visitId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok) {
                setVisit(data.data);
            } else {
                setError(data.message || 'Failed to fetch visit details');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setUpdating(true);
        try {
            const csrfToken = await getCSRFToken();
            const location=await getCurrentLocation()
            const response = await fetch(`${getBackendUrl()}/api/method/time_tracking_system.api.check_in_visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': csrfToken.csrf_token
                },
                credentials: 'include',
                body: JSON.stringify({
                    visit_name: visitId,
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                })
            });

            const data = await response.json();
            if (response.ok) {
                // Refresh visit details after check-in
                fetchVisitDetails();
            } else {
                // More detailed error logging
                console.error('Check-in Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });
                setError(data.message || data.exc || `Failed to check in (${response.status}: ${response.statusText})`);
            }
        } catch (err) {
            if (err.code === 1) {
                setError('Location access denied. Please enable location services to check in.');
            } else if (err.code === 2) {
                setError('Location unavailable. Please try again.');
            } else if (err.code === 3) {
                setError('Location request timed out. Please try again.');
            } else {
                setError(err.message || 'Failed to check in');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleCheckOut = async () => {
        if (!window.confirm('Are you sure you want to check out?')) {
            return;
        }

        setUpdating(true);
        try {
            // Get CSRF token first
            const csrfToken = await getCSRFToken();
            const location = await getCurrentLocation();

            const response = await fetch(`${getBackendUrl()}/api/method/time_tracking_system.api.check_out_visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': csrfToken.csrf_token
                },
                credentials: 'include',
                body: JSON.stringify({
                    visit_name: visitId,
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                })
            });
            console.log('Check-out Response:', response);

            const data = await response.json();
            if (response.ok) {
                // Refresh visit details after check-out
                fetchVisitDetails();
            } else {
                // More detailed error logging
                console.error('Check-out Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });
                setError(data.message || data.exc || `Failed to check out (${response.status}: ${response.statusText})`);
            }
        } catch (err) {
            setError(err.message || 'Failed to check out');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelVisit = async () => {
        if (!window.confirm('Are you sure you want to cancel this visit?')) {
            return;
        }

        setUpdating(true);
        try {
            // Get CSRF token first
            const csrfToken = await getCSRFToken();

            const response = await fetch(`${getBackendUrl()}/api/resource/Sales Visit/${visitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': csrfToken.csrf_token
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: 'Cancelled'
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Refresh visit details after cancellation
                fetchVisitDetails();
            } else {
                console.error('Cancel Visit Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });
                setError(data.message || data.exc || `Failed to cancel visit (${response.status}: ${response.statusText})`);
            }
        } catch (err) {
            setError(err.message || 'Failed to cancel visit');
        } finally {
            setUpdating(false);
        }
    };
    
    const handleStartVisit = () => {
        setShowStartVisitModal(true);
        // Set default to current datetime
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setStartDateTime(now.toISOString().slice(0, 16));
    };

    const confirmStartVisit = async () => {
        if (!startDateTime) {
            setError('Please select a start date and time');
            return;
        }

        setUpdating(true);
        try {
            const csrfToken = await getCSRFToken();

            const response = await fetch(`${getBackendUrl()}/api/method/time_tracking_system.api.start_visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': csrfToken.csrf_token
                },
                credentials: 'include',
                body: JSON.stringify({
                    visit_name: visitId,
                    travel_start_time: startDateTime,
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Refresh visit details after starting
                fetchVisitDetails();
                setShowStartVisitModal(false);
            } else {
                setError(data.message || 'Failed to start visit');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const cancelStartVisit = () => {
        setShowStartVisitModal(false);
        setStartDateTime('');
    };

    const handleNotesSubmit = async () => {
        if (!notes.trim()) {
            setError('Please enter notes before submitting');
            return;
        }

        setUpdating(true);
        try {
            const csrfToken = await getCSRFToken();

            const response = await fetch(`${getBackendUrl()}/api/resource/Sales Visit/${visitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': csrfToken.csrf_token
                },
                credentials: 'include',
                body: JSON.stringify({
                    notes: notes.trim()
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Refresh visit details after updating notes
                fetchVisitDetails();
                setNotes('');
                setShowNotesField(false);
            } 
            
        } catch (err) {
            setError(err.message || 'Failed to update notes');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div>Loading visit details...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!visit) return <div>Visit not found</div>;

    return (
        <div>
           

            
            <h1>Visit Details</h1>
             <div style={{ marginTop: '20px' }}>
                    {(visit.status?.toLowerCase() === 'scheduled') ? (
                        <>
                            { (
                                <button 
                                    onClick={handleCancelVisit}
                                    disabled={updating}
                                    style={{ 
                                        padding: '8px 16px', 
                                        backgroundColor: '#dc3545', 
                                        color: 'white', 
                                        border: 'none',
                                        cursor: updating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {updating ? 'Processing...' : 'Cancel Visit'}
                                </button>
                            )}
                            {hasSalesAccess && (
                                <button 
                                    onClick={handleStartVisit}
                                    disabled={updating}
                                    style={{ 
                                        marginLeft: '10px', 
                                        padding: '8px 16px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        cursor: updating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {updating ? 'Processing...' : 'Start Travel'}
                                </button>
                            )}
                        </>
                    ):
                    (visit.status?.toLowerCase()=== 'traveling') ? (
                        <>
                         {hasSalesAccess && (
                            <button 
                                    onClick={handleCheckIn}
                                    disabled={updating}
                                    style={{ 
                                        marginRight: '10px', 
                                        padding: '8px 16px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        cursor: updating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {updating ? 'Processing...' : 'Check In'}
                                </button>
                         )}
                         {hasSalesAccess && (
                            <button 
                                onClick={handleCancelVisit}
                                disabled={updating}
                                style={{ 
                                    padding: '8px 16px', 
                                    backgroundColor: '#dc3545', 
                                    color: 'white', 
                                    border: 'none',
                                    cursor: updating ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {updating ? 'Processing...' : 'Cancel Visit'}
                            </button>
                         )}
                        </>
                    ) : (visit.status?.toLowerCase() === 'in progress') ? (
                        <>
                            {hasSalesAccess && (
                                <button 
                                    onClick={handleCheckOut}
                                    disabled={updating}
                                    style={{ 
                                        marginRight: '10px', 
                                        padding: '8px 16px',
                                        backgroundColor: '#ffc107',
                                        color: 'black',
                                        border: 'none',
                                        cursor: updating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {updating ? 'Processing...' : 'Check Out'}
                                </button>
                            )}
                            {hasSalesAccess && (
                                <button 
                                    onClick={handleCancelVisit}
                                    disabled={updating}
                                    style={{ 
                                        padding: '8px 16px', 
                                        backgroundColor: '#dc3545', 
                                        color: 'white', 
                                        border: 'none',
                                        cursor: updating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {updating ? 'Processing...' : 'Cancel Visit'}
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none' }}>
                                Visit {visit.status || 'Completed'}
                            </button>
                            {(visit.status?.toLowerCase() === 'completed' || visit.status?.toLowerCase() === 'cancelled') && (
                                <>
                                    <button 
                                        onClick={() => setShowNotesField(!showNotesField)}
                                        style={{ 
                                            marginLeft: '10px', 
                                            padding: '8px 16px',
                                            backgroundColor: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {showNotesField ? 'Hide Notes' : 'Add Notes'}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
                <h2>{visit.customer || visit.customer_name || 'N/A'}</h2>
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Scheduled Date:</strong> {visit.scheduled_date || visit.date || 'N/A'}
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Status:</strong> {visit.status || 'N/A'}
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Purpose:</strong> {visit.purpose || 'N/A'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Check-in:</strong> {visit.check_in || 'N/A'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Check-out:</strong> {visit.check_out || 'N/A'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Time Spent(In Hours):</strong> {visit.time_spent || 'N/A'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Travel Time:</strong> {visit.travel_time || 'N/A'}
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Notes:</strong> {visit.notes || 'No notes available'}
                </div>
                
                {/* Notes input field for completed/cancelled visits */}
                {showNotesField && (visit.status?.toLowerCase() === 'completed' || visit.status?.toLowerCase() === 'cancelled') && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <h4 style={{ marginBottom: '10px' }}>Add/Update Notes</h4>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter your notes here..."
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                resize: 'vertical',
                                marginBottom: '10px'
                            }}
                        />
                        <div>
                            <button
                                onClick={handleNotesSubmit}
                                disabled={updating || !notes.trim()}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: updating || !notes.trim() ? '#6c757d' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: updating || !notes.trim() ? 'not-allowed' : 'pointer',
                                    marginRight: '10px'
                                }}
                            >
                                {updating ? 'Submitting...' : 'Submit Notes'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowNotesField(false);
                                    setNotes('');
                                }}
                                disabled={updating}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: updating ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Lattitude:</strong> {visit.lattitude || 'N/A'}
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Longitude:</strong> {visit.longitude || 'N/A'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Check-in Coordinates:</strong> {visit.check_in_coordinates || 'N/A'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Check-out Coordinates:</strong> {visit.check_out_coordinates || 'N/A'}
                </div>
                
                {visit.lattitude && visit.longitude && (
                    <div style={{ marginBottom: '20px' }}>
                        <strong>Location Map:</strong>
                        <div style={{ height: '400px', width: '100%', marginTop: '10px', border: '1px solid #ccc' }}>
                            <MapContainer 
                                center={[parseFloat(visit.lattitude), parseFloat(visit.longitude)]} 
                                zoom={13} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[parseFloat(visit.lattitude), parseFloat(visit.longitude)]}>
                                    <Popup>
                                        {visit.customer || visit.customer_name || 'Visit Location'}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                )}
                
                {/* Start Visit Modal */}
                {showStartVisitModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            maxWidth: '400px',
                            width: '90%'
                        }}>
                            <h3 style={{ marginBottom: '20px', color: '#333' }}>Update Travel Start Time</h3>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Start Date and Time:
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startDateTime}
                                    onChange={(e) => setStartDateTime(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    onClick={cancelStartVisit}
                                    disabled={updating}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: updating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmStartVisit}
                                    disabled={updating}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: updating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {updating ? 'Starting...' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
               
            </div>
        </div>
    );
}



