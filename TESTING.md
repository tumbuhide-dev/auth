# 🧪 Testing Guide

## Quick Testing

### 1. Bash Script (Recommended)
\`\`\`bash
chmod +x test-api.sh
./test-api.sh
\`\`\`

### 2. Manual curl Commands

#### Health Check
\`\`\`bash
curl -X GET 'http://localhost:3000/api/health'
\`\`\`

#### Register
\`\`\`bash
curl -X POST 'http://localhost:3000/api/auth/register' \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-api-key-12345" \
  -d '{"email":"test@example.com", "password":"Password123", "repassword":"Password123"}'
\`\`\`

#### Login
\`\`\`bash
curl -X POST 'http://localhost:3000/api/auth/login' \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-api-key-12345" \
  -d '{"email":"test@example.com", "password":"Password123"}'
\`\`\`

#### Get User Info (replace YOUR_TOKEN)
\`\`\`bash
curl -X GET 'http://localhost:3000/api/auth/me' \
  -H "x-api-key: dev-api-key-12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

### 3. Postman Collection
Import `postman-collection.json` into Postman for GUI testing.

## Testing Checklist

- [ ] Health check returns success
- [ ] Register creates user
- [ ] Login returns token (after email verification)
- [ ] Get user info works with token
- [ ] Change password works
- [ ] Logout invalidates token
- [ ] Forgot password sends email
- [ ] Admin endpoints require proper permissions
- [ ] Rate limiting works
- [ ] API key validation works

## Common Issues

### Email Verification Required
If login fails with "Email belum diverifikasi":
1. Check Supabase Auth settings
2. Manually confirm user in Supabase dashboard
3. Or disable email confirmation for testing

### API Key Issues
- Make sure API key is in database: `dev-api-key-12345`
- Check `api_keys` table has the key
- Verify header: `x-api-key: dev-api-key-12345`

### Rate Limiting
- Development uses in-memory (resets on restart)
- Adjust limits in `lib/middleware/rate-limit.ts`
