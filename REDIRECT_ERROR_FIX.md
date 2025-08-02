# 🔧 Fix: "redirectTo-not-allowed" Error

## ❌ Error Details

You're seeing this error:
```json
{
  "error": "redirectTo-not-allowed",
  "message": "The value of \"options.redirectTo\" is not allowed.",
  "status": 400
}
```

## 🔍 Root Cause

This error occurs because the redirect URL being used for authentication is not in the list of allowed URLs configured in your Nhost project.

## ✅ Solution: Set AUTH_CLIENT_URL Secret

### Step 1: Find Your App URL

Your Nhost app URL follows this pattern:
```
https://[PROJECT_SUBDOMAIN].nhost.app
```

**How to find it:**
1. Go to your Nhost project dashboard
2. Look for the app URL in the project overview
3. Or check the deployment logs for the URL

**Example URLs:**
- `https://buzzconnect-abc123.nhost.app`
- `https://myproject-xyz789.nhost.app`

### Step 2: Set AUTH_CLIENT_URL Secret

1. **Go to Nhost Dashboard**: [app.nhost.io](https://app.nhost.io)
2. **Select your project**
3. **Navigate to**: Settings → Environment Variables
4. **Add new environment variable**:
   ```
   Name: AUTH_CLIENT_URL
   Value: https://your-actual-subdomain.nhost.app
   ```

**Example:**
```
Name: AUTH_CLIENT_URL
Value: https://buzzconnect-abc123.nhost.app
```

### Step 3: Redeploy

After setting the AUTH_CLIENT_URL secret:
1. Trigger a new deployment (push to GitHub or manual deploy)
2. Wait for deployment to complete
3. Test authentication again

## 🎯 How This Fixes the Error

The `nhost.toml` configuration now uses:
```toml
[auth.redirections]
clientUrl = '{{ secrets.AUTH_CLIENT_URL }}'
allowedUrls = ['{{ secrets.AUTH_CLIENT_URL }}', '{{ secrets.AUTH_CLIENT_URL }}/dashboard', 'http://localhost:3000', 'http://localhost:3000/dashboard']
```

This means:
- ✅ Your app URL will be allowed for redirects
- ✅ Dashboard routes will be allowed
- ✅ Local development URLs are still allowed

## 🔧 Alternative: Temporary Fix

If you need a quick fix while finding your exact URL, you can temporarily set:
```
Name: AUTH_CLIENT_URL
Value: https://*.nhost.app
```

But this is less secure - use your exact URL when possible.

## 📊 Complete Secrets Checklist

For full functionality, ensure all these secrets are set:

```bash
✅ AUTH_CLIENT_URL=https://your-subdomain.nhost.app
⚠️ HASURA_GRAPHQL_ADMIN_SECRET=[generate with: openssl rand -base64 32]
⚠️ NHOST_WEBHOOK_SECRET=[generate with: openssl rand -base64 32]
⚠️ HASURA_GRAPHQL_JWT_SECRET=[generate with: openssl rand -base64 32]
⚠️ GRAFANA_ADMIN_PASSWORD=[any strong password]
```

## 🚀 Expected Result

After setting AUTH_CLIENT_URL, authentication should work without redirect errors:
- ✅ Sign up works
- ✅ Login works  
- ✅ Redirects work properly
- ✅ No more "redirectTo-not-allowed" errors

## 🔍 Troubleshooting

**If you still get redirect errors:**

1. **Check the exact URL**: Make sure AUTH_CLIENT_URL matches your deployed app URL exactly
2. **Include protocol**: Use `https://` not just the domain
3. **No trailing slash**: Use `https://app.nhost.app` not `https://app.nhost.app/`
4. **Redeploy**: Changes require a new deployment to take effect

**Common mistakes:**
- ❌ `http://` instead of `https://`
- ❌ Wrong subdomain
- ❌ Trailing slash in URL
- ❌ Not redeploying after setting secret

---

**Status**: ✅ **Ready to fix** - Set AUTH_CLIENT_URL secret and redeploy!
