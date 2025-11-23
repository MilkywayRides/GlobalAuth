const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log("=== OAuth 2.0 Test Flow ===\n");

    const clientId = await question("Enter Client ID: ");
    const clientSecret = await question("Enter Client Secret: ");
    const redirectUri = await question("Enter Redirect URI (default: http://localhost:3000/callback): ") || "http://localhost:3000/callback";
    const baseUrl = await question("Enter Base URL (default: http://localhost:3000): ") || "http://localhost:3000";

    console.log("\n--- Step 1: Authorization ---");
    const authUrl = new URL(`${baseUrl}/oauth/authorize`);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", "test_state");

    console.log(`\nVisit this URL in your browser:\n\n${authUrl.toString()}\n`);
    console.log("Authorize the app, and you will be redirected to your callback URL.");
    console.log("Copy the 'code' parameter from the URL (e.g., ?code=xyz...).");

    const code = await question("\nEnter the Authorization Code: ");

    console.log("\n--- Step 2: Token Exchange ---");
    try {
        const tokenResponse = await fetch(`${baseUrl}/api/oauth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: "authorization_code",
                redirect_uri: redirectUri,
            }),
        });

        const tokenData = await tokenResponse.json();
        console.log("\nToken Response:", JSON.stringify(tokenData, null, 2));

        if (tokenData.access_token) {
            console.log("\n--- Step 3: User Info ---");
            const userResponse = await fetch(`${baseUrl}/api/oauth/userinfo`, {
                headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`
                }
            });

            const userData = await userResponse.json();
            console.log("\nUser Info:", JSON.stringify(userData, null, 2));
        } else {
            console.error("\nFailed to get access token.");
        }

    } catch (error) {
        console.error("\nError:", error.message);
    } finally {
        rl.close();
    }
}

main();
