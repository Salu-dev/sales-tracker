import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCSRFToken } from '../utils/csrf';
import { getBackendUrl } from '../utils/backend';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${getBackendUrl()}/api/method/time_tracking_system.api.get_assigned_customers`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const data = await response.json();
            
            if (response.ok) {
                setCustomers(data.data || data.message || []);
            } else {
                setError(data.message || 'Failed to fetch customers');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewVisitHistory = (customerName) => {
        navigate(`/visit-history/${customerName}`);
    };

    if (loading) {
        return <div>Loading customers...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1 id="title">Customer</h1>
            <p>Here you can view all assigned customers</p>
            {customers.length === 0 ? (
                <p>No customers found</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {customers.map((customer) => (
                        <div key={customer.name} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                            <h3>{customer.customer_name}</h3>
                            <p><strong>Email:</strong> {customer.email_id || 'N/A'}</p>
                            <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
                            {/* <p><strong>Address:</strong> {customer.primary_address || 'N/A'}</p> */}
                            {/* <button 
                                style={{ marginTop: '10px' }} 
                                id="schedule-button" className="btn"
                                data-customer-name={customer.customer_name}
                                onClick={() => handleScheduleVisit(customer.customer_name,customer.name)}
                            >
                                Schedule Visit
                            </button> */}
                            <button 
                                style={{ marginTop: '10px' }} 
                                id="view-visit-history-button" className="btn"
                                data-customer-name={customer.customer_name}
                                onClick={() => handleViewVisitHistory(customer.customer_name,customer.name)}
                            >
                                View Visit History
                            </button>
                        </div>

                    ))}
                </div>
            )}
            
           
        </div>     
    );
}
