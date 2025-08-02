# Nhost Free Tier Deployment Guide

## 🆓 Free Tier Optimized Configuration

Your BuzzConnect project has been configured specifically for **Nhost's Free Tier**. This ensures you won't exceed any limits and can deploy without charges.

## 📊 Free Tier Limits

| Resource | Free Tier Limit | Your Configuration |
|----------|----------------|-------------------|
| **Database Storage** | 1 GB | ✅ Optimized |
| **File Storage** | 1 GB | ✅ Optimized |
| **Network Egress** | 5 GB/month | ✅ Monitored |
| **Compute Resources** | Shared CPU | ✅ Minimal (62 mCPU, 128MB RAM) |
| **Functions** | 10 included | ✅ Within limit |
| **Execution Time** | 1 GB-hours | ✅ Optimized |
| **Projects** | 1 active | ✅ Single project |
| **Inactivity** | Paused after 1 week | ⚠️ Keep active |

## 🚀 Quick Start for Free Tier

### 1. Create Free Nhost Account
1. Go to [app.nhost.io](https://app.nhost.io)
2. Sign up for a **free account**
3. Create your **first project** (you get 1 free project)

### 2. Environment Variables (Minimal Setup)
In your Nhost dashboard, set only these **required** variables:

```bash
# Required for free tier
NHOST_SUBDOMAIN=your-project-subdomain
NHOST_REGION=your-project-region
AUTH_CLIENT_URL=https://your-project-subdomain.nhost.app

# Optional (Nhost will generate if not provided)
HASURA_GRAPHQL_ADMIN_SECRET=auto-generated
NHOST_WEBHOOK_SECRET=auto-generated
GRAFANA_ADMIN_PASSWORD=auto-generated
```

### 3. Deploy
1. Connect your GitHub repository
2. Nhost will automatically use the optimized `nhost.toml`
3. Your app will deploy with minimal resources

## 💡 Free Tier Best Practices

### ✅ Do's
- **Keep your project active** - Use it at least once a week to prevent auto-pause
- **Monitor storage usage** - Stay under 1 GB database + 1 GB files
- **Optimize images** - Compress images before uploading
- **Use efficient queries** - Minimize database calls
- **Cache data** - Use React state/localStorage for temporary data

### ❌ Don'ts
- **Don't upload large files** - Keep files small to stay under 1 GB limit
- **Don't create multiple projects** - Free tier allows only 1 active project
- **Don't use heavy compute** - Stick to lightweight operations
- **Don't ignore inactivity** - Project pauses after 1 week of no use

## 📈 Monitoring Usage

### Database Storage
```sql
-- Check database size (run in Hasura console)
SELECT pg_size_pretty(pg_database_size('postgres')) as database_size;
```

### File Storage
- Monitor in Nhost dashboard under **Storage** tab
- Keep total files under 1 GB

### Network Egress
- Monitor in Nhost dashboard under **Usage** tab
- 5 GB/month limit includes API calls, file downloads, etc.

## 🔄 Keeping Project Active

To prevent your project from being paused:

1. **Set up a simple health check** (optional):
   ```javascript
   // Add to your app - pings every few days
   setInterval(() => {
     fetch('/api/health').catch(() => {});
   }, 1000 * 60 * 60 * 24 * 3); // Every 3 days
   ```

2. **Regular usage**: Simply use your app once a week
3. **Automated pings**: Set up a simple uptime monitor (like UptimeRobot free tier)

## 🚨 What Happens If You Exceed Limits?

### Storage Limits (1 GB each)
- **Database**: New writes will fail
- **Files**: Upload will be rejected
- **Solution**: Delete old data or upgrade to Pro plan

### Network Egress (5 GB/month)
- **Effect**: Additional usage charged at $0.10/GB
- **Solution**: Optimize API calls or upgrade plan

### Inactivity (1 week)
- **Effect**: Project automatically paused
- **Solution**: Visit your app to reactivate (takes ~30 seconds)

## 💰 When to Upgrade

Consider upgrading to **Pro plan ($25/month)** when you need:

- More than 1 GB database storage
- More than 1 GB file storage  
- More than 5 GB monthly egress
- Automated backups
- Point-in-time recovery
- Multiple projects
- Email support

## 🛠️ Optimizations for Free Tier

### Database Optimization
```sql
-- Regular cleanup (run monthly)
DELETE FROM old_sessions WHERE created_at < NOW() - INTERVAL '30 days';
VACUUM ANALYZE;
```

### File Storage Optimization
- Compress images before upload
- Use WebP format for images
- Delete unused files regularly
- Implement file size limits in your app

### Code Optimization
```javascript
// Efficient data fetching
const { data } = useQuery(GET_POSTS, {
  variables: { limit: 10 }, // Limit results
  fetchPolicy: 'cache-first' // Use cache when possible
});
```

## 📞 Support for Free Tier

- **Community Support**: [Nhost Discord](https://discord.gg/nhost)
- **Documentation**: [docs.nhost.io](https://docs.nhost.io)
- **GitHub Issues**: [github.com/nhost/nhost](https://github.com/nhost/nhost)

## 🎯 Free Tier Success Tips

1. **Start small** - Build MVP first, optimize later
2. **Monitor regularly** - Check usage weekly
3. **Plan for growth** - Know when to upgrade
4. **Use efficiently** - Optimize queries and storage
5. **Stay active** - Use your app regularly

---

**Ready to deploy?** Your configuration is optimized for free tier success! 🚀
