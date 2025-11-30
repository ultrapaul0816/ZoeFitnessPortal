import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { educationalTopics } from "@shared/schema";

const educationalContent = [
  {
    slug: "breathing-activation",
    orderNum: 1,
    title: "Breathing & Core Activation",
    videoUrl: null,
    videoLabel: null,
    imageKey: "anatomy",
    contentBlocks: [
      {
        type: "intro",
        text: "Learning how to breathe properly is essential to activating your deep core muscles safely.",
        emphasis: true
      },
      {
        type: "paragraph",
        text: "Breathwork becomes the foundation for every movement, helping reduce pressure on the abdominal wall and pelvic floor, preventing diastasis recti and pelvic floor dysfunction."
      },
      {
        type: "infoBox",
        title: "Understanding the \"Core Canister\"",
        intro: "Think of your core as a canister:",
        items: [
          "The top is your diaphragm (breathing muscle).",
          "The bottom is your pelvic floor.",
          "The sides and front are your deep abdominal muscles (transverse abdominis).",
          "The back is your spine and deep back muscles."
        ],
        imageKey: "anatomy",
        imageAlt: "Abdominal Muscle Anatomy showing Transverse Abdominis, Rectus Abdominis, Internal Oblique, and External Oblique",
        footer: "When you inhale and exhale properly, these parts work together to create pressure and stability. Mismanaged breathing (like shallow chest breathing or breath holding) can weaken this system."
      }
    ]
  },
  {
    slug: "360-breathing",
    orderNum: 2,
    title: "How To Breathe Properly: 360° Breathing",
    videoUrl: "https://youtu.be/B53GBfgME9E",
    videoLabel: "360 Degree Breathing",
    imageKey: "breathingDiagram",
    contentBlocks: [
      {
        type: "paragraph",
        text: "360° breathing is a deep, diaphragmatic breathing technique that encourages expansion in all directions — front, sides, and back — rather than just the chest or belly."
      },
      {
        type: "image",
        imageKey: "breathingDiagram",
        imageAlt: "Core Breath diagram showing inhale and exhale patterns with 360 degree expansion"
      },
      {
        type: "infoBox",
        title: "Steps to Practice 360° Breathing:",
        items: [
          "Sit upright or stand tall with a neutral pelvis (not tucked or overly arched).",
          "Place one hand on your ribs and the other on your belly.",
          "Inhale slowly through your nose: Feel your ribs expand outward and slightly back. The belly will naturally expand, but not only the belly — imagine your entire torso filling up with air.",
          "Exhale slowly through your mouth: Feel your ribs move back inward. Gently engage your deep core (your lower belly will naturally \"hug in\" slightly without forcefully sucking in)."
        ],
        ordered: true
      },
      {
        type: "quote",
        text: "Think \"expand in all directions on inhale, gently recoil on exhale.\""
      }
    ]
  },
  {
    slug: "tva-engagement",
    orderNum: 3,
    title: "Understanding Your Core & TVA Engagement",
    videoUrl: "https://www.youtube.com/watch?v=h7MxrsIGCxo",
    videoLabel: "Core & TVA Engagement",
    imageKey: "tvaSkeleton",
    contentBlocks: [
      {
        type: "paragraph",
        text: "Why \"pull your belly in\" isn't enough — and what to do instead. Before you can rebuild strength, you need to understand what you're actually connecting to. Your Transverse Abdominis (TVA) is your body's innermost abdominal muscle — often called the \"corset\" muscle — and it's the foundation of true core strength. Without proper TVA engagement, even \"core exercises\" can make things worse."
      },
      {
        type: "image",
        imageKey: "tvaSkeleton",
        imageAlt: "Skeleton showing TVA muscle anatomy and location"
      },
      {
        type: "infoBox",
        title: "What is the TVA?",
        icon: "✨",
        text: "The TRANSVERSE ABDOMINAL MUSCLE (TVA) wraps horizontally around your entire torso, from your ribs to your pelvis, like a wide supportive belt. It attaches at your spine and wraps forward toward your belly button, stabilizing your:",
        items: ["Spine", "Internal organs", "Lower back", "Pelvic floor", "Rib cage"]
      },
      {
        type: "infoBox",
        title: "Why It Matters:",
        icon: "✨",
        text: "The TVA helps hold you together from the inside. It supports posture, protects the spine, & helps reduce or prevent:",
        items: ["Diastasis recti", "Pelvic floor dysfunction", "Lower back pain", "Poor pressure management (bulging or doming of the abdomen)"]
      },
      {
        type: "infoBox",
        title: "How to engage your TVA:",
        icon: "✨",
        subtitle: "Here's how to feel your TVA working:",
        items: [
          "❖ Sit tall or lie down, maintaining a neutral spine.",
          "❖ Inhale through your nose: feel ribs & belly gently expand in all directions (360° breath).",
          "❖ Exhale slowly through your mouth with a soft \"sss\" or \"shhh\" — and imagine your ribs knitting in, your hip bones drawing slightly toward each other, & lower belly gently drawing back.",
          "❖ You should feel tension around your entire waistline, like a corset tightening."
        ],
        tips: [
          "❖ \"Wrapping your core from the back to the front\"",
          "❖ \"Zipping up your lower belly from pelvis to ribs\"",
          "❖ \"Lifting from your pelvic floor to your ribs as you exhale\""
        ]
      },
      {
        type: "infoBox",
        title: "Cue Tips:",
        variant: "primary",
        items: [
          "❖ Avoid hard sucking or hollowing - this shuts off the core.",
          "❖ Don't tuck your pelvis - keep a soft, natural curve in your lower back.",
          "❖ The movement should feel subtle but not superficial or grippy.",
          "❖ Over time, this will become your core foundation during movement, lifting, and breath."
        ]
      },
      {
        type: "infoBox",
        title: "Final Reminder:",
        variant: "primary",
        items: [
          "❖ You don't need to brace, clench, or crunch to train your core.",
          "❖ You need connection — and that begins with your breath and TVA."
        ]
      }
    ]
  },
  {
    slug: "core-breathing",
    orderNum: 4,
    title: "How To Engage Your Core With Breathing",
    videoUrl: null,
    videoLabel: null,
    imageKey: "breathCore",
    contentBlocks: [
      {
        type: "paragraph",
        text: "Once you master 360° breathing, you can learn to add gentle core activation — especially important before and during any exercise or lifting movements."
      },
      {
        type: "image",
        imageKey: "breathCore",
        imageAlt: "Your Breath and Your Core - anatomical diagram showing breathing and core connection"
      },
      {
        type: "infoBox",
        title: "Steps to Activate Core:",
        steps: [
          {
            title: "1. Start with your 360° breath",
            text: "Inhale into ribs, sides, and back. Exhale gently, allowing belly to draw in slightly."
          },
          {
            title: "2. Add core engagement on exhale",
            text: "As you exhale, imagine gently zipping up your pelvic floor and lower abs. Think \"draw in & up\" without clenching or sucking."
          },
          {
            title: "3. Maintain tension while breathing",
            text: "Continue to breathe while keeping that gentle core connection. Don't hold your breath!"
          },
          {
            title: "4. Practice while moving",
            text: "Try this during daily tasks: lifting your baby, standing up, or bending down. Exhale and engage before you move."
          }
        ]
      },
      {
        type: "warningBox",
        title: "Common Mistakes to Avoid:",
        variant: "yellow",
        items: [
          "Holding your breath (keep breathing throughout!)",
          "Over-gripping or clenching (keep it gentle and natural)",
          "Tucking your pelvis under (maintain neutral spine)",
          "Pushing out or bearing down (think \"lift\" not \"push\")"
        ]
      }
    ]
  },
  {
    slug: "core-compressions",
    orderNum: 5,
    title: "Core Compressions & How They Help You Heal",
    videoUrl: "https://youtu.be/h_S_tq0-Pv0",
    videoLabel: "Core Compressions Tutorial",
    imageKey: "coreCompressions",
    contentBlocks: [
      {
        type: "paragraph",
        text: "Core compressions are gentle, intentional exercises that help you actively bring your separated abdominal muscles back toward the midline. They're not crunches or sit-ups—they're controlled, mindful movements designed to rebuild strength and connection."
      },
      {
        type: "image",
        imageKey: "coreCompressions",
        imageAlt: "Core Compressions technique demonstration"
      },
      {
        type: "infoBox",
        title: "How Core Compressions Help:",
        items: [
          "Strengthen the linea alba (the connective tissue along your midline)",
          "Re-train deep core muscles to work together",
          "Reduce the gap between your rectus abdominis (the \"six-pack\" muscles)",
          "Improve function - better posture, less back pain, more stability"
        ]
      },
      {
        type: "tipBox",
        title: "When to Do Core Compressions:",
        variant: "blue",
        text: "Practice these daily—ideally before or during your workouts. They prime your body to move safely and correctly."
      }
    ]
  },
  {
    slug: "pelvic-floor",
    orderNum: 6,
    title: "Understanding the Pelvic Floor",
    videoUrl: "https://youtu.be/h7MxrsIGCxo",
    videoLabel: "Understanding Pelvic Floor",
    imageKey: "pelvicFloor",
    contentBlocks: [
      {
        type: "paragraph",
        text: "Your pelvic floor is a group of muscles that form a supportive \"hammock\" at the base of your pelvis. It plays a crucial role in core stability, bladder control, and overall strength."
      },
      {
        type: "image",
        imageKey: "pelvicFloor",
        imageAlt: "Pelvic Floor anatomy and location"
      },
      {
        type: "infoBox",
        title: "What Your Pelvic Floor Does:",
        items: [
          "Supports your bladder, uterus, and bowel",
          "Controls urination and bowel movements",
          "Assists in core stability and posture",
          "Plays a role in sexual function",
          "Works with your diaphragm and deep core during breathing"
        ]
      },
      {
        type: "warningBox",
        title: "Common Pelvic Floor Issues After Childbirth:",
        variant: "purple",
        items: [
          "Leaking urine when coughing, sneezing, or exercising (stress incontinence)",
          "Urgency or frequency in needing to urinate",
          "Pelvic organ prolapse (feeling of heaviness or bulging)",
          "Difficulty controlling bowel movements",
          "Pain or discomfort during intercourse"
        ]
      },
      {
        type: "tipBox",
        title: "How This Program Helps Your Pelvic Floor:",
        variant: "green",
        text: "By coordinating your breath with core engagement, you'll naturally support your pelvic floor without doing isolated \"Kegel\" exercises. This integrated approach helps restore function and prevent further issues.",
        footer: "If you're experiencing severe symptoms, consult a pelvic floor physiotherapist for personalized assessment and treatment."
      }
    ]
  },
  {
    slug: "warning-signs",
    orderNum: 7,
    title: "Warning Signs: Doming, Coning & When to Modify",
    videoUrl: "https://www.youtube.com/watch?v=IxnoXYCtnUw",
    videoLabel: "Understanding Doming & Coning",
    imageKey: "doming",
    contentBlocks: [
      {
        type: "intro",
        text: "Doming or coning happens when your abdominal wall bulges or pushes outward during movement—usually a sign that your deep core isn't fully engaged.",
        emphasis: true
      },
      {
        type: "paragraph",
        text: "This is your body's way of saying: \"I'm not ready for this movement yet.\" And that's okay! It's not a failure—it's feedback."
      },
      {
        type: "image",
        imageKey: "doming",
        imageAlt: "Doming and Coning visual demonstration"
      },
      {
        type: "warningBox",
        title: "When to Modify or Stop:",
        variant: "red",
        items: [
          "You see a visible bulge or ridge down the center of your belly during movement",
          "You feel pressure bearing down in your pelvic floor or abdomen",
          "You experience pain in your back, pelvis, or abdomen",
          "You leak urine during the exercise",
          "You feel unstable or wobbly in your core"
        ]
      },
      {
        type: "tipBox",
        title: "What to Do Instead:",
        variant: "green",
        items: [
          "Regress the movement - Make it easier or reduce range of motion",
          "Add more breath support - Exhale on the effort and engage your core before moving",
          "Slow down - Moving slowly gives your muscles time to respond",
          "Choose a different exercise - There's always an alternative that works better for your body right now",
          "Rest when needed - Recovery is part of the process"
        ]
      },
      {
        type: "quote",
        text: "Remember: Progress isn't about pushing through pain or pressure. It's about moving smarter, not harder."
      }
    ]
  }
];

export async function seedEducationalContent() {
  console.log("Seeding educational content...");
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const sql = neon(connectionString);
  const db = drizzle(sql);
  
  for (const topic of educationalContent) {
    try {
      await db.insert(educationalTopics).values({
        slug: topic.slug,
        orderNum: topic.orderNum,
        title: topic.title,
        videoUrl: topic.videoUrl,
        videoLabel: topic.videoLabel,
        imageKey: topic.imageKey,
        contentBlocks: topic.contentBlocks,
        isActive: true,
      }).onConflictDoUpdate({
        target: educationalTopics.slug,
        set: {
          title: topic.title,
          videoUrl: topic.videoUrl,
          videoLabel: topic.videoLabel,
          imageKey: topic.imageKey,
          contentBlocks: topic.contentBlocks,
          updatedAt: new Date(),
        }
      });
      console.log(`✓ Seeded topic: ${topic.title}`);
    } catch (error) {
      console.error(`✗ Error seeding topic ${topic.title}:`, error);
    }
  }
  
  console.log("Educational content seeding complete!");
}

seedEducationalContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
