# Decisions Pending

**Purpose**: Track decisions that need to be made later during development  
**Last Updated**: 2025-12-08

---

## Decisions to be Made

| # | Track | Decision | Context | Options | Status |
|---|-------|----------|---------|---------|--------|
| 1 | Track D | Supabase Auth Rate Limiting | During testing, encountered rate limit errors ("For security purposes, you can only request this after X seconds"). Need to decide appropriate limits for production vs development. | **Option A**: Keep defaults (secure, but slower dev testing)<br>**Option B**: Loosen for dev (faster testing)<br>**Option C**: Disable email confirmation for dev | Pending |

---

## How to Configure (Reference)

### Supabase Auth Rate Limits

**Location**: Supabase Dashboard → Authentication → Rate Limits

| Setting | Default | Description |
|---------|---------|-------------|
| Rate limit for sending emails | 1 per 60 seconds | Signup confirmation, password reset |
| Rate limit for token requests | Varies | Sign in attempts |
| SMTP hard limit | 1 email/second | Cannot be changed (server-side) |

### To Loosen for Development

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Rate Limits**
3. Reduce "Minimum interval between emails" (e.g., 60s → 5s)
4. Increase "Max emails per hour" if needed

### Alternative: Disable Email Confirmation

1. **Authentication** → **Providers** → **Email**
2. Toggle off **"Confirm email"**
3. Users can sign in immediately without verification

---

## Decision Log

| # | Date | Decision | Made By | Notes |
|---|------|----------|---------|-------|
| - | - | - | - | - |
