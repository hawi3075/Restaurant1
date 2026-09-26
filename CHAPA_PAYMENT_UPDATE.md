# Chapa Payment Configuration Update

## Issue
Chapa test credentials expire quickly and have limited functionality, causing payment failures.

## Solution
Replace TEST credentials with LIVE/PRODUCTION credentials from your Chapa dashboard.

## Steps to Update

### 1. Get Live Credentials
- Visit [Chapa Dashboard](https://dashboard.chapa.co/)
- Log in to your account
- Navigate to **API Keys** section
- Copy your **LIVE** credentials (not test)

### 2. Update Server Environment (.env)
```env
# Replace these with your LIVE credentials:
CHAPA_SECRET_KEY=CHASECK_LIVE-your_actual_live_secret_key
CHAPA_PUBLIC_KEY=CHAPUBK_LIVE-your_actual_live_public_key
CHAPA_ENCRYPTION_KEY=your_actual_live_encryption_key
```

### 3. Update Client Environment (client/.env)
```env
# Replace with your LIVE secret key:
CHAPA_SECRET_KEY="CHASECK_LIVE-your_actual_live_secret_key"
```

### 4. Restart Services
```bash
# Restart server
cd server
npm restart

# Restart client
cd client
npm run dev
```

## Key Differences: TEST vs LIVE

| Feature | TEST | LIVE |
|---------|------|------|
| Expiry | Quick (hours/days) | Long-term |
| Transactions | Simulated | Real money |
| Limits | Low amounts | Full limits |
| Reliability | Limited | Production-ready |

## Current Status
- ❌ Currently using TEST credentials (will expire)
- ✅ Need to update to LIVE credentials for production

## Support
- [Chapa Documentation](https://developer.chapa.co/)
- [API Reference](https://developer.chapa.co/docs/api-reference)