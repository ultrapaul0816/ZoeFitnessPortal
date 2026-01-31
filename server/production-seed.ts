import { storage } from "./storage";
import { 
  courses, 
  courseModules, 
  courseModuleMappings, 
  moduleSections, 
  courseEnrollments,
  users
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.REPLIT_DEPLOYMENT === '1';
  const connectionString = isProduction 
    ? (process.env.PROD_DATABASE_URL || process.env.DATABASE_URL)
    : process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }
  const sqlConnection = neon(connectionString);
  return drizzle(sqlConnection);
}

export async function seedHealYourCoreCourse(): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDb();
    const existingCourse = await db.select().from(courses).where(eq(courses.id, 'heal-your-core-course')).limit(1);
    
    if (existingCourse.length > 0) {
      return { success: true, message: "Heal Your Core course already exists - skipping seed" };
    }

    console.log("[Production Seed] Seeding Heal Your Core course...");

    await db.insert(courses).values({
      id: 'heal-your-core-course',
      name: 'Heal Your Core',
      slug: 'heal-your-core',
      description: 'A comprehensive 6-week postnatal core rehabilitation program designed for mothers 6 weeks to 6 years postpartum. Focus on breath, posture, and gentle reconnection with your core and pelvic floor.',
      shortDescription: 'Your 6-week postpartum strength recovery journey',
      imageUrl: '/attached-assets/program-cover.png',
      level: 'beginner',
      price: 0,
      status: 'published',
      isVisible: true,
      orderIndex: 1,
      durationWeeks: 6,
    });

    const moduleData = [
      { id: 'heal-start-here', name: 'Start Here', slug: 'start-here', description: 'Welcome to your postpartum recovery journey. Get started with important guidance and program overview.', moduleType: 'educational', iconName: 'PlayCircle', colorTheme: 'pink', isReusable: true, isVisible: true },
      { id: 'heal-core-education', name: 'Understanding Your Core', slug: 'understanding-your-core', description: 'Learn about your core anatomy, diastasis recti, and the foundation for your recovery.', moduleType: 'educational', iconName: 'BookOpen', colorTheme: 'blue', isReusable: true, isVisible: true },
      { id: 'heal-week-1', name: 'Week 1: Reconnect & Reset', slug: 'week-1-reconnect-reset', description: 'Foundation Building - Focus on breath, posture, and gentle reconnection with your core and pelvic floor.', moduleType: 'workout', iconName: 'Zap', colorTheme: 'pink', isReusable: true, isVisible: true },
      { id: 'heal-week-2', name: 'Week 2: Stability & Breathwork', slug: 'week-2-stability-breathwork', description: 'Building Rhythm - Begin layering in simple movements with control. Move slowly, focus on quality.', moduleType: 'workout', iconName: 'Flame', colorTheme: 'cyan', isReusable: true, isVisible: true },
      { id: 'heal-week-3', name: 'Week 3: Control & Awareness', slug: 'week-3-control-awareness', description: 'Strengthening Base - Challenge your balance, posture, and deep core awareness.', moduleType: 'workout', iconName: 'Target', colorTheme: 'emerald', isReusable: true, isVisible: true },
      { id: 'heal-week-4', name: 'Week 4: Align & Activate', slug: 'week-4-align-activate', description: 'Building Challenge - Ready for more challenge while maintaining connection.', moduleType: 'workout', iconName: 'Compass', colorTheme: 'violet', isReusable: true, isVisible: true },
      { id: 'heal-week-5', name: 'Week 5: Functional Core Flow', slug: 'week-5-functional-core-flow', description: 'Real-Life Movement - Bridge your core work with real-life movement like lifting and carrying.', moduleType: 'workout', iconName: 'Activity', colorTheme: 'indigo', isReusable: true, isVisible: true },
      { id: 'heal-week-6', name: 'Week 6: Foundational Strength', slug: 'week-6-foundational-strength', description: 'Graduation Program - Full-body coordination with stability ball work.', moduleType: 'workout', iconName: 'Trophy', colorTheme: 'amber', isReusable: true, isVisible: true },
      { id: 'heal-nutrition', name: 'Nutrition & Hydration', slug: 'nutrition-hydration', description: 'Fuel your recovery with proper nutrition and hydration guidance for postpartum moms.', moduleType: 'nutrition', iconName: 'Apple', colorTheme: 'green', isReusable: true, isVisible: true },
      { id: 'heal-whats-next', name: 'What Comes Next', slug: 'whats-next', description: 'Continue your journey beyond the 6-week program with next steps and ongoing support.', moduleType: 'progress', iconName: 'ArrowRight', colorTheme: 'purple', isReusable: true, isVisible: true },
      { id: 'heal-faq', name: 'Frequently Asked Questions', slug: 'faq', description: 'Common questions answered about your postpartum recovery journey.', moduleType: 'faq', iconName: 'HelpCircle', colorTheme: 'gray', isReusable: true, isVisible: true },
    ];

    for (const mod of moduleData) {
      await db.insert(courseModules).values(mod).onConflictDoNothing();
    }

    const mappingData = [
      { id: 'mapping-start-here', courseId: 'heal-your-core-course', moduleId: 'heal-start-here', orderIndex: 1, isRequired: true, isVisible: true },
      { id: 'mapping-core-education', courseId: 'heal-your-core-course', moduleId: 'heal-core-education', orderIndex: 2, isRequired: false, isVisible: true },
      { id: 'mapping-week-1', courseId: 'heal-your-core-course', moduleId: 'heal-week-1', orderIndex: 3, isRequired: true, isVisible: true },
      { id: 'mapping-week-2', courseId: 'heal-your-core-course', moduleId: 'heal-week-2', orderIndex: 4, isRequired: true, isVisible: true },
      { id: 'mapping-week-3', courseId: 'heal-your-core-course', moduleId: 'heal-week-3', orderIndex: 5, isRequired: true, isVisible: true },
      { id: 'mapping-week-4', courseId: 'heal-your-core-course', moduleId: 'heal-week-4', orderIndex: 6, isRequired: true, isVisible: true },
      { id: 'mapping-week-5', courseId: 'heal-your-core-course', moduleId: 'heal-week-5', orderIndex: 7, isRequired: true, isVisible: true },
      { id: 'mapping-week-6', courseId: 'heal-your-core-course', moduleId: 'heal-week-6', orderIndex: 8, isRequired: true, isVisible: true },
      { id: 'mapping-nutrition', courseId: 'heal-your-core-course', moduleId: 'heal-nutrition', orderIndex: 9, isRequired: false, isVisible: true },
      { id: 'mapping-whats-next', courseId: 'heal-your-core-course', moduleId: 'heal-whats-next', orderIndex: 10, isRequired: false, isVisible: true },
      { id: 'mapping-faq', courseId: 'heal-your-core-course', moduleId: 'heal-faq', orderIndex: 11, isRequired: false, isVisible: true },
    ];

    for (const mapping of mappingData) {
      await db.insert(courseModuleMappings).values(mapping).onConflictDoNothing();
    }

    const sectionData = [
      { id: 'start-intro', moduleId: 'heal-start-here', title: 'Welcome to Your Journey', description: 'Your introduction to the core recovery program', orderIndex: 0, isVisible: true },
      { id: 'start-equipment', moduleId: 'heal-start-here', title: 'Equipment You Will Need', description: 'Essential and optional equipment for your workouts', orderIndex: 1, isVisible: true },
      { id: 'start-community', moduleId: 'heal-start-here', title: 'Community & Support', description: 'Connect with other mamas on the same journey', orderIndex: 2, isVisible: true },
      { id: 'core-breathing', moduleId: 'heal-core-education', title: 'Breathing & Core Activation', description: 'Foundation of all core work - master your breath first', orderIndex: 0, isVisible: true },
      { id: 'core-360', moduleId: 'heal-core-education', title: 'How To Breathe Properly: 360° Breathing', description: 'Learn the technique that connects your breath to your core', orderIndex: 1, isVisible: true },
      { id: 'core-tva', moduleId: 'heal-core-education', title: 'Understanding Your Core & TVA Engagement', description: 'Understanding and activating your transverse abdominis', orderIndex: 2, isVisible: true },
      { id: 'core-engage-breathing', moduleId: 'heal-core-education', title: 'How To Engage Your Core With Breathing', description: '', orderIndex: 3, isVisible: true },
      { id: 'core-compressions', moduleId: 'heal-core-education', title: 'Core Compressions & How They Help You Heal', description: 'Gentle activation exercises to reconnect with your deep core', orderIndex: 4, isVisible: true },
      { id: 'core-pelvic', moduleId: 'heal-core-education', title: 'Understanding the Pelvic Floor', description: 'The relationship between your core and pelvic floor', orderIndex: 5, isVisible: true },
      { id: 'core-warning', moduleId: 'heal-core-education', title: 'Warning Signs: Doming, Coning & When to Modify', description: 'What to watch for and how to modify exercises', orderIndex: 6, isVisible: true },
      { id: 'sec-week1-overview', moduleId: 'heal-week-1', title: 'Overview', description: 'Foundation Building - This is your foundation. Focus on breath, posture, and gentle reconnection with your core and pelvic floor.', orderIndex: 1, isVisible: true },
      { id: 'sec-week1-breathing', moduleId: 'heal-week-1', title: 'Part 1: 360° Breathing', description: 'Morning and evening breathing practice', orderIndex: 2, isVisible: true },
      { id: 'sec-week1-workout', moduleId: 'heal-week-1', title: 'Part 2: Main Workout', description: 'Complete on Days 1, 3, 5, and 7 of each week', orderIndex: 3, isVisible: true },
      { id: 'sec-week2-overview', moduleId: 'heal-week-2', title: 'Overview', description: 'Building Rhythm - Begin layering in simple movements with control. Move slowly, focus on quality, and stay aware of your body signals.', orderIndex: 1, isVisible: true },
      { id: 'sec-week2-breathing', moduleId: 'heal-week-2', title: 'Part 1: Core & Breath Reset Flow', description: 'Three-part breathing flow', orderIndex: 2, isVisible: true },
      { id: 'sec-week2-workout', moduleId: 'heal-week-2', title: 'Part 2: Main Workout', description: 'Complete on Days 1, 3, and 5 of each week', orderIndex: 3, isVisible: true },
      { id: 'sec-week3-overview', moduleId: 'heal-week-3', title: 'Overview', description: 'Strengthening Base - Challenge your balance, posture, and deep core awareness. This is where your connection meets gentle strength.', orderIndex: 1, isVisible: true },
      { id: 'sec-week3-breathing', moduleId: 'heal-week-3', title: 'Part 1: Morning + Evening Breathing', description: 'Can be performed in multiple positions', orderIndex: 2, isVisible: true },
      { id: 'sec-week3-workout', moduleId: 'heal-week-3', title: 'Part 2: Main Workout', description: 'Complete on Days 2, 4, and 6 of each week', orderIndex: 3, isVisible: true },
      { id: 'sec-week4-overview', moduleId: 'heal-week-4', title: 'Overview', description: 'Building Challenge - Ready for more challenge. These exercises ask more of your body while maintaining connection.', orderIndex: 1, isVisible: true },
      { id: 'sec-week4-breathing', moduleId: 'heal-week-4', title: 'Part 1: 90 90 Box Breathing', description: '90-90 position breathing practice', orderIndex: 2, isVisible: true },
      { id: 'sec-week4-workout', moduleId: 'heal-week-4', title: 'Part 2: Main Workout', description: 'Complete on Days 1, 3, and 5 of each week', orderIndex: 3, isVisible: true },
      { id: 'sec-week5-overview', moduleId: 'heal-week-5', title: 'Overview', description: 'Real-Life Movement - Bridge your core work with real-life movement like lifting your baby, carrying groceries, or moving quickly.', orderIndex: 1, isVisible: true },
      { id: 'sec-week5-breathing', moduleId: 'heal-week-5', title: 'Part 1: Breathing Practice', description: 'Continue with your preferred breathing practice from previous weeks', orderIndex: 2, isVisible: true },
      { id: 'sec-week5-workout', moduleId: 'heal-week-5', title: 'Part 2: Main Workout', description: 'Complete on Days 2, 4, and 6 of each week', orderIndex: 3, isVisible: true },
      { id: 'sec-week6-overview', moduleId: 'heal-week-6', title: 'Overview', description: 'Graduation Program - Full-body coordination with stability ball work. You have built the foundation—now we challenge it.', orderIndex: 1, isVisible: true },
      { id: 'sec-week6-breathing', moduleId: 'heal-week-6', title: 'Part 1: Breathing Practice', description: 'Continue with your preferred breathing practice', orderIndex: 2, isVisible: true },
      { id: 'sec-week6-workout', moduleId: 'heal-week-6', title: 'Part 2: Main Workout', description: 'Complete on Days 1, 3, 5, and 7 of each week', orderIndex: 3, isVisible: true },
      { id: 'nutrition-why', moduleId: 'heal-nutrition', title: 'Why Nutrition Matters for Recovery', description: 'Understanding the role of nutrition in your postpartum healing', orderIndex: 0, isVisible: true },
      { id: 'nutrition-priorities', moduleId: 'heal-nutrition', title: 'Postpartum Nutrition Priorities', description: 'Key nutrients and foods to focus on during recovery', orderIndex: 1, isVisible: true },
      { id: 'nutrition-portions', moduleId: 'heal-nutrition', title: 'Portion & Quantity Guidance', description: 'Practical guidance for balanced eating without restrictive dieting', orderIndex: 2, isVisible: true },
      { id: 'next-ready', moduleId: 'heal-whats-next', title: 'How To Know You Are Ready', description: 'Signs that you are ready to progress to more challenging exercises', orderIndex: 0, isVisible: true },
      { id: 'next-redflags', moduleId: 'heal-whats-next', title: 'Red Flag Movements to Avoid', description: 'Exercises to skip until your core is fully healed', orderIndex: 1, isVisible: true },
      { id: 'next-impact', moduleId: 'heal-whats-next', title: 'Return to Impact Readiness Test', description: 'Testing your readiness for running, jumping, and high-impact activities', orderIndex: 2, isVisible: true },
      { id: 'next-tracker', moduleId: 'heal-whats-next', title: 'Progress Tracker', description: 'Track your journey and celebrate your wins', orderIndex: 3, isVisible: true },
      { id: 'next-celebrate', moduleId: 'heal-whats-next', title: 'YAY MAMA...YOU DID IT!', description: 'Celebrating your incredible achievement', orderIndex: 4, isVisible: true },
      { id: 'faq-general', moduleId: 'heal-faq', title: 'Frequently Asked Questions', description: 'Real questions, honest answers because you deserve clarity, not confusion', orderIndex: 0, isVisible: true },
    ];

    for (const section of sectionData) {
      await db.insert(moduleSections).values(section).onConflictDoNothing();
    }

    console.log("[Production Seed] Heal Your Core course seeded successfully!");
    return { success: true, message: "Heal Your Core course seeded successfully with 11 modules and 37 sections" };

  } catch (error) {
    console.error("[Production Seed] Error seeding course:", error);
    return { success: false, message: `Seed failed: ${error}` };
  }
}

