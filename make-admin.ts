import { db } from './lib/db/index';
import { user } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function makeAdmin() {
  // Replace with your email
  const email = 'your-email@example.com';
  
  try {
    const result = await db.update(user)
      .set({ role: 'admin' })
      .where(eq(user.email, email));
    
    console.log(`✅ User ${email} is now an admin!`);
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

makeAdmin();
