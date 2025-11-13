# Deploying Hackathon DAO to Netlify

Complete guide for deploying the Hackathon DAO web application to Netlify.

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Netlify account (free tier works perfectly)
- Git repository with this code

## Deployment Methods

### Method 1: Netlify CLI (Recommended for Testing)

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Login to Netlify

```bash
netlify login
```

#### 3. Initialize Netlify Site

```bash
netlify init
```

Follow the prompts:
- Create & configure a new site
- Team: Choose your team
- Site name: Choose a unique name (e.g., `hackathon-dao`)
- Build command: `npm install`
- Directory to deploy: `hackathon-dao/public`
- Functions directory: `netlify/functions`

#### 4. Deploy

```bash
netlify deploy --prod
```

Your site will be live at: `https://your-site-name.netlify.app`

### Method 2: Git-Based Deployment (Recommended for Production)

#### 1. Push Code to GitHub

```bash
git push origin main
```

#### 2. Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Configure build settings:

**Build Settings:**
- Base directory: (leave empty)
- Build command: `npm install`
- Publish directory: `hackathon-dao/public`
- Functions directory: `netlify/functions`

#### 3. Deploy

Click "Deploy site" - Netlify will automatically build and deploy!

#### 4. Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS according to Netlify instructions

## Configuration Files

### netlify.toml

Already configured in your repository:

```toml
[build]
  command = "npm install"
  functions = "netlify/functions"
  publish = "hackathon-dao/public"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### _redirects

Located at `hackathon-dao/public/_redirects`:

```
/api/*  /.netlify/functions/api/:splat  200
/*      /index.html                      200
```

## Architecture on Netlify

### Frontend
- Served as static files from `hackathon-dao/public/`
- HTML, CSS, JavaScript loaded directly
- Client-side routing via `_redirects`

### Backend
- Express API wrapped in serverless function
- Located at `netlify/functions/api.js`
- All `/api/*` routes handled by Lambda function
- AgentDB uses in-memory database (resets on cold start)

### Cold Starts
Serverless functions may have cold starts (1-2s first load). Subsequent requests are fast.

## Environment Variables (if needed)

If you add external services, configure environment variables:

1. Go to Site settings → Build & deploy → Environment
2. Add variables:
   - `DATABASE_URL` (if using external DB)
   - `API_KEY` (for external services)
   - etc.

Access in code:
```javascript
const apiKey = process.env.API_KEY;
```

## Database Considerations

### Current Setup (In-Memory)
- **Pros**: Fast, no setup required
- **Cons**: Data resets on each deployment or cold start

### Production Options

#### Option 1: Fauna DB (Recommended for Netlify)
```bash
npm install faunadb
```

Modify `netlify/functions/api.js` to use Fauna instead of in-memory DB.

#### Option 2: Supabase (PostgreSQL)
```bash
npm install @supabase/supabase-js
```

Use Supabase as backend database.

#### Option 3: MongoDB Atlas
```bash
npm install mongodb
```

Connect to MongoDB Atlas cluster.

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to Deploys tab
2. Click on failed deploy
3. View logs for errors

**Common issues:**
- Missing dependencies → Add to package.json
- Node version mismatch → Set in netlify.toml
- Path issues → Check file paths in imports

### Functions Not Working

**Test locally:**
```bash
netlify dev
```

This runs functions locally at http://localhost:8888

**Check function logs:**
1. Go to Functions tab
2. Click on `api` function
3. View real-time logs

### API Returns 404

**Verify redirects:**
- Check `_redirects` file exists
- Check `netlify.toml` redirect rules
- Clear cache: Site settings → Build & deploy → Clear cache and deploy site

### Data Not Persisting

This is expected with in-memory database. To persist data:
1. Add external database (see Database Considerations)
2. Update serverless function to use external DB
3. Redeploy

## Performance Optimization

### Enable Caching

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Optimize Images

Use Netlify's image optimization:

```toml
[images]
  remote_images = ["https://**/*"]
```

### Function Bundling

Already configured with esbuild for fast bundling:

```toml
[functions]
  node_bundler = "esbuild"
```

## Monitoring

### Netlify Analytics (Paid)
- Real user metrics
- Page views and unique visitors
- Top pages and sources

### Function Logs
- Free basic logging
- View in Functions tab
- Real-time log streaming

### External Monitoring

Free options:
- **UptimeRobot**: Uptime monitoring
- **Google Analytics**: User analytics
- **Sentry**: Error tracking

## Cost

### Netlify Free Tier Includes:
- ✅ 100 GB bandwidth/month
- ✅ 125,000 serverless function requests/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Form handling
- ✅ Identity management

**This is perfect for:**
- Personal projects
- Demos and prototypes
- Small hackathons (< 1000 users)

### Upgrading

If you exceed limits:
- **Pro**: $19/month (1TB bandwidth, unlimited builds)
- **Business**: $99/month (team features, advanced analytics)

## Security

### Best Practices

1. **Enable HTTPS**: Automatic on Netlify
2. **Add authentication**: Use Netlify Identity or Auth0
3. **Rate limiting**: Add to serverless functions
4. **Input validation**: Already implemented in API
5. **CORS**: Configure in netlify.toml

### Content Security Policy

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Continuous Deployment

### Automatic Deployments

Once connected to Git:
1. Push to main branch → Production deploy
2. Push to other branches → Preview deploy
3. Pull requests → Deploy previews

### Deploy Contexts

Configure different settings per branch:

```toml
[context.production]
  command = "npm run build:prod"

[context.deploy-preview]
  command = "npm run build:preview"

[context.branch-deploy]
  command = "npm run build:dev"
```

## Testing Before Production

### Preview Deployments

Every pull request gets a preview URL:
```
https://deploy-preview-123--your-site.netlify.app
```

### Branch Deployments

Deploy specific branches:
```bash
netlify deploy --alias=feature-branch
```

Access at:
```
https://feature-branch--your-site.netlify.app
```

## Post-Deployment

### 1. Test All Features
- ✓ Dashboard loads
- ✓ Teams creation works
- ✓ Members registration works
- ✓ Contributions tracking works
- ✓ Voting works
- ✓ API responds correctly

### 2. Monitor Performance
- Check function execution times
- Monitor bandwidth usage
- Watch error rates

### 3. Share Your Site!
```
https://your-site-name.netlify.app
```

## Example Deployment Commands

### Quick Deploy (Draft)
```bash
netlify deploy
```

### Production Deploy
```bash
netlify deploy --prod
```

### Open Deployed Site
```bash
netlify open:site
```

### View Function Logs
```bash
netlify functions:log api
```

### Run Locally
```bash
netlify dev
```

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com
- **Netlify Status**: https://www.netlifystatus.com

## Next Steps After Deployment

1. **Add Analytics**: Track user behavior
2. **Add Authentication**: Protect routes
3. **Add Database**: Persist data
4. **Custom Domain**: Professional URL
5. **SSL Certificate**: Automatic HTTPS
6. **Email Notifications**: Alert on deploys
7. **Webhooks**: Trigger external actions

## Rollback

If deployment breaks production:

```bash
netlify rollback
```

Or in dashboard:
1. Go to Deploys
2. Find working deploy
3. Click "Publish deploy"

## Conclusion

Your Hackathon DAO is now deployed globally on Netlify's CDN!

Features:
- ✅ Lightning-fast loading
- ✅ Auto-scaling serverless functions
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Continuous deployment
- ✅ Free hosting!

Enjoy your deployed app! 🚀
