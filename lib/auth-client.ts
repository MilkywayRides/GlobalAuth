"use client";

import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production' 
    ? "https://developer.blazeneuro.com" 
    : "http://localhost:3000",
  plugins: [
    lastLoginMethodClient(),
    adminClient(),
  ],
});
