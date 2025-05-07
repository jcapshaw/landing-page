# Firebase to Supabase Migration

This project has been migrated from Firebase to Supabase for authentication and data storage.

## Setup Instructions

1. Create a Supabase account and project at [supabase.com](https://supabase.com)
2. Get your Supabase project credentials:
   - Project URL
   - Anon/Public key
   - Service Role key (for admin operations)
3. Create a `.env.local` file in the project root with the following variables:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Database Setup

You'll need to create the following tables in your Supabase database:

### daily_logs

This table stores daily log entries:

- id: uuid (primary key)
- created_at: timestamp with time zone
- date: date
- user_id: uuid (foreign key to auth.users)
- user_name: text
- location: text
- notes: text
- sales_count: integer
- deposit_count: integer
- test_drive_count: integer
- appointment_count: integer
- walk_in_count: integer
- call_count: integer

### Database Schema Migration

For other tables, you'll need to migrate your Firebase data to Supabase. Here's a general approach:

1. Export your data from Firebase (Firestore)
2. Transform the data to match Supabase's schema
3. Import the data into Supabase

## Authentication

Authentication has been migrated from Firebase Auth to Supabase Auth. The main changes are:

- User sign-up and sign-in now use Supabase Auth
- User metadata (including roles) is stored in Supabase Auth user metadata
- JWT tokens are now issued by Supabase

## File Storage

If your project uses Firebase Storage, you'll need to migrate your files to Supabase Storage:

1. Download all files from Firebase Storage
2. Create appropriate buckets in Supabase Storage
3. Upload the files to Supabase Storage
4. Update all file references in your code and database

## Environment Variables

Make sure to set the following environment variables in your deployment environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Code Changes

The following files have been updated to use Supabase:

- `lib/supabase.ts` - Supabase client initialization
- `lib/supabase-admin.ts` - Supabase admin client for server-side operations
- `lib/auth-utils.ts` - Authentication utilities
- `app/auth/components/AuthForm.tsx` - Authentication form
- `app/api/auth/session/route.ts` - Session API
- `app/components/LazyAuthProvider.tsx` - Authentication provider
- `app/daily-log/services/dailyLogService.ts` - Data service example

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)