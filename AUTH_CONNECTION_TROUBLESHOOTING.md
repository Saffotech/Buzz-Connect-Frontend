# 🔧 Auth Connection Troubleshooting Guide

## ❌ Current Issue

Auth service is failing to connect to Hasura:
```
http: proxy error: dial tcp [::1]:4001: connect: connection refused
```

## ✅ Fixes Applied

### 1. **Updated to Recommended Versions**
- **Auth**: `0.39.0-beta6` → `0.41.0` ✅
- **Postgres**: `14.6-20221215-1` → `14.18-20250728-1` ✅  
- **Storage**: `0.7.1` → `0.7.2` ✅

### 2. **Added Resource Constraints**
All services now have explicit resource limits for free tier:
```toml
[service.resources]
compute = [
  { cpu = 62, memory = 128 }
]
```

## 🔍 Remaining Issues to Check

### 1. **Missing Secrets (Most Likely Cause)**

The Auth service needs these secrets to start properly:

```bash
# Critical secrets that MUST be set in Nhost Dashboard
HASURA_GRAPHQL_ADMIN_SECRET=<generated-secret>
NHOST_WEBHOOK_SECRET=<generated-secret>
HASURA_GRAPHQL_JWT_SECRET=<generated-secret>
AUTH_CLIENT_URL=https://your-subdomain.nhost.app
GRAFANA_ADMIN_PASSWORD=<your-password>
```

**Generate secrets:**
```bash
npm run generate-secrets
```

### 2. **Service Startup Order**

Auth tries to connect to Hasura before Hasura is ready. This is normal during startup but should resolve once all services are running.

### 3. **Network Configuration**

The error `dial tcp [::1]:4001` suggests Auth is trying to connect to Hasura on IPv6 localhost port 4001.

## 🚀 Step-by-Step Fix

### Step 1: Set All Required Secrets

1. **Generate secrets**: `npm run generate-secrets`
2. **Go to Nhost Dashboard**: Settings → Environment Variables
3. **Add all 5 secrets** from the generator output
4. **Critical**: Set `AUTH_CLIENT_URL` to your actual app URL

### Step 2: Trigger New Deployment

1. **Push to GitHub** (already done with latest commit)
2. **Or manually trigger** deployment in Nhost dashboard
3. **Wait for all services** to start (can take 2-3 minutes)

### Step 3: Monitor Deployment Logs

Watch for these success indicators:
```
✅ Hasura: Starting...
✅ Hasura: Ready on port 4001
✅ Auth: Starting...
✅ Auth: Connected to Hasura
✅ Postgres: Ready
✅ Storage: Ready
```

## 🔧 Advanced Troubleshooting

### If Auth Still Fails to Connect:

1. **Check Hasura logs** for startup errors
2. **Verify secrets** are properly set and not empty
3. **Check resource limits** - free tier might be hitting limits
4. **Try minimal configuration** - temporarily disable non-essential features

### Minimal Test Configuration:

If issues persist, try this minimal nhost.toml:
```toml
[global]

[hasura]
version = 'v2.46.0-ce'
adminSecret = '{{ secrets.HASURA_GRAPHQL_ADMIN_SECRET }}'
webhookSecret = '{{ secrets.NHOST_WEBHOOK_SECRET }}'

[auth]
version = '0.41.0'

[postgres]
version = '14.18-20250728-1'

[storage]
version = '0.7.2'
```

## 📊 Expected Timeline

**Normal startup sequence:**
1. **0-30s**: Postgres starts
2. **30-60s**: Hasura starts and connects to Postgres
3. **60-90s**: Auth starts and connects to Hasura
4. **90-120s**: Storage starts
5. **120s+**: All services ready

## 🎯 Success Indicators

You'll know it's working when:
- ✅ No more "connection refused" errors
- ✅ Auth service shows "Connected to Hasura"
- ✅ All services show "Ready" status
- ✅ Your React app can authenticate users

## 📞 If All Else Fails

1. **Check Nhost Status**: https://status.nhost.io
2. **Nhost Discord**: https://discord.gg/nhost
3. **Create Support Ticket**: In Nhost dashboard
4. **Check Free Tier Limits**: Ensure you haven't exceeded quotas

---

**Current Status**: ✅ **Configuration updated** - Deploy with secrets to test fix!
