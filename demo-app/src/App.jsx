import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [authUrl, setAuthUrl] = useState('http://localhost:3000');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for code in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      handleCallback(code);
    }

    // Load saved creds
    const savedClientId = localStorage.getItem('demo_clientId');
    const savedClientSecret = localStorage.getItem('demo_clientSecret');
    const savedAuthUrl = localStorage.getItem('demo_authUrl');

    if (savedClientId) setClientId(savedClientId);
    if (savedClientSecret) setClientSecret(savedClientSecret);
    if (savedAuthUrl) setAuthUrl(savedAuthUrl);
  }, []);

  const handleLogin = () => {
    if (!clientId || !authUrl) {
      alert('Please enter Client ID and Auth URL');
      return;
    }

    // Save creds
    localStorage.setItem('demo_clientId', clientId);
    localStorage.setItem('demo_clientSecret', clientSecret);
    localStorage.setItem('demo_authUrl', authUrl);

    const redirectUri = `${window.location.origin}/callback`;
    const url = new URL(`${authUrl}/oauth/authorize`);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', 'demo_app_state');

    window.location.href = url.toString();
  };

  const handleCallback = async (code) => {
    setLoading(true);
    // Clean URL
    window.history.replaceState({}, document.title, "/");

    const savedClientId = localStorage.getItem('demo_clientId');
    const savedClientSecret = localStorage.getItem('demo_clientSecret');
    const savedAuthUrl = localStorage.getItem('demo_authUrl');

    if (!savedClientId || !savedClientSecret || !savedAuthUrl) {
      setError("Missing saved credentials. Please try logging in again.");
      setLoading(false);
      return;
    }

    try {
      // Exchange code for token
      const tokenRes = await fetch(`${savedAuthUrl}/api/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: savedClientId,
          client_secret: savedClientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${window.location.origin}/callback`,
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      // Fetch user info
      const userRes = await fetch(`${savedAuthUrl}/api/oauth/userinfo`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      const userData = await userRes.json();
      setUserInfo(userData);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUserInfo(null);
    setError(null);
  };

  return (
    <div className="container">
      <h1>OAuth 2.0 Demo App</h1>

      {loading && <div className="loading">Loading...</div>}

      {error && (
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {!userInfo && !loading && (
        <div className="login-form">
          <div className="form-group">
            <label>Auth Server URL</label>
            <input
              type="text"
              value={authUrl}
              onChange={(e) => setAuthUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
          </div>
          <div className="form-group">
            <label>Client ID</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="bn_..."
            />
          </div>
          <div className="form-group">
            <label>Client Secret</label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="bn_..."
            />
          </div>
          <button onClick={handleLogin} className="btn-primary">
            Log in with OAuth
          </button>
          <p className="hint">
            Make sure to add <code>{window.location.origin}/callback</code> to your OAuth App's Redirect URIs.
          </p>
        </div>
      )}

      {userInfo && (
        <div className="user-profile">
          <div className="profile-header">
            {userInfo.picture && <img src={userInfo.picture} alt={userInfo.name} className="avatar" />}
            <h2>Welcome, {userInfo.name}!</h2>
          </div>
          <div className="profile-details">
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Role:</strong> {userInfo.role}</p>
            <p><strong>User ID:</strong> {userInfo.sub}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">Log out</button>
        </div>
      )}
    </div>
  )
}

export default App
