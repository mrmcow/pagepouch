# PageStash Authentication Testing Guide

## 🔧 **Setup Requirements**

### 1. Environment Variables
Create `/Users/michaelcouch/DEV/pagestash/apps/web/.env.local` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gwvsltgmjreructvbpzg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dnNsdGdtanJlcnVjdHZicHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MjY2OTksImV4cCI6MjA3MzMwMjY5OX0.hdq5nlxw5v-zRZ2ZwogvDGzDC3eGZ9u13W0KBfQqeHs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dnNsdGdtanJlcnVjdHZicHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzcyNjY5OSwiZXhwIjoyMDczMzAyNjk5fQ.RwD5IEWMfCNmik2ZMQG-G0wbdXGWsap3pR6uNHgPqJQ

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EXTENSION_ID=your_extension_id_when_loaded

# Development
NODE_ENV=development
```

### 2. Database Schema
Ensure the Supabase database has been set up with the schema from `docs/database-schema.sql`

## 🧪 **Testing Steps**

### Phase 1: Basic Authentication
1. **Start Development Server**
   ```bash
   cd /Users/michaelcouch/DEV/pagestash
   npm run dev
   ```

2. **Test Homepage**
   - Visit `http://localhost:3000`
   - Verify "Sign In" and "Start Free Trial" buttons work
   - Check that proper Chrome/Firefox logos display

3. **Test Sign Up Flow**
   - Click "Start Free Trial" 
   - Fill out registration form
   - Verify email validation works
   - Check password confirmation
   - Submit form and verify success message

4. **Test Email Confirmation**
   - Check your email for confirmation link
   - Click the confirmation link
   - Verify redirect to dashboard works

5. **Test Sign In Flow**
   - Go to `/auth/login`
   - Enter credentials
   - Verify successful login redirects to dashboard

### Phase 2: Dashboard Functionality
1. **Protected Route Testing**
   - Try accessing `/dashboard` without authentication
   - Verify redirect to login page
   - Sign in and verify access granted

2. **Dashboard UI Testing**
   - Verify user menu displays correct email
   - Test navigation between sections
   - Check responsive design on mobile

3. **Sign Out Testing**
   - Click user menu → Sign Out
   - Verify redirect to homepage
   - Try accessing dashboard again (should redirect to login)

### Phase 3: Error Handling
1. **Invalid Credentials**
   - Try signing in with wrong password
   - Verify error message displays

2. **Network Errors**
   - Test with network disconnected
   - Verify graceful error handling

3. **Expired Sessions**
   - Test session expiration handling
   - Verify automatic redirect to login

## 🐛 **Common Issues & Solutions**

### Issue: "Missing Supabase environment variables"
**Solution**: Ensure `.env.local` file exists in `apps/web/` directory

### Issue: "Module not found" errors
**Solution**: Run `npm install` in both root and `apps/web/`

### Issue: TypeScript errors
**Solution**: Run `npx tsc --noEmit` to check for type errors

### Issue: Supabase connection errors
**Solution**: Verify Supabase project is active and credentials are correct

## ✅ **Expected Results**

After successful testing, you should be able to:
- ✅ Register new accounts
- ✅ Confirm email addresses  
- ✅ Sign in with credentials
- ✅ Access protected dashboard
- ✅ Sign out properly
- ✅ Handle authentication errors gracefully

## 🔍 **Debugging Tips**

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed API requests
3. **Check Supabase Logs** in the Supabase dashboard
4. **Verify Environment Variables** are loaded correctly

## 📞 **Support**

If you encounter issues:
1. Check this guide first
2. Verify all setup requirements
3. Check browser console for errors
4. Review Supabase dashboard for authentication logs
