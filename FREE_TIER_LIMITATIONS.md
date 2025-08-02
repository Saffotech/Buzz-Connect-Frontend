# 🆓 Nhost Free Tier Limitations & Fixes

## ❌ Issue: Custom Resources Not Allowed

**Error Message:**
```
Failed to update app configuration: graphql: hasura.resources: custom resources are only available in pro plan
```

## 🔍 Root Cause

The free tier **does not support** custom resource configurations. Any `[service.resources]` sections in `nhost.toml` will cause deployment failures.

## ✅ Solution Applied

**Removed all custom resource configurations:**

```toml
# ❌ Not allowed in free tier
[hasura.resources]
compute = { cpu = 62, memory = 128 }

[auth.resources]  
compute = { cpu = 62, memory = 128 }

[storage.resources]
compute = { cpu = 62, memory = 128 }
```

**✅ Free tier uses default shared resources automatically**

## 📊 Free Tier vs Pro Plan

| Feature | Free Tier | Pro Plan |
|---------|-----------|----------|
| **Custom CPU/Memory** | ❌ Not allowed | ✅ Configurable |
| **Shared Resources** | ✅ Default | ✅ Available |
| **Resource Scaling** | ❌ Fixed | ✅ Auto-scaling |
| **Dedicated Resources** | ❌ No | ✅ Available |

## 🎯 What Free Tier Provides

**Default Resource Allocation:**
- **Shared CPU**: Adequate for development and small apps
- **Shared Memory**: Sufficient for basic operations
- **Auto-scaling**: Limited but functional
- **Performance**: Good for MVP and testing

**Storage Limits (Configurable):**
```toml
# ✅ This IS allowed in free tier
[postgres.resources.storage]
capacity = 1  # 1 GB limit
```

## 🚀 Free Tier Best Practices

### ✅ Do's
- **Use default resources** - Let Nhost manage resource allocation
- **Optimize queries** - Efficient database operations
- **Cache data** - Reduce server load
- **Monitor usage** - Stay within limits

### ❌ Don'ts
- **Don't specify custom compute resources** - Will cause deployment failures
- **Don't expect dedicated resources** - Shared infrastructure only
- **Don't rely on high performance** - Optimize for efficiency

## 🔧 Configuration Guidelines

**✅ Free Tier Compatible Configuration:**
```toml
[global]

[hasura]
version = 'v2.46.0-ce'
adminSecret = '{{ secrets.HASURA_GRAPHQL_ADMIN_SECRET }}'
webhookSecret = '{{ secrets.NHOST_WEBHOOK_SECRET }}'
# No [hasura.resources] section

[auth]
version = '0.41.0'
# No [auth.resources] section

[postgres]
version = '14.18-20250728-1'
# Only storage capacity is configurable
[postgres.resources.storage]
capacity = 1

[storage]
version = '0.7.2'
# No [storage.resources] section
```

## 💰 When to Upgrade to Pro

Consider upgrading when you need:
- **Custom resource allocation**
- **Dedicated CPU/memory**
- **Higher performance**
- **Auto-scaling**
- **Production workloads**
- **SLA guarantees**

## 🎯 Current Status

- ✅ **Configuration**: Free tier compatible
- ✅ **Resources**: Using default shared resources
- ✅ **Storage**: 1GB limit configured
- ✅ **Deployment**: Should work without resource errors

## 📖 References

- **Nhost Pricing**: https://nhost.io/pricing
- **Free Tier Documentation**: https://docs.nhost.io/platform/pricing
- **Resource Management**: https://docs.nhost.io/platform/resources

---

**Key Takeaway**: Free tier uses default shared resources - no custom configuration needed or allowed!
