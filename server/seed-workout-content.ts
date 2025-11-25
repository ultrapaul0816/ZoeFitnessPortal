import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { workoutProgramContent, workoutContentExercises } from "@shared/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(connectionString);
const db = drizzle(sql);

interface Exercise {
  num?: number;
  name: string;
  reps: string;
  url?: string;
}

interface BreathingExercise {
  name: string;
  url?: string;
  reps: string;
}

interface ProgramData {
  week: number;
  programNumber: number;
  title: string;
  subtitle: string;
  schedule: string;
  scheduleDetail: string;
  equipment: Array<{ name: string; colorClass: string }>;
  coachNote: string;
  coachNoteColorClass: string;
  part1: {
    title: string;
    exercises: BreathingExercise[];
  };
  part2: {
    playlistUrl: string;
    exercises: Exercise[];
  };
  colorScheme: {
    sectionClass: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
    accentColor: string;
    hoverBg: string;
    buttonColor: string;
  };
}

const workoutPrograms: ProgramData[] = [
  {
    week: 1,
    programNumber: 1,
    title: "PROGRAM 1 - RECONNECT & RESET",
    subtitle: "Foundation Building",
    schedule: "4x per week",
    scheduleDetail: "Complete on Days 1, 3, 5, and 7 of each week",
    equipment: [
      { name: "Mini band", colorClass: "bg-green-100 text-blue-800" },
      { name: "Small Pilates ball", colorClass: "bg-green-100 text-green-800" },
      { name: "Mat", colorClass: "bg-purple-100 text-purple-800" }
    ],
    coachNote: "This is your foundation. Focus on breath, posture, and gentle reconnection with your core and pelvic floor.",
    coachNoteColorClass: "bg-pink-50 border-pink-400 text-pink-700",
    part1: {
      title: "Part 1: 360° Breathing",
      exercises: [
        { name: "Morning + Evening Sessions", reps: "25 breaths" }
      ]
    },
    part2: {
      playlistUrl: "https://www.youtube.com/playlist?list=PLlZC5Vz4VnBRRdU7wvzJJZVxw4E6sN-fb",
      exercises: [
        { num: 1, name: "KNEELING MINI BAND PULL APARTS", reps: "12 reps", url: "https://www.youtube.com/watch?v=jiz7-6nJvjY" },
        { num: 2, name: "QUADRUPED BALL COMPRESSIONS", reps: "10 reps", url: "https://www.youtube.com/watch?v=1QukYQSq0oQ" },
        { num: 3, name: "SUPINE HEEL SLIDES", reps: "10 reps", url: "https://www.youtube.com/watch?v=AIEdkm2q-4k" },
        { num: 4, name: "GLUTE BRIDGES WITH MINI BALL", reps: "15 reps", url: "https://www.youtube.com/watch?v=1vqv8CqCjY0" },
        { num: 5, name: "BUTTERFLY STRETCH — DYNAMIC FLUTTER", reps: "1 min", url: "https://www.youtube.com/watch?v=j5ZGvn1EUTo" }
      ]
    },
    colorScheme: {
      sectionClass: "program-1-section",
      borderColor: "border-pink-400",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      accentColor: "text-pink-600",
      hoverBg: "hover:bg-pink-50",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    }
  },
  {
    week: 2,
    programNumber: 2,
    title: "PROGRAM 2 - STABILITY & BREATHWORK",
    subtitle: "Building Rhythm",
    schedule: "3x per week",
    scheduleDetail: "Complete on Days 1, 3, and 5 of each week",
    equipment: [
      { name: "Mat", colorClass: "bg-purple-100 text-purple-800" },
      { name: "Your breath", colorClass: "bg-gray-100 text-gray-800" },
      { name: "Patience", colorClass: "bg-pink-100 text-pink-800" }
    ],
    coachNote: "Now that you've laid the foundation, we begin layering in simple movements with control. Move slowly, focus on quality, and stay aware of your body's signals.",
    coachNoteColorClass: "bg-cyan-50 border-cyan-400 text-cyan-700",
    part1: {
      title: "Part 1: Core & Breath Reset Flow",
      exercises: [
        { name: "3 Part Core & Breath Reset Flow", url: "https://www.youtube.com/watch?v=SrEKb2TMLzA", reps: "10 breaths each" }
      ]
    },
    part2: {
      playlistUrl: "https://www.youtube.com/playlist?list=PLlZC5Vz4VnBQt0XPv_nXdA-vFisde58u1",
      exercises: [
        { num: 1, name: "SUPINE ALT LEG MARCHES", reps: "10 reps", url: "https://www.youtube.com/watch?v=T8HHp4KXpJI" },
        { num: 2, name: "SUPINE CROSS LATERAL KNEE PRESSES", reps: "10 reps", url: "https://www.youtube.com/watch?v=AyVuVB0oneo" },
        { num: 3, name: "DEADBUG LEG MARCH ARM EXTENSIONS", reps: "10 reps", url: "https://www.youtube.com/watch?v=iKrou6hSgmg" },
        { num: 4, name: "ELBOW KNEE SIDE PLANK LIFTS", reps: "10 reps", url: "https://www.youtube.com/watch?v=zaOToxvSk6g" },
        { num: 5, name: "WISHBONE STRETCH", reps: "30 secs each side", url: "https://www.youtube.com/watch?v=Pd2le_I4bFE" }
      ]
    },
    colorScheme: {
      sectionClass: "program-2-section",
      borderColor: "border-cyan-400",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700",
      accentColor: "text-cyan-600",
      hoverBg: "hover:bg-cyan-50",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    }
  },
  {
    week: 3,
    programNumber: 3,
    title: "PROGRAM 3 - CONTROL & AWARENESS",
    subtitle: "Strengthening Base",
    schedule: "3x per week",
    scheduleDetail: "Complete on Days 2, 4, and 6 of each week",
    equipment: [
      { name: "Resistance band (light)", colorClass: "bg-orange-100 text-orange-800" },
      { name: "Mat", colorClass: "bg-purple-100 text-purple-800" },
      { name: "Optional yoga block", colorClass: "bg-indigo-100 text-indigo-800" }
    ],
    coachNote: "Let's strengthen your base. You'll challenge your balance, posture, and deep core awareness. This is where your connection meets gentle strength.",
    coachNoteColorClass: "bg-emerald-50 border-emerald-400 text-emerald-700",
    part1: {
      title: "Part 1: Morning + Evening - Can Be Performed In Multiple Positions",
      exercises: [
        { name: "SUPINE DIAPHRAGMATIC BREATHING", url: "https://youtu.be/lBhO64vd8aE", reps: "25 breaths" },
        { name: "SIDE LYING DIAPHRAGMATIC BREATHING", url: "https://www.youtube.com/watch?v=tCzxxPxxtjw", reps: "10 breaths each side" }
      ]
    },
    part2: {
      playlistUrl: "https://www.youtube.com/playlist?list=PLlZC5Vz4VnBR0n-zoVGxvFT0K4-uzV9Dd",
      exercises: [
        { num: 1, name: "BAND LAT-PULL W/ 5 KNEE LIFT", reps: "10 reps", url: "https://www.youtube.com/watch?v=-NBcN5pZcH8" },
        { num: 2, name: "BAND LAT-PULL W/ KNEE ADDUCTION/ABDUCTION", reps: "10 reps", url: "https://www.youtube.com/watch?v=Jij6Wc9CQns" },
        { num: 3, name: "BRIDGE W/ BAND LAT-PULL", reps: "10 reps", url: "https://www.youtube.com/watch?v=dv1TVJySjBs" },
        { num: 4, name: "BAND LAT-PULL PILATES PULSES", reps: "20 reps", url: "https://www.youtube.com/watch?v=Tz0Iy90Hx9M" },
        { num: 5, name: "WISHBONE STRETCH", reps: "30 secs each side", url: "https://www.youtube.com/watch?v=Pd2le_I4bFE" },
        { num: 6, name: "HAPPY BABY POSE", reps: "1 min", url: "https://www.youtube.com/watch?v=r6NsBwtPSrw" }
      ]
    },
    colorScheme: {
      sectionClass: "program-3-section",
      borderColor: "border-emerald-400",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      accentColor: "text-emerald-600",
      hoverBg: "hover:bg-emerald-50",
      buttonColor: "bg-green-600 hover:bg-green-700"
    }
  },
  {
    week: 4,
    programNumber: 4,
    title: "PROGRAM 4 - ALIGN & ACTIVATE",
    subtitle: "Building Challenge",
    schedule: "3x per week",
    scheduleDetail: "Complete on Days 1, 3, and 5 of each week",
    equipment: [
      { name: "Small Pilates ball", colorClass: "bg-green-100 text-green-800" },
      { name: "Chair or stool", colorClass: "bg-amber-100 text-amber-800" },
      { name: "Resistance band", colorClass: "bg-orange-100 text-orange-800" },
      { name: "Mat", colorClass: "bg-purple-100 text-purple-800" }
    ],
    coachNote: "You're ready for more challenge. These exercises ask more of your body while maintaining connection.",
    coachNoteColorClass: "bg-violet-50 border-violet-400 text-violet-700",
    part1: {
      title: "Part 1: 90 90 Box Breathing",
      exercises: [
        { name: "90 90 BOX BREATHING", url: "https://www.youtube.com/watch?v=ehaUhSSY1xY", reps: "25 breaths" }
      ]
    },
    part2: {
      playlistUrl: "https://www.youtube.com/playlist?list=PLlZC5Vz4VnBTsiZUsJ7baFzlDbw22IiAw",
      exercises: [
        { num: 1, name: "LEGS ELEVATED GLUTE BRIDGE WITH BALL SQUEEZE", reps: "10 reps", url: "https://www.youtube.com/watch?v=MMH2DLbL0ug" },
        { num: 2, name: "SUPINE KNEE DROPS WITH PILATES BAND", reps: "10 reps each side", url: "https://www.youtube.com/watch?v=EE8iKKo9LEk" },
        { num: 3, name: "ALL FOURS PILATES BALL KNEE PRESS AND LEG LIFT", reps: "10 reps each side", url: "https://www.youtube.com/watch?v=rRWeQqIYzUM" },
        { num: 4, name: "BEAR CRAWL LIFTS WITH BALL SQUEEZE", reps: "20 reps", url: "https://www.youtube.com/watch?v=Y0xmJ3IuOCU" },
        { num: 5, name: "WISHBONE STRETCH", reps: "30 secs each side", url: "https://www.youtube.com/watch?v=Pd2le_I4bFE" },
        { num: 6, name: "BUTTERFLY STRETCH — DYNAMIC FLUTTER", reps: "1 min", url: "https://www.youtube.com/watch?v=j5ZGvn1EUTo" }
      ]
    },
    colorScheme: {
      sectionClass: "program-4-section",
      borderColor: "border-violet-400",
      bgColor: "bg-violet-50",
      textColor: "text-violet-700",
      accentColor: "text-amber-700",
      hoverBg: "hover:bg-violet-50",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    }
  },
  {
    week: 5,
    programNumber: 5,
    title: "PROGRAM 5 - FUNCTIONAL CORE FLOW",
    subtitle: "Real-Life Movement",
    schedule: "3x per week",
    scheduleDetail: "Complete on Days 2, 4, and 6 of each week",
    equipment: [
      { name: "Mini bands", colorClass: "bg-green-100 text-blue-800" },
      { name: "Mat", colorClass: "bg-purple-100 text-purple-800" },
      { name: "Yoga block or Pilates ball", colorClass: "bg-indigo-100 text-indigo-800" },
      { name: "Long resistance band", colorClass: "bg-orange-100 text-orange-800" },
      { name: "Stool or chair", colorClass: "bg-amber-100 text-amber-800" }
    ],
    coachNote: "This phase bridges your core work with real-life movement (like lifting your baby, carrying groceries, or moving quickly). It's functional, safe, and empowering.",
    coachNoteColorClass: "bg-indigo-50 border-indigo-400 text-indigo-700",
    part1: {
      title: "Part 1: Breathing Exercises",
      exercises: [
        { name: "Continue with your preferred breathing practice from previous weeks", reps: "25 breaths" }
      ]
    },
    part2: {
      playlistUrl: "https://www.youtube.com/playlist?list=PLlZC5Vz4VnBRSZiDlmtmV7AStplWQiGok",
      exercises: [
        { num: 1, name: "KNEELING PALLOF RAISES", reps: "10 reps", url: "https://www.youtube.com/watch?v=dBZyeMwNdxQ" },
        { num: 2, name: "SIDE LYING BAND CLAMSHELLS", reps: "10 reps", url: "https://www.youtube.com/watch?v=8Cu-kVG4TZQ" },
        { num: 3, name: "SEATED LEAN BACKS WITH PILATES BALL SQUEEZE", reps: "10 reps", url: "https://www.youtube.com/watch?v=OrH6nMjA0Ho" },
        { num: 4, name: "SINGLE LEG GLUTE BRIDGES", reps: "20 reps", url: "https://www.youtube.com/watch?v=ly2GQ8Hlv6E" },
        { num: 5, name: "COPENHAGEN PLANK HOLD", reps: "20 secs each side", url: "https://www.youtube.com/watch?v=n1YIgAvnNaA" },
        { num: 6, name: "BUTTERFLY STRETCH — DYNAMIC FLUTTER", reps: "1 min", url: "https://www.youtube.com/watch?v=j5ZGvn1EUTo" }
      ]
    },
    colorScheme: {
      sectionClass: "program-5-section",
      borderColor: "border-indigo-400",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      accentColor: "text-indigo-600",
      hoverBg: "hover:bg-indigo-50",
      buttonColor: "bg-teal-600 hover:bg-teal-700"
    }
  },
  {
    week: 6,
    programNumber: 6,
    title: "PROGRAM 6 - FOUNDATIONAL STRENGTH",
    subtitle: "Graduation Program",
    schedule: "4x per week",
    scheduleDetail: "Complete on Days 1, 3, 5, and 7 of each week",
    equipment: [
      { name: "Swiss ball", colorClass: "bg-red-100 text-red-800" },
      { name: "Small Pilates ball", colorClass: "bg-green-100 text-green-800" },
      { name: "Mat", colorClass: "bg-purple-100 text-purple-800" }
    ],
    coachNote: "This is your graduation program. You've built the foundation—now we challenge it with stability ball work to demand full-body coordination.",
    coachNoteColorClass: "bg-amber-50 border-amber-400 text-amber-700",
    part1: {
      title: "Part 1: Breathing Exercises",
      exercises: [
        { name: "Continue with your preferred breathing practice", reps: "25 breaths" }
      ]
    },
    part2: {
      playlistUrl: "https://www.youtube.com/playlist?list=PLlZC5Vz4VnBQokIfzvMlRrabultV17Vki",
      exercises: [
        { num: 1, name: "SWISS BALL HAMSTRING CURLS", reps: "20 reps", url: "https://www.youtube.com/watch?v=dxpSn0HLB6M" },
        { num: 2, name: "SWISS BALL HIP LIFTS TO PIKE", reps: "10 reps", url: "https://www.youtube.com/watch?v=GP5tON5kEDc" },
        { num: 3, name: "SWISS BALL DEADBUGS", reps: "20 reps", url: "https://www.youtube.com/watch?v=PietQSYU2as" },
        { num: 4, name: "SUPINE SWISS BALL HOLD WITH LEG TWISTS", reps: "20 reps", url: "https://www.youtube.com/watch?v=GcVoMJGAV3o" },
        { num: 5, name: "WISHBONE STRETCH", reps: "30 secs each side", url: "https://www.youtube.com/watch?v=Pd2le_I4bFE" },
        { num: 6, name: "KNEELING HIP FLEXOR STRETCH", reps: "1 min each side", url: "https://www.youtube.com/watch?v=GG3rtAKd6hY" }
      ]
    },
    colorScheme: {
      sectionClass: "program-6-section",
      borderColor: "border-amber-400",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      accentColor: "text-amber-600",
      hoverBg: "hover:bg-amber-50",
      buttonColor: "bg-orange-600 hover:bg-orange-700"
    }
  }
];

