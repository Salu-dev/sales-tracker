import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function VisitingHistory() {
    console.log('VisitingHistory component rendering');
    const { customerName } = useParams();
    const navigate = useNavigate();
    
    const [companies, setCompanies] = useState([]);
    const [salesPersons, setSalesPersons] = useState([]);
    const [visitHistory, setVisitHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(20); // Match backend default
    const [filters, setFilters] = useState({
        status: 'all',
        fromDate: '',
        toDate: '',
        company: customerName || 'all',
        salesPerson: 'all'
    });

    useEffect(() => {
        fetchCustomers();
        fetchSalesPersons()
        fetchVisitHistory()
    }, [customerName]);

    const fetchCustomers    = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/method/time_tracking_system.api.get_assigned_customers", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const data = await response.json();
            
            if (response.ok) {
                setCompanies(data.data || data.message || []);
            } else {
                console.error('Failed to fetch companies:', data.message);
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        }
    };

    const fetchSalesPersons = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/method/time_tracking_system.api.get_sales_persons", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const data = await response.json();
            
            if (response.ok) {
                setSalesPersons(data.data || data.message || []);
                console.log(visitHistory.length);
            } else {
                console.error('Failed to fetch sales persons:', data.message);
            }
        } catch (err) {
            console.error('Error fetching sales persons:', err);
        }
    };   
    const fetchVisitHistory = async () => {
        try {
            // Build query parameters based on filters
            let url = "http://localhost:8000/api/method/time_tracking_system.api.get_sales_visits_history?";
            const params = new URLSearchParams();
            
            console.log('Current filters:', filters);
            console.log('Current page:', currentPage);
            
            // Add filters if they exist and are not 'all'
            if (filters.status && filters.status !== 'all') {
                params.append('status', filters.status);
                console.log('Adding status filter:', filters.status);
            } else {
                console.log('Status filter not applied (value:', filters.status, ')');
            }
            
            if (filters.fromDate && filters.fromDate.trim() !== '') {
                params.append('from_date', filters.fromDate);
                console.log('Adding from_date filter:', filters.fromDate);
            } else {
                console.log('From date filter not applied (value:', filters.fromDate, ')');
            }
            
            if (filters.toDate && filters.toDate.trim() !== '') {
                params.append('to_date', filters.toDate);
                console.log('Adding to_date filter:', filters.toDate);
            } else {
                console.log('To date filter not applied (value:', filters.toDate, ')');
            }
            
            if (filters.salesPerson && filters.salesPerson !== 'all') {
                params.append('sales_person', filters.salesPerson);
                console.log('Adding sales_person filter:', filters.salesPerson);
            } else {
                console.log('Sales person filter not applied (value:', filters.salesPerson, ')');
            }
            
            if (filters.company && filters.company !== 'all') {
                params.append('customer', filters.company);
                console.log('Adding customer filter:', filters.company);
            } else {
                console.log('Customer filter not applied (value:', filters.company, ')');
            }
            
            // Add pagination parameters
            params.append('limit', pageSize);
            params.append('limit_start', (currentPage - 1) * pageSize);
            
            const finalUrl = url + params.toString();
            console.log('Final API URL:', finalUrl);
            
            const response = await fetch(finalUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const data = await response.json();
            console.log('API Response:', data);
            
            if (response.ok) {
                setVisitHistory(data.message?.visits || []);
                setTotalCount(data.message?.count || 0);
                // Calculate total pages
                const calculatedPages = Math.ceil((data.message?.count || 0) / pageSize);
                setTotalPages(calculatedPages);
            } else {
                console.error('Failed to fetch visit history:', data.message);
            }
        } catch (err) {
            console.error('Error fetching visit history:', err);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Refetch when page changes only
    useEffect(() => {
        fetchVisitHistory();
    }, [currentPage]);

    // Remove auto-fetch on filter changes - only fetch when Apply Filter is clicked

    const handleFilter = () => {
        console.log('Filtering with:', filters);
        setCurrentPage(1); // Reset to first page when applying filters
        fetchVisitHistory();
    };

    const updateFilter = (key, value) => {
        console.log('updateFilter called with:', key, '=', value);
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            console.log('New filters state:', newFilters);
            return newFilters;
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 id="title">
                {customerName ? `Visit History - ${customerName}` : 'Visiting History'}
            </h1>
            <p>Here you can view all visit records</p>
            {customerName && (
                <div style={{ 
                    marginBottom: '20px', 
                    padding: '10px', 
                    backgroundColor: '#e3f2fd', 
                    border: '1px solid #2196f3', 
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Showing visits for customer: <strong>{customerName}</strong></span>
                    <button 
                        onClick={() => navigate('/visit-history')}
                        style={{
                            padding: '5px 15px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        View All
                    </button>
                </div>
            )}
            
            <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>Status:</label>
                    <select 
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        style={{ padding: '5px', minWidth: '150px' }}
                    >
                        <option value="all">All</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="traveling">Traveling</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>From:</label>
                    <input 
                        type="date" 
                        value={filters.fromDate}
                        onChange={(e) => updateFilter('fromDate', e.target.value)}
                        style={{ padding: '5px' }} 
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>To:</label>
                    <input 
                        type="date" 
                        value={filters.toDate}
                        onChange={(e) => updateFilter('toDate', e.target.value)}
                        style={{ padding: '5px' }} 
                    />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>Customer:</label>
                    <select 
                        value={filters.company}
                        onChange={(e) => updateFilter('company', e.target.value)}
                        style={{ padding: '5px', minWidth: '150px' }}
                    >
                        <option value="all">Select Customer</option>
                        {companies.map((company) => (
                            <option key={company.name} value={company.customer_name || company.name}>
                                {company.customer_name || company.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>Sales Person:</label>
                    <select 
                        value={filters.salesPerson}
                        onChange={(e) => updateFilter('salesPerson', e.target.value)}
                        style={{ padding: '5px', minWidth: '150px' }}
                    >
                        <option value="all">Select Sales Person</option>
                        {salesPersons.map((salesPerson) => (
                            <option key={salesPerson.name} value={salesPerson.name}>
                                {salesPerson.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <button 
                    onClick={handleFilter}
                    style={{ 
                        padding: '8px 20px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Apply Filter
                </button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Visit Records ({totalCount} total, {visitHistory.length} shown)</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: currentPage === 1 ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Previous
                        </button>
                        <button 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: currentPage === totalPages ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
                {loading && <p>Loading...</p>}
                {visitHistory.length === 0 && !loading && (
                    <p>No visit records found. Try adjusting your filters.</p>
                )}
                {visitHistory.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Customer</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Sales Person</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Scheduled Date</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Time at Location(In Hours)</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Travel Time(In Hours)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitHistory.map((visit, index) => (
                                <tr key={visit.name || index} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        <a 
                                            href={`/visit/${visit.name}`}
                                            style={{ 
                                                color: '#007bff', 
                                                textDecoration: 'none',
                                                fontWeight: 'bold'
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(`/visit/${visit.name}`);
                                            }}
                                        >
                                            {visit.name || 'N/A'}
                                        </a>
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        {visit.customer || visit.customer_name || 'N/A'}
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        {visit.sales_person || 'N/A'}
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        {visit.scheduled_date || 'N/A'}
                                    </td>
                                     <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                         <span style={{
                                             padding: '4px 8px',
                                             borderRadius: '4px',
                                             fontSize: '12px',
                                             backgroundColor: getStatusColor(visit.status),
                                             color: 'white'
                                         }}>
                                             {visit.status || 'N/A'}
                                         </span>
                                     </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        {visit.time_spent || 'N/A'}
                                    </td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                        {visit.travel_time || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    function getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'scheduled': return '#007bff';
            case 'traveling': return '#ffc107';
            case 'in_progress': return '#17a2b8';
            case 'completed': return '#28a745';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    }
}
