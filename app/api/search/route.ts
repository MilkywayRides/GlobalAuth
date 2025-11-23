import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, user, apiUsage } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql, ilike, or, and, desc } from "drizzle-orm";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'page' | 'user' | 'app' | 'setting';
  icon: string;
  score: number;
}

// Fuzzy search scoring algorithm
function calculateScore(query: string, text: string, field: 'title' | 'description' = 'title'): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 90;
  
  // Contains query gets medium score
  if (textLower.includes(queryLower)) return field === 'title' ? 70 : 50;
  
  // Fuzzy matching for typos
  let score = 0;
  const words = queryLower.split(' ');
  
  for (const word of words) {
    if (textLower.includes(word)) {
      score += field === 'title' ? 30 : 20;
    }
  }
  
  return score;
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q')?.trim();
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: SearchResult[] = [];
    const isAdmin = session.user.role === 'admin';

    // 1. Search static pages
    const staticPages = [
      { id: 'dashboard', title: 'Dashboard', description: 'View your main dashboard', url: '/dashboard', type: 'page' as const, icon: 'BarChart3' },
      { id: 'oauth-apps', title: 'OAuth Apps', description: 'Manage your OAuth applications', url: '/dashboard/oauth', type: 'page' as const, icon: 'Key' },
      { id: 'users', title: 'Users', description: 'View authenticated users', url: '/dashboard/users', type: 'page' as const, icon: 'Users' },
      ...(isAdmin ? [
        { id: 'admin', title: 'Admin Panel', description: 'Access admin dashboard', url: '/admin', type: 'page' as const, icon: 'Settings' },
        { id: 'admin-users', title: 'Admin Users', description: 'Manage all system users', url: '/admin/users', type: 'page' as const, icon: 'Users' },
        { id: 'admin-oauth', title: 'Admin OAuth', description: 'Manage OAuth applications', url: '/admin/oauth', type: 'page' as const, icon: 'Key' },
        { id: 'admin-apps', title: 'All Applications', description: 'View all user applications', url: '/admin/apps', type: 'page' as const, icon: 'FileText' },
      ] : [])
    ];

    for (const page of staticPages) {
      const titleScore = calculateScore(query, page.title, 'title');
      const descScore = calculateScore(query, page.description, 'description');
      const maxScore = Math.max(titleScore, descScore);
      
      if (maxScore > 0) {
        results.push({
          ...page,
          score: maxScore
        });
      }
    }

    // 2. Search user's OAuth applications
    const userApps = await db
      .select({
        id: applications.id,
        name: applications.name,
        clientId: applications.clientId,
        appType: applications.appType,
        homepageUrl: applications.homepageUrl,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .where(
        and(
          eq(applications.userId, session.user.id),
          or(
            ilike(applications.name, `%${query}%`),
            ilike(applications.clientId, `%${query}%`),
            ilike(applications.appType, `%${query}%`)
          )
        )
      )
      .limit(10);

    for (const app of userApps) {
      const titleScore = calculateScore(query, app.name, 'title');
      const clientIdScore = calculateScore(query, app.clientId, 'description');
      const typeScore = calculateScore(query, app.appType, 'description');
      const maxScore = Math.max(titleScore, clientIdScore, typeScore);

      if (maxScore > 0) {
        results.push({
          id: `app-${app.id}`,
          title: app.name,
          description: `${app.appType} app • ${app.clientId}`,
          url: `/dashboard/oauth`,
          type: 'app',
          icon: 'Key',
          score: maxScore + 10 // Boost user's own apps
        });
      }
    }

    // 3. Search all applications (admin only)
    if (isAdmin) {
      const allApps = await db
        .select({
          id: applications.id,
          name: applications.name,
          clientId: applications.clientId,
          appType: applications.appType,
          ownerName: user.name,
          ownerEmail: user.email,
        })
        .from(applications)
        .innerJoin(user, eq(applications.userId, user.id))
        .where(
          and(
            sql`${applications.userId} != ${session.user.id}`, // Exclude user's own apps
            or(
              ilike(applications.name, `%${query}%`),
              ilike(applications.clientId, `%${query}%`),
              ilike(user.name, `%${query}%`),
              ilike(user.email, `%${query}%`)
            )
          )
        )
        .limit(15);

      for (const app of allApps) {
        const titleScore = calculateScore(query, app.name, 'title');
        const ownerScore = calculateScore(query, app.ownerName || '', 'description');
        const emailScore = calculateScore(query, app.ownerEmail, 'description');
        const maxScore = Math.max(titleScore, ownerScore, emailScore);

        if (maxScore > 0) {
          results.push({
            id: `all-app-${app.id}`,
            title: app.name,
            description: `by ${app.ownerName} • ${app.appType}`,
            url: `/admin/apps`,
            type: 'app',
            icon: 'Globe',
            score: maxScore
          });
        }
      }
    }

    // 4. Search users (admin only)
    if (isAdmin) {
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(
          or(
            ilike(user.name, `%${query}%`),
            ilike(user.email, `%${query}%`),
            ilike(user.role, `%${query}%`)
          )
        )
        .limit(10);

      for (const u of users) {
        const nameScore = calculateScore(query, u.name || '', 'title');
        const emailScore = calculateScore(query, u.email, 'description');
        const roleScore = calculateScore(query, u.role || '', 'description');
        const maxScore = Math.max(nameScore, emailScore, roleScore);

        if (maxScore > 0) {
          results.push({
            id: `user-${u.id}`,
            title: u.name || 'Unknown User',
            description: `${u.email} • ${u.role}`,
            url: `/admin/users`,
            type: 'user',
            icon: 'User',
            score: maxScore
          });
        }
      }
    }

    // Sort by score (highest first) and limit results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json({ 
      results: sortedResults,
      query,
      total: sortedResults.length 
    });

  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
