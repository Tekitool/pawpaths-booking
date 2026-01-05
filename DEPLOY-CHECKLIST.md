# Deployment Checklist & Quick Start

## 🚀 Quick Deployment Steps

### 1. Initialize Git (if not already done)

```bash
git status
```

If not initialized:
```bash
git init
git add .
git commit -m "Initial commit - Pawpaths booking application"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `pawpaths-booking`
3. Make it **Private**
4. **DO NOT** check any initialization options
5. Click "Create repository"

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/pawpaths-booking.git
git branch -M main
git push -u origin main
```

### 4. Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `pawpaths-booking`
5. Keep all default settings
6. Click "Deploy"

### 5. Add Environment Variables in Vercel

Go to Vercel Project → Settings → Environment Variables

Add these (get values from your `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL (use your Vercel URL)
OPENAI_API_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET
```

### 6. Redeploy

After adding environment variables:
- Go to Deployments tab
- Click "..." on latest deployment → "Redeploy"

### 7. Update Supabase

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add Vercel URL to:
   - Site URL: `https://yourapp.vercel.app`
   - Redirect URLs: `https://yourapp.vercel.app/auth/callback`

## ✅ Verification

Test these after deployment:
- [ ] Can access the site
- [ ] Can login
- [ ] Admin dashboard works
- [ ] Users page loads
- [ ] Database operations work
- [ ] Avatars display
- [ ] Can logout

## 📚 Full Guide

See `DEPLOYMENT.md` for complete detailed instructions.

## 🆘 Quick Troubleshooting

**Build fails?**
```bash
npm run build
# Fix errors shown, then:
git add .
git commit -m "Fix build errors"
git push
```

**500 Error?**
- Check Vercel logs for specific error
- Verify environment variables are set
- Check database connection

**Can't login?**
- Update Supabase redirect URLs
- Check `NEXT_PUBLIC_APP_URL` is correct

## 🔄 Making Updates

Every time you make changes:
```bash
git add .
git commit -m "Describe your changes"
git push
```

Vercel will automatically deploy!

## Current Status

✅ Application builds successfully
✅ All features tested locally
🔄 Ready for deployment

## Users & Credentials

**Super Admins:**
- Hashif Haneef: hashif@pawpathsae.com / ppadmin
- System Admin: admin@pawpathsae.com / admin123

**Remember:** Change these passwords in production!
