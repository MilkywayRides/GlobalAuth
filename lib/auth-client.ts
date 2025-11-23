"use client";

import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    lastLoginMethodClient(),
    adminClient(),
  ],
});