async function seedWorkoutContent() {
  console.log("Starting workout content seed...");
  
  for (const program of workoutPrograms) {
    console.log(`Seeding Week ${program.week}: ${program.title}`);
    
    // Check if program already exists
    const existing = await db.select()
      .from(workoutProgramContent)
      .where(eq(workoutProgramContent.week, program.week));
    
    let programContentId: string;
    
    if (existing.length > 0) {
      console.log(`  Week ${program.week} already exists, updating...`);
      programContentId = existing[0].id;
      
      // Update the existing program
      await db.update(workoutProgramContent)
        .set({
          programNumber: program.programNumber,
          title: program.title,
          subtitle: program.subtitle,
          schedule: program.schedule,
          scheduleDetail: program.scheduleDetail,
          equipment: program.equipment,
          coachNote: program.coachNote,
          coachNoteColorClass: program.coachNoteColorClass,
          part1Title: program.part1.title,
          part2PlaylistUrl: program.part2.playlistUrl,
          colorScheme: program.colorScheme,
          updatedAt: new Date(),
        })
        .where(eq(workoutProgramContent.id, programContentId));
      
      // Delete existing exercises for this program
      await db.delete(workoutContentExercises)
        .where(eq(workoutContentExercises.programContentId, programContentId));
    } else {
      // Insert new program
      const [inserted] = await db.insert(workoutProgramContent).values({
        week: program.week,
        programNumber: program.programNumber,
        title: program.title,
        subtitle: program.subtitle,
        schedule: program.schedule,
        scheduleDetail: program.scheduleDetail,
        equipment: program.equipment,
        coachNote: program.coachNote,
        coachNoteColorClass: program.coachNoteColorClass,
        part1Title: program.part1.title,
        part2PlaylistUrl: program.part2.playlistUrl,
        colorScheme: program.colorScheme,
      }).returning();
      
      programContentId = inserted.id;
    }
    
    // Insert Part 1 exercises (breathing)
    for (let i = 0; i < program.part1.exercises.length; i++) {
      const ex = program.part1.exercises[i];
      await db.insert(workoutContentExercises).values({
        programContentId,
        sectionType: 'part1',
        orderNum: i + 1,
        name: ex.name,
        reps: ex.reps,
        url: ex.url || null,
      });
    }
    
    // Insert Part 2 exercises (main workout)
    for (let i = 0; i < program.part2.exercises.length; i++) {
      const ex = program.part2.exercises[i];
      await db.insert(workoutContentExercises).values({
        programContentId,
        sectionType: 'part2',
        orderNum: ex.num || i + 1,
        name: ex.name,
        reps: ex.reps,
        url: ex.url || null,
      });
    }
    
    console.log(`  Inserted ${program.part1.exercises.length} breathing exercises and ${program.part2.exercises.length} main exercises`);
  }
  
  console.log("\nWorkout content seed complete!");
}

// Run the seed
seedWorkoutContent()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
