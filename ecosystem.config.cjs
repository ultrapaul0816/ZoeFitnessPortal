module.exports = {
  apps: [
    {
      name: "zoe-fitness",                     // app name in pm2 list
      script: "npm",                           // we use npm as runner
      args: "start",                           // runs `npm start`
      cwd: "/home/ubuntu/ZoeFitnessPortal",    // project root
      interpreter: "none",                     // run directly, no node wrapping
      env: {
        NODE_ENV: "production",
        PORT: 3000,                            // adjust if your app uses another port
        DATABASE_URL: "postgresql://neondb_owner:npg_FWYlHU0w6ZxL@ep-wild-tooth-afmsc0rw.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"       // add other env vars here
      }
    }
  ]
};
