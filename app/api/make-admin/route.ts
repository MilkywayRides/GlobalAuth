import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  // Use the user ID from your session log
  const userId = 'mlxMe7h2Um6yd1gZNjgiXysr3XfD8oa4';
  
  try {
    // Update by user ID instead of email
    const result = await db.update(user)
      .set({ role: 'admin' })
      .where(eq(user.id, userId))
      .returning();
    
    if (result.length === 0) {
      return Response.json({ success: false, message: `User ID ${userId} not found!` });
    }
    
    return Response.json({ 
      success: true, 
      message: `User ${result[0].email} is now an admin!`,
      user: result[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ success: false, error: String(error) });
  }
}

export async function GET() {
  return POST();
}
