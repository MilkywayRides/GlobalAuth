import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, ExternalLink } from "lucide-react";

export default function OAuthTestPage() {
  const testParams = new URLSearchParams({
    client_id: "your-client-id",
    redirect_uri: "http://localhost:3000/oauth/callback",
    response_type: "code",
    scope: "read profile email",
    state: "random-state-string",
  });

  const authorizeUrl = `/oauth/authorize?${testParams.toString()}`;

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">OAuth 2.0 Test</h1>
        <p className="text-muted-foreground">
          Test the OAuth authorization flow for BlazeNeuro Developer Portal
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Authorization Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Authorization Flow
            </CardTitle>
            <CardDescription>
              Test the complete OAuth 2.0 authorization code flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Step 1: Authorization Request</h4>
              <p className="text-sm text-muted-foreground">
                Redirect user to authorization endpoint
              </p>
              <Button asChild className="w-full">
                <a href={authorizeUrl}>
                  Start OAuth Flow
                </a>
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Parameters:</h4>
              <div className="text-xs space-y-1 font-mono bg-muted p-3 rounded">
                <div>client_id: your-client-id</div>
                <div>redirect_uri: http://localhost:3000/oauth/callback</div>
                <div>response_type: code</div>
                <div>scope: read profile email</div>
                <div>state: random-state-string</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Endpoints
            </CardTitle>
            <CardDescription>
              OAuth 2.0 endpoints for your applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Authorization Endpoint</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  GET /oauth/authorize
                </code>
              </div>
              
              <div>
                <h4 className="font-medium">Token Endpoint</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  POST /api/oauth/token
                </code>
              </div>
              
              <div>
                <h4 className="font-medium">User Info Endpoint</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  GET /api/oauth/userinfo
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Example</CardTitle>
          <CardDescription>
            How to implement OAuth 2.0 flow in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Authorization Request (JavaScript)</h4>
              <pre className="text-xs bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// Redirect user to authorization endpoint
const params = new URLSearchParams({
  client_id: 'your-client-id',
  redirect_uri: 'http://localhost:3000/oauth/callback',
  response_type: 'code',
  scope: 'read profile email',
  state: 'random-state-string'
});

window.location.href = \`/oauth/authorize?\${params.toString()}\`;`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Token Exchange (Backend)</h4>
              <pre className="text-xs bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// Exchange authorization code for access token
const response = await fetch('/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: 'authorization-code-from-callback',
    redirect_uri: 'http://localhost:3000/oauth/callback',
    client_id: 'your-client-id',
    client_secret: 'your-client-secret'
  })
});

const { access_token } = await response.json();`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. API Request with Token</h4>
              <pre className="text-xs bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// Use access token to make API requests
const userInfo = await fetch('/api/oauth/userinfo', {
  headers: {
    'Authorization': \`Bearer \${access_token}\`
  }
});

const user = await userInfo.json();
console.log(user); // { sub, name, email, picture, role }`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
