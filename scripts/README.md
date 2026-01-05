# User Management Scripts

This folder contains scripts for managing users in the Pawpaths application.

## Available Scripts

### 1. Create Hashif User
**File**: `create-hashif-user.js`

Creates the super admin user Hashif Haneef with predefined credentials.

```bash
npm run create-hashif
```

**Details**:
- Email: hashif@pawpathsae.com
- Password: ppadmin
- Role: super_admin
- Avatar: Pre-configured Supabase storage URL

### 2. Verify Hashif User
**File**: `verify-hashif-user.js`

Verifies that the Hashif user was created successfully.

```bash
node scripts/verify-hashif-user.js
```

### 3. Create User Template
**File**: `create-user-template.js`

Generic template for creating new users. Copy and modify to create additional users.

**Usage**:
1. Copy the template:
   ```bash
   cp scripts/create-user-template.js scripts/create-new-user.js
   ```

2. Edit the `userData` object:
   ```javascript
   const userData = {
       firstName: 'Jane',
       lastName: 'Smith',
       email: 'jane.smith@example.com',
       password: 'temppass123',
       role: 'staff',
       avatarUrl: 'https://...' // Optional
   };
   ```

3. Run the script:
   ```bash
   node scripts/create-new-user.js
   ```

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `super_admin` | Super Administrator | Full system access, all features |
| `admin` | Administrator | Administrative access, user management |
| `staff` | Staff Member | Staff features, limited admin access |
| `customer` | Customer | Basic customer access |

## Avatar URLs

To use a custom avatar:

1. Upload image to Supabase Storage:
   - Bucket: `avatars`
   - Folder: `users/`
   - Make it public

2. Get the public URL:
   ```
   https://<project-id>.supabase.co/storage/v1/object/public/avatars/users/<filename>
   ```

3. Use this URL in the `avatarUrl` field

## Requirements

### Environment Variables

Ensure `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Permissions

Scripts use the **Service Role Key** which bypasses Row Level Security (RLS). This is necessary for user creation.

## Script Features

All user creation scripts include:

✅ **Duplicate Detection**: Checks if user already exists
✅ **Email Confirmation**: Auto-confirms email for immediate access
✅ **Profile Creation**: Creates both auth and profile records
✅ **Role Assignment**: Sets appropriate role permissions
✅ **Avatar Support**: Optional avatar URL configuration
✅ **Error Handling**: Graceful error messages and rollback
✅ **Verification**: Confirms successful creation with details

## Common Tasks

### Create a Super Admin
```javascript
const userData = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'secure_password',
    role: 'super_admin',
    avatarUrl: null
};
```

### Create a Staff Member
```javascript
const userData = {
    firstName: 'Staff',
    lastName: 'Member',
    email: 'staff@example.com',
    password: 'temp123',
    role: 'staff',
    avatarUrl: 'https://...'
};
```

### Create a Customer
```javascript
const userData = {
    firstName: 'John',
    lastName: 'Customer',
    email: 'customer@example.com',
    password: 'welcome123',
    role: 'customer',
    avatarUrl: null
};
```

## Database Tables

### auth.users
Managed by Supabase Auth:
- Authentication credentials
- Email confirmation status
- User metadata

### public.profiles
Custom profile data:
- `id` (UUID, references auth.users)
- `full_name` (TEXT)
- `email` (TEXT)
- `role` (TEXT)
- `avatar_url` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Troubleshooting

### Error: "User already exists"
The email is already in use. Either:
- Use a different email
- Delete the existing user first
- Update the existing user manually

### Error: "Missing environment variables"
Check that `.env.local` exists and contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Failed to create auth user"
Possible causes:
- Invalid email format
- Password too weak (min 6 characters)
- Supabase service unavailable
- Invalid service role key

### Error: "Failed to update profile"
Possible causes:
- Profile table doesn't exist
- Invalid role value
- RLS policies blocking (shouldn't happen with service role)

## Security Notes

1. **Service Role Key**: Keep this secret! It bypasses all security rules.
2. **Temporary Passwords**: Always inform users to change passwords on first login.
3. **Email Confirmation**: Scripts auto-confirm emails. In production, consider manual confirmation.
4. **Role Assignment**: Be cautious with super_admin role - only assign to trusted users.

## Best Practices

1. ✅ Use strong, unique passwords
2. ✅ Use descriptive email addresses
3. ✅ Set appropriate roles based on user needs
4. ✅ Store avatar images in Supabase Storage
5. ✅ Document all created users
6. ✅ Delete scripts after production deployment

## Example Output

```
🚀 Creating user: Hashif Haneef
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Step 1: Checking if user already exists...
✓ User does not exist, creating new user...

📋 Step 2: Creating user in Supabase Auth...
✅ Auth user created successfully!
   User ID: 7625f3d3-a602-4c52-ba38-cd3d1a167674

📋 Step 3: Updating profile with role and avatar...
✅ Profile updated successfully!

📋 Step 4: Verifying created user...
✅ User verified successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 USER CREATED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 User Details:
   ID: 7625f3d3-a602-4c52-ba38-cd3d1a167674
   Name: Hashif Haneef
   Email: hashif@pawpathsae.com
   Role: super_admin
   Avatar: https://...hashif.webp
   Created: 2026-01-05T23:18:09.181523+00:00

🔐 Login Credentials:
   Email: hashif@pawpathsae.com
   Password: ppadmin

✅ Script completed successfully!
```

## Future Enhancements

Potential improvements:
- Bulk user creation from CSV
- Password generator utility
- User deletion script
- User role update script
- Avatar upload automation
- Email notification for new users
