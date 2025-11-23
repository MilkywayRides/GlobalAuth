export interface DocSection {
  id: string;
  title: string;
  content: string;
  code?: string;
  language?: string;
}

export interface Doc {
  slug: string;
  title: string;
  description: string;
  category: string;
  sections: DocSection[];
  lastUpdated: string;
}

const docs: Doc[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Quick start guide for BlazeNeuro Developer Portal",
    category: "Introduction",
    lastUpdated: "2024-11-23",
    sections: [
      {
        id: "overview",
        title: "Overview",
        content: "BlazeNeuro Developer Portal provides secure authentication and API access for your applications. Get started in minutes with our comprehensive SDK and documentation."
      },
      {
        id: "quick-setup",
        title: "Quick Setup",
        content: "1. Create an account\n2. Generate API keys\n3. Install SDK\n4. Make your first API call",
        code: `npm install @blazeneuro/sdk\n\n// Initialize SDK\nimport { BlazeNeuro } from '@blazeneuro/sdk';\n\nconst client = new BlazeNeuro({\n  apiKey: 'your-api-key',\n  environment: 'production'\n});`,
        language: "javascript"
      }
    ]
  },
  {
    slug: "authentication",
    title: "Authentication",
    description: "Learn about authentication methods and security",
    category: "Authentication",
    lastUpdated: "2024-11-23",
    sections: [
      {
        id: "api-keys",
        title: "API Keys",
        content: "API keys are used to authenticate your requests. Keep them secure and never expose them in client-side code.",
        code: `curl -H "Authorization: Bearer YOUR_API_KEY" \\\n  https://api.blazeneuro.com/v1/user/profile`,
        language: "bash"
      },
      {
        id: "oauth",
        title: "OAuth 2.0",
        content: "OAuth 2.0 flow for user authentication with Google and GitHub providers.",
        code: `// Redirect to OAuth provider\nwindow.location.href = '/api/auth/signin/google';\n\n// Handle callback\nconst { user, session } = await authClient.getSession();`,
        language: "javascript"
      },
      {
        id: "qr-login",
        title: "QR Code Login",
        content: "Secure QR code authentication for mobile apps.",
        code: `// Generate QR session\nconst response = await fetch('/api/auth/qr/generate', {\n  method: 'POST'\n});\nconst { id, qrCode } = await response.json();\n\n// Check status\nconst status = await fetch(\`/api/auth/qr/status/\${id}\`);\nconst { status: loginStatus } = await status.json();`,
        language: "javascript"
      }
    ]
  },
  {
    slug: "api-reference",
    title: "API Reference",
    description: "Complete API documentation with examples",
    category: "API",
    lastUpdated: "2024-11-23",
    sections: [
      {
        id: "base-url",
        title: "Base URL",
        content: "All API requests should be made to: `https://api.blazeneuro.com/v1`",
        code: "https://api.blazeneuro.com/v1",
        language: "text"
      },
      {
        id: "authentication-api",
        title: "Authentication Endpoints",
        content: "Endpoints for user authentication and session management.",
        code: `POST /api/auth/login\nPOST /api/auth/signup\nPOST /api/auth/logout\nGET  /api/auth/session\n\n// Login example\nPOST /api/auth/login\n{\n  "email": "user@example.com",\n  "password": "securepassword"\n}\n\n// Response\n{\n  "success": true,\n  "user": {\n    "id": "user_123",\n    "email": "user@example.com",\n    "name": "John Doe"\n  },\n  "session": {\n    "token": "jwt_token_here",\n    "expiresAt": "2024-12-23T20:43:12.437Z"\n  }\n}`,
        language: "json"
      },
      {
        id: "qr-endpoints",
        title: "QR Code Endpoints",
        content: "QR code authentication endpoints for mobile integration.",
        code: `POST /api/auth/qr/generate\nGET  /api/auth/qr/status/{sessionId}\nPOST /api/auth/qr/status/{sessionId}\nGET  /api/auth/qr/stream/{sessionId}\n\n// Generate QR session\nPOST /api/auth/qr/generate\n// Response\n{\n  "id": "qr_session_123",\n  "qrCode": "data:image/png;base64,...",\n  "status": "pending",\n  "expiresAt": 1703368992437\n}\n\n// Confirm QR login\nPOST /api/auth/qr/status/qr_session_123\n{\n  "action": "confirm"\n}\n// Response\n{\n  "status": "confirmed"\n}`,
        language: "json"
      }
    ]
  },
  {
    slug: "mobile-integration",
    title: "Mobile Integration",
    description: "Integrate with Android and iOS applications",
    category: "Mobile",
    lastUpdated: "2024-11-23",
    sections: [
      {
        id: "android-setup",
        title: "Android Setup",
        content: "Setup instructions for Android applications using Kotlin.",
        code: `// Add to build.gradle\nimplementation 'com.squareup.retrofit2:retrofit:2.9.0'\nimplementation 'com.journeyapps:zxing-android-embedded:4.3.0'\n\n// API Service\ninterface ApiService {\n    @POST("api/auth/login")\n    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>\n    \n    @POST("api/auth/qr/status/{sessionId}")\n    suspend fun confirmQR(\n        @Path("sessionId") sessionId: String,\n        @Body request: QRConfirmRequest\n    ): Response<QRResponse>\n}`,
        language: "kotlin"
      },
      {
        id: "qr-scanning",
        title: "QR Code Scanning",
        content: "Implement QR code scanning for mobile authentication.",
        code: `// Android QR Scanner\nval options = ScanOptions().apply {\n    setDesiredBarcodeFormats(ScanOptions.QR_CODE)\n    setPrompt("Scan QR Code for BlazeNeuro Login")\n    setCameraId(0)\n    setBeepEnabled(true)\n}\nbarcodeLauncher.launch(options)\n\n// Handle QR result\nprivate fun handleQRResult(qrContent: String) {\n    val qrData = Gson().fromJson(qrContent, QRData::class.java)\n    if (qrData.type == "blazeneuro_login") {\n        confirmLogin(qrData.sessionId)\n    }\n}`,
        language: "kotlin"
      }
    ]
  },
  {
    slug: "sdk-usage",
    title: "SDK Usage",
    description: "How to use BlazeNeuro SDK in your applications",
    category: "SDK",
    lastUpdated: "2024-11-23",
    sections: [
      {
        id: "installation",
        title: "Installation",
        content: "Install the BlazeNeuro SDK for your platform.",
        code: `# JavaScript/TypeScript\nnpm install @blazeneuro/sdk\n\n# Python\npip install blazeneuro-sdk\n\n# Java\n<dependency>\n    <groupId>com.blazeneuro</groupId>\n    <artifactId>blazeneuro-sdk</artifactId>\n    <version>1.0.0</version>\n</dependency>`,
        language: "bash"
      },
      {
        id: "initialization",
        title: "Initialization",
        content: "Initialize the SDK with your API credentials.",
        code: `// JavaScript\nimport { BlazeNeuro } from '@blazeneuro/sdk';\n\nconst client = new BlazeNeuro({\n  apiKey: process.env.BLAZENEURO_API_KEY,\n  environment: 'production', // or 'sandbox'\n  timeout: 30000\n});\n\n// Python\nfrom blazeneuro import BlazeNeuro\n\nclient = BlazeNeuro(\n    api_key=os.getenv('BLAZENEURO_API_KEY'),\n    environment='production'\n)`,
        language: "javascript"
      },
      {
        id: "making-requests",
        title: "Making Requests",
        content: "Examples of common SDK operations.",
        code: `// Get user profile\nconst user = await client.auth.getProfile();\n\n// Create session\nconst session = await client.auth.createSession({\n  email: 'user@example.com',\n  password: 'password'\n});\n\n// Generate QR code\nconst qrSession = await client.qr.generate();\nconsole.log('QR Code:', qrSession.qrCode);\n\n// Listen for QR events\nclient.qr.onStatusChange(qrSession.id, (status) => {\n  if (status === 'confirmed') {\n    console.log('User logged in via QR!');\n  }\n});`,
        language: "javascript"
      }
    ]
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    description: "Handle real-time events with webhooks",
    category: "Integration",
    lastUpdated: "2024-11-23",
    sections: [
      {
        id: "setup",
        title: "Webhook Setup",
        content: "Configure webhooks to receive real-time notifications.",
        code: `// Webhook endpoint example\napp.post('/webhooks/blazeneuro', (req, res) => {\n  const signature = req.headers['x-blazeneuro-signature'];\n  const payload = req.body;\n  \n  // Verify webhook signature\n  if (!verifySignature(payload, signature)) {\n    return res.status(401).send('Unauthorized');\n  }\n  \n  // Handle event\n  switch (payload.type) {\n    case 'user.login':\n      console.log('User logged in:', payload.data.user);\n      break;\n    case 'qr.confirmed':\n      console.log('QR login confirmed:', payload.data.sessionId);\n      break;\n  }\n  \n  res.status(200).send('OK');\n});`,
        language: "javascript"
      },
      {
        id: "events",
        title: "Event Types",
        content: "Available webhook events and their payloads.",
        code: `// user.login\n{\n  "type": "user.login",\n  "timestamp": "2024-11-23T20:43:12.437Z",\n  "data": {\n    "user": {\n      "id": "user_123",\n      "email": "user@example.com"\n    },\n    "method": "email" // or "oauth", "qr"\n  }\n}\n\n// qr.confirmed\n{\n  "type": "qr.confirmed",\n  "timestamp": "2024-11-23T20:43:12.437Z",\n  "data": {\n    "sessionId": "qr_session_123",\n    "userId": "user_123"\n  }\n}`,
        language: "json"
      }
    ]
  }
];

export function getAllDocs(): Doc[] {
  return docs;
}

export function getDocBySlug(slug: string): Doc | null {
  return docs.find(doc => doc.slug === slug) || null;
}

export function getDocsByCategory(category: string): Doc[] {
  return docs.filter(doc => doc.category === category);
}

export function getCategories(): string[] {
  return [...new Set(docs.map(doc => doc.category))];
}