export async function enrollAllUsersInHealYourCore(): Promise<{ success: boolean; message: string; enrolled: number }> {
  try {
    const db = getDb();
    const courseExists = await db.select().from(courses).where(eq(courses.id, 'heal-your-core-course')).limit(1);
    
    if (courseExists.length === 0) {
      return { success: false, message: "Heal Your Core course doesn't exist - run seed first", enrolled: 0 };
    }

    const allUsers = await db.select({
      id: users.id,
      validUntil: users.validUntil,
    }).from(users).where(eq(users.isAdmin, false));

    let enrolled = 0;
    for (const user of allUsers) {
      const existingEnrollment = await db
        .select()
        .from(courseEnrollments)
        .where(sql`user_id = ${user.id} AND course_id = 'heal-your-core-course'`)
        .limit(1);

      if (existingEnrollment.length === 0) {
        await db.insert(courseEnrollments).values({
          userId: user.id,
          courseId: 'heal-your-core-course',
          expiresAt: user.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: 'active',
        });
        enrolled++;
      }
    }

    console.log(`[Production Seed] Enrolled ${enrolled} users in Heal Your Core`);
    return { 
      success: true, 
      message: `Enrolled ${enrolled} users in Heal Your Core (${allUsers.length - enrolled} already enrolled)`,
      enrolled 
    };

  } catch (error) {
    console.error("[Production Seed] Error enrolling users:", error);
    return { success: false, message: `Enrollment failed: ${error}`, enrolled: 0 };
  }
}
