# Deployment Checklist for Replit Production

## Required Environment Variables

Add these to Replit Secrets (🔒 lock icon):

### Essential
- `APP_URL` = `https://app.strongerwithzoe.com`
- `DATABASE_URL` = (your Neon PostgreSQL connection string)
- `SESSION_SECRET` = (your session secret)

### Email
- `RESEND_API_KEY` = `re_emqDfZDf_P2i1undgvkBEmx9djGwW5Zza`

### AI Features (OpenAI)
- `OPENAI_API_KEY` = (your OpenAI API key - get from https://platform.openai.com/api-keys)

### Optional
- `CLOUDINARY_CLOUD_NAME` = (if using image uploads)
- `CLOUDINARY_API_KEY` = (if using image uploads)
- `CLOUDINARY_API_SECRET` = (if using image uploads)

## Deployment Steps

When deploying new code to Replit:

```bash
# 1. Pull latest code
git fetch origin
git reset --hard origin/main

# 2. Install dependencies
npm install

# 3. Restart the server
# Click Stop button, then Run button in Replit
```

## Features That Need API Keys

| Feature | API Key Required | Where Used |
|---------|-----------------|------------|
| Magic link emails | `RESEND_API_KEY` | Intake form requests, welcome emails |
| AI coach remarks | `OPENAI_API_KEY` | "Generate with AI" button in admin panel |
| AI workout generation | `OPENAI_API_KEY` | Plan Builder wizard |
| AI nutrition plans | `OPENAI_API_KEY` | Nutrition plan generation |

## Current AI Provider: OpenAI GPT-4o

The app currently uses **OpenAI GPT-4o** for all AI features because:
- Reliable and widely available
- Proven model performance
- Cost-effective at ~$0.0075 per generation

**Cost per month (estimated):**
- 50 coach remark generations: ~$0.38
- 200 workout plan generations: ~$1.50
- Total: ~$2/month for typical usage

## Troubleshooting

### "Generate with AI" shows error
1. Check that `OPENAI_API_KEY` is in Replit Secrets
2. Verify the key is valid at https://platform.openai.com/api-keys
3. Check Replit console logs for detailed error message

### Magic links show 404
1. Ensure latest code is pulled (`git reset --hard origin/main`)
2. Restart Replit server
3. Check that `APP_URL` matches your production domain

### Emails not sending
1. Verify `RESEND_API_KEY` is set in Secrets
2. Check that domain is verified in Resend dashboard
3. Check Replit logs for email send errors

## Version Info

- Last updated: 2024
- AI Provider: OpenAI (GPT-4o)
- Email Provider: Resend
- Database: Neon PostgreSQL
- Hosting: Replit
