import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { lastLoginMethod, admin } from "better-auth/plugins";
import { db } from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    sendVerificationEmail: async ({ user, url, token }: { user: any; url: string; token: string }) => {
      const otp = token.slice(0, 6).toUpperCase();
      
      try {
        await resend.emails.send({
          from: "BlazeNeuro <noreply@blazeneuro.com>",
          to: user.email,
          subject: "Verify your email - BlazeNeuro",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Verify Your Email</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>Your verification code is:</p>
              <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${otp}
              </div>
              <p>Or click the link below to verify:</p>
              <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Verify Email</a>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">This code expires in 10 minutes.</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: ["openid", "email", "profile"],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      scope: ["user:email", "read:user"],
    },
  },
  plugins: [
    lastLoginMethod({
      storeInDatabase: true,
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      adminUserIds: ["your-user-id-here"],
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
