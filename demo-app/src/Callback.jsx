import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to home page with the query params
        const params = new URLSearchParams(window.location.search);
        navigate(`/?${params.toString()}`, { replace: true });
    }, [navigate]);

    return (
        <div className="container">
            <div className="loading">Redirecting...</div>
        </div>
    );
}
