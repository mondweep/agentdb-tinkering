# 🚀 Deploy to Netlify - Quick Start

Deploy your Hackathon DAO in 5 minutes!

## Option 1: One-Click Deploy (Easiest)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Click the button above
2. Connect your GitHub account
3. Choose repository
4. Click "Deploy site"
5. ✅ Done! Your site is live

## Option 2: Netlify CLI (Fastest)

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

Your site: `https://[random-name].netlify.app`

## Option 3: GitHub Integration (Best for Teams)

1. Push code to GitHub:
   ```bash
   git push origin main
   ```

2. Go to [Netlify](https://app.netlify.com)

3. Click "Add new site" → "Import an existing project"

4. Select your repo

5. Configure:
   - Build command: `npm install`
   - Publish directory: `hackathon-dao/public`
   - Functions directory: `netlify/functions`

6. Click "Deploy" ✅

## What You Get

✅ **Live URL**: `https://your-site.netlify.app`
✅ **Auto HTTPS**: Secure by default
✅ **Global CDN**: Fast worldwide
✅ **Auto Deploys**: Push to deploy
✅ **Free Hosting**: No credit card needed

## Verify Deployment

1. **Homepage**: `https://your-site.netlify.app`
2. **API Test**: `https://your-site.netlify.app/api/dao`
3. **Dashboard**: Should show teams and stats

## Customize

### Change Site Name

```bash
netlify sites:update --name my-hackathon-dao
```

Or in Netlify dashboard: Site settings → General → Site details

### Add Custom Domain

1. Site settings → Domain management
2. Add custom domain
3. Update DNS records
4. ✅ SSL auto-configured

## Troubleshooting

### Build Failed?
- Check Deploys tab for error logs
- Verify `package.json` has all dependencies

### Functions Not Working?
```bash
# Test locally first
netlify dev
# Open http://localhost:8888
```

### Need Help?
- Read [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for full guide
- Check [Netlify Docs](https://docs.netlify.com)

## Free Tier Limits

✅ 100 GB bandwidth/month
✅ 125K serverless requests/month
✅ 300 build minutes/month

**Perfect for:**
- Personal projects
- Demos
- Small hackathons (<1000 users)

## Post-Deploy Checklist

- [ ] Site loads correctly
- [ ] API endpoints work
- [ ] Teams can be created
- [ ] Contributions tracked
- [ ] Voting works
- [ ] Share your URL! 🎉

## Your URLs

After deployment, you'll have:

- **Production**: `https://your-site.netlify.app`
- **Preview**: `https://deploy-preview-[pr-number]--your-site.netlify.app`
- **Branch**: `https://[branch-name]--your-site.netlify.app`

## Next Steps

1. ✅ Deploy (you're here!)
2. 🎨 Customize branding
3. 🔐 Add authentication
4. 💾 Add database (optional)
5. 📊 Add analytics
6. 🌐 Custom domain

## Support

- **Full Guide**: [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
- **API Docs**: [hackathon-dao/API.md](./hackathon-dao/API.md)
- **Web UI**: [hackathon-dao/WEB_UI_README.md](./hackathon-dao/WEB_UI_README.md)

---

**Ready to deploy?** Run:
```bash
netlify deploy --prod
```

🎉 **That's it!** Your Hackathon DAO is live!
