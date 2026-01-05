# Deployment Guide - GitHub & Vercel

## 🚀 Deployment Checklist

### Prerequisites
- ✅ Application builds successfully (`npm run build`)
- ✅ All features tested locally
- ✅ Environment variables documented
- 🔄 GitHub account ready
- 🔄 Vercel account ready

## Step 1: Prepare for Deployment

### 1.1 Verify .gitignore

Ensure your `.gitignore` file includes:

```
# Dependencies
node_modules/
package-lock.json

# Next.js
.next/
out/
build/
dist/

# Environment Variables (CRITICAL - DO NOT COMMIT)
.env
.env.local
.env.production.local
.env.development.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Agent folder (optional, contains documentation)
.agent/

# Scripts (optional, keep locally)
scripts/*.js
```

### 1.2 Document Environment Variables

Create a `.env.example` file (safe to commit):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (if using AI features)
OPENAI_API_KEY=your_openai_api_key

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket

# Other configurations
NODE_ENV=production
```

## Step 2: Initialize Git Repository

### 2.1 Check if Git is initialized

```bash
git status
```

If not initialized:

```bash
git init
```

### 2.2 Add all files

```bash
git add .
```

### 2.3 Create initial commit

```bash
git commit -m "Initial commit - Pawpaths booking application"
```

## Step 3: Push to GitHub

### 3.1 Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "+" → "New repository"
3. Repository name: `pawpaths-booking` (or your choice)
4. Description: "Pawpaths Pet Relocation Booking System"
5. Choose: **Private** (recommended for production apps)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create repository"

### 3.2 Connect Local Repository to GitHub

Copy the commands from GitHub, or use:

```bash
git remote add origin https://github.com/YOUR_USERNAME/pawpaths-booking.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### 3.3 Verify Push

```bash
git log --oneline
git remote -v
```

Refresh your GitHub repository page to see the code.

## Step 4: Deploy to Vercel

