# 🔧 Hasura Timeout Troubleshooting Guide

## ❌ Current Issue

Auth service is failing to apply metadata to Hasura due to timeout:
```
failed to apply hasura metadata: problem adding metadata for table auth.provider_requests: 
Post "http://hasura-service:8080/v1/metadata": context deadline exceeded (Client.Timeout exceeded while awaiting headers)
```

## 🔍 Root Cause Analysis

This error typically occurs when:

1. **Hasura is slow to start** - Taking longer than expected to be ready
2. **Missing secrets** - Hasura can't start properly without required secrets
3. **Database connection issues** - Postgres not ready when Hasura tries to connect
4. **Free tier resource limits** - Shared resources causing slower startup
5. **Network connectivity** - Internal service communication problems

## ✅ Step-by-Step Solutions

### 1. **Set Required Secrets (Most Critical)**

The most common cause is missing secrets. Hasura needs these to start properly:

```bash
# Generate all secrets
npm run generate-secrets

# Set in Nhost Dashboard (Settings → Environment Variables):
HASURA_GRAPHQL_ADMIN_SECRET=<generated-secret>
NHOST_WEBHOOK_SECRET=<generated-secret>
HASURA_GRAPHQL_JWT_SECRET=<generated-secret>
AUTH_CLIENT_URL=https://your-subdomain.nhost.app
GRAFANA_ADMIN_PASSWORD=<your-password>
```

### 2. **Wait for Complete Startup**

Services start in sequence and can take time:
- **0-60s**: Postgres starts
- **60-120s**: Hasura starts and connects to Postgres
- **120-180s**: Auth starts and applies metadata to Hasura
- **180s+**: All services ready

**Be patient** - free tier shared resources can be slower.

### 3. **Check Service Startup Order**

Monitor logs for this sequence:
```
✅ Postgres: Starting... Ready
✅ Hasura: Starting... Connecting to Postgres... Ready
✅ Auth: Starting... Connecting to Hasura... Applying metadata...
```

If Auth tries to connect before Hasura is ready, you'll get timeout errors.

### 4. **Verify Hasura Configuration**

Ensure Hasura has minimal, working configuration:
```toml
[hasura]
version = 'v2.46.0-ce'
adminSecret = '{{ secrets.HASURA_GRAPHQL_ADMIN_SECRET }}'
webhookSecret = '{{ secrets.NHOST_WEBHOOK_SECRET }}'

[[hasura.jwtSecrets]]
type = 'HS256'
key = '{{ secrets.HASURA_GRAPHQL_JWT_SECRET }}'

[hasura.settings]
corsDomain = ['*']
enableConsole = true
```

## 🚀 Immediate Actions

### Action 1: Set All Secrets
1. **Generate**: `npm run generate-secrets`
2. **Copy output** to Nhost Dashboard
3. **Set AUTH_CLIENT_URL** to your actual app URL
4. **Redeploy** after setting secrets

### Action 2: Monitor Deployment
1. **Watch logs** for service startup sequence
2. **Wait patiently** - can take 3-5 minutes on free tier
3. **Don't restart** during startup process

### Action 3: Check for Success
Look for these indicators:
```
✅ Hasura metadata applied successfully
✅ Auth service connected to Hasura
✅ All services ready
```

## 🔧 Advanced Troubleshooting

### If Timeout Persists:

1. **Check Nhost Status**: https://status.nhost.io
2. **Try minimal configuration** - Remove non-essential features temporarily
3. **Check free tier limits** - Ensure you haven't exceeded quotas
4. **Wait longer** - Free tier can be slower than expected

### Minimal Test Configuration:

If issues persist, try this ultra-minimal config:
```toml
[global]

[hasura]
version = 'v2.46.0-ce'
adminSecret = '{{ secrets.HASURA_GRAPHQL_ADMIN_SECRET }}'

[auth]
version = '0.41.0'

[postgres]
version = '14.18-20250728-1'

[storage]
version = '0.7.2'
```

## 📊 Expected Timeline

**Normal free tier startup:**
- **0-2 min**: Postgres initialization
- **2-4 min**: Hasura startup and metadata loading
- **4-6 min**: Auth service connection and metadata application
- **6+ min**: All services ready

## 🎯 Success Indicators

You'll know it's working when:
- ✅ No more timeout errors in logs
- ✅ "Hasura metadata applied successfully" message
- ✅ Auth service shows "Connected to Hasura"
- ✅ All services show "Ready" status

## 📞 If All Else Fails

1. **Wait 10+ minutes** - Sometimes free tier is just slow
2. **Try redeployment** - Fresh deployment can resolve stuck states
3. **Check Nhost Discord**: https://discord.gg/nhost
4. **Contact Support**: Through Nhost dashboard

## 🎯 Current Status

- ✅ **Configuration**: Free tier compatible
- ✅ **Versions**: Latest recommended
- ⚠️ **Secrets**: Critical - must be set for Hasura to start properly
- ⚠️ **Patience**: Free tier startup can take 5-10 minutes

---

**Most Likely Fix**: Set all required secrets in Nhost Dashboard and wait patiently for startup!
