import { useState, useEffect } from "react";
import { getBackendUrl } from "../utils/backend";
import { getCSRFToken } from "../utils/csrf";


export default function CreateVisit() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [purpose, setPurpose] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setCustomers(data.message || []);
            } else {
                setError("Failed to fetch customers");
            }
        } catch (err) {
            setError("Error fetching customer data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

   

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            alert("Please select a customer");
            return;
        }
        
        if (!scheduledDate) {
            alert("Please select a scheduled date");
            return;
        }
        
        try {
            const csrfToken = await getCSRFToken();
            const response = await fetch(`${getBackendUrl()}/api/resource/Sales Visit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Frappe-CSRF-Token": csrfToken.csrf_token
                },
                credentials: "include",
                body: JSON.stringify({
                    customer: selectedCustomer,
                    scheduled_date: scheduledDate,
                    purpose: purpose
                    
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Visit submitted successfully!");
                // Reset form
                setSelectedCustomer("");
                setScheduledDate("")
            } else {
                console.error('Submit Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });
                alert(data.message || data.exc || "Failed to submit visit");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting visit");
        }
    };

    if (loading) {
        return <div>Loading customers...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Customer Visit</h1>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="customer-select" style={{ display: 'block', marginBottom: '5px' }}>Customer</label>
                <select 
                    id="customer-select"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    style={{ padding: '8px', minWidth: '200px' }}
                >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                        <option key={customer.name} value={customer.name}>
                            {customer.customer_name}
                        </option>
                    ))}
                </select>
                {/* schedulled date */}
                <div style={{ marginTop: '10px' }}>
                    <label htmlFor="scheduled-date" style={{ display: 'block', marginBottom: '5px' }}>Scheduled Date</label>
                    <input 
                        type="date" 
                        id="scheduled-date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        style={{ padding: '8px', minWidth: '200px' }}
                    />
                </div>
                {/* purpose */}
                <div style={{ marginTop: '10px' }}>
                    <label htmlFor="purpose" style={{ display: 'block', marginBottom: '5px' }}>Purpose</label>
                    <input 
                        type="text" 
                        id="purpose"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        style={{ padding: '8px', minWidth: '200px' }}
                    />
                </div>
                
            </div>
            
            <div style={{ marginBottom: '20px' }}>
               
                <button className="btn"
                    onClick={handleSubmit}
                    style={{ padding: '10px 20px' }}
                    disabled={!selectedCustomer || !scheduledDate}
                >
                    Submit
                </button>
            </div>

            
        </div>
    );
}