### 4.1 Option A: Deploy via Vercel Website (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"
4. Click "Add New..." → "Project"
5. Import your GitHub repository: `pawpaths-booking`
6. Configure Project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (keep default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

### 4.2 Option B: Deploy via Vercel CLI

Install Vercel CLI:
```bash
npm install -g vercel
```

Login:
```bash
vercel login
```

Deploy:
```bash
vercel
```

Follow the prompts and confirm settings.

## Step 5: Configure Environment Variables in Vercel

### 5.1 Navigate to Project Settings

1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar

### 5.2 Add Each Environment Variable

Add these variables **one by one**:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Service Role Key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g., https://yourapp.vercel.app) | Production |
| `OPENAI_API_KEY` | Your OpenAI key | Production, Preview, Development |
| `AWS_ACCESS_KEY_ID` | Your AWS key | Production, Preview, Development |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret | Production, Preview, Development |
| `AWS_REGION` | Your AWS region | Production, Preview, Development |
| `AWS_S3_BUCKET` | Your S3 bucket name | Production, Preview, Development |

**Important**: Select which environments each variable applies to:
- **Production**: Live site
- **Preview**: Pull request previews
- **Development**: Local development (optional)

### 5.3 Redeploy After Adding Variables

After adding all environment variables:

1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"

Or push a new commit:
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

## Step 6: Configure Supabase for Production

### 6.1 Update Supabase URL Redirects

1. Go to Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel URL to:
   - **Site URL**: `https://yourapp.vercel.app`
   - **Redirect URLs**: Add:
     - `https://yourapp.vercel.app/auth/callback`
     - `https://yourapp.vercel.app/login`
     - `https://yourapp.vercel.app`

### 6.2 Update CORS Settings (if needed)

1. Go to Settings → API
2. Add Vercel URL to allowed origins

## Step 7: Post-Deployment Verification

### 7.1 Check Deployment Status

1. Vercel will show deployment progress
2. Wait for "Ready" status
3. Click "Visit" to view live site

### 7.2 Test Critical Features

- [ ] Can access login page
- [ ] Can login with credentials
- [ ] Admin dashboard loads
- [ ] Users page displays correctly
- [ ] Can view/edit users
- [ ] Avatars display correctly
- [ ] Can logout successfully
- [ ] Database operations work
- [ ] File uploads work (if applicable)

### 7.3 Monitor Logs

Vercel Dashboard → Your Project → Logs

Watch for:
- Build errors
- Runtime errors
- Database connection issues
- Environment variable issues

## Step 8: Set Up Custom Domain (Optional)

### 8.1 Add Domain in Vercel

1. Go to project Settings → Domains
2. Click "Add"
3. Enter your domain: `yourdomain.com`
4. Follow DNS configuration instructions

### 8.2 Update DNS Records

Add these records to your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 8.3 Update Environment Variables

Change `NEXT_PUBLIC_APP_URL` to your custom domain:
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Update Supabase redirect URLs to use custom domain.

## Step 9: Enable Automatic Deployments

Vercel automatically deploys on every push to `main`:

### 9.1 Production Deployment
- Every push to `main` branch → Production deployment

### 9.2 Preview Deployments
- Every pull request → Preview deployment
- Unique URL for each PR

### 9.3 Configure Branch Deployments

Vercel Settings → Git → Configure:
- Production Branch: `main`
- Preview Branches: Enable for all branches

## Step 10: Security Best Practices

### ✅ Security Checklist

- [ ] All secrets in Vercel Environment Variables (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] No API keys committed to Git
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CORS configured correctly
- [ ] Service role key only in server environment
- [ ] Regular dependency updates

### 10.1 Review Git History

Check no secrets were committed:
```bash
git log --all --full-history --source -- .env.local
```

If secrets found, consider:
1. Rotating all exposed credentials
2. Force-push to remove from history (destructive)
3. Or make repository private

### 10.2 Enable Vercel Security Features

1. **Password Protection**: Settings → Security → Password Protection (for staging)
2. **IP Allowlist**: Restrict access by IP (enterprise)
3. **Authentication**: Configure auth provider

## Troubleshooting Common Issues

### Issue: Build Fails

**Check:**
- Package.json dependencies correct
- All imports valid
- TypeScript errors resolved
- Run `npm run build` locally first

**Solution:**
```bash
npm run build
# Fix any errors shown
git add .
git commit -m "Fix build errors"
git push
```

### Issue: 500 Internal Server Error

**Check:**
- Environment variables set correctly
- Database connection working
- Check Vercel logs for specific error

**Solution:**
1. Vercel Dashboard → Logs
2. Find error message
3. Fix issue
4. Redeploy

### Issue: Database Connection Failed

**Check:**
- `NEXT_PUBLIC_SUPABASE_URL` correct
- `SUPABASE_SERVICE_ROLE_KEY` correct
- Supabase project active
- No network restrictions

**Solution:**
1. Verify env vars in Vercel
2. Test connection locally with same vars
3. Check Supabase project status

### Issue: Redirects Not Working

**Check:**
- Supabase redirect URLs include Vercel URL
- `NEXT_PUBLIC_APP_URL` matches deployment URL

**Solution:**
1. Update Supabase auth settings
2. Update environment variable
3. Redeploy

## Maintenance & Updates

### Regular Updates

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically deploy.

### Rollback Deployment

1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Environment Variable Updates

1. Vercel Settings → Environment Variables
2. Edit variable
3. Save
4. Redeploy

## Summary: Quick Commands

### Initial Setup
```bash
# Initialize and commit
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/pawpaths-booking.git
git branch -M main
git push -u origin main
```

### Regular Updates
```bash
git add .
git commit -m "Your changes"
git push
```

### Force Redeploy
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

## Success Metrics

After deployment, you should have:

✅ Application live on Vercel URL
✅ Automatic deployments on push
✅ Environment variables configured
✅ Database connected
✅ All features working
✅ HTTPS enabled
✅ Custom domain (optional)
✅ Monitoring in place

## Next Steps After Deployment

1. **Monitor**: Set up error tracking (Sentry, LogRocket)
2. **Analytics**: Add Google Analytics or Plausible
3. **Performance**: Monitor Core Web Vitals in Vercel
4. **Backup**: Regular database backups
5. **Documentation**: Update README with deployment info
6. **Team**: Add collaborators to Vercel project
7. **CI/CD**: Set up automated tests

---

**Need Help?**
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs

**Support:**
- Vercel Support: https://vercel.com/support
- GitHub Issues: Your repository issues tab
- Discord: Vercel/Next.js community
