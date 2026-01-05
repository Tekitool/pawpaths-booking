# User Edit Page Data Loading - Fix & Debug Guide

## Problem
When clicking the Edit button for a user, the Edit User page loads but the form fields are empty - user data is not being populated.

## Database Schema - Profiles Table

The `profiles` table in Supabase contains the following fields:
- `id` - User UUID (primary key, references auth.users)
- `full_name` - Full name of the user
- `email` - Email address
- `role` - User role (admin, staff, customer, etc.)
- `avatar_url` - URL to user's avatar image
- `created_at` - Timestamp of profile creation
- `updated_at` - Timestamp of last update

## Form Field Mapping

The UserForm component expects these fields:

### Form Fields → Database Fields
| Form Field | Database Field | Type | Notes |
|-----------|---------------|------|-------|
| `firstName` | `full_name` | string | Extracted from full_name (first word) |
| `lastName` | `full_name` | string | Extracted from full_name (remaining words) |
| `email` | `email` | string | Direct mapping |
| `role` | `role` | enum | admin, staff, customer |
| `status` | N/A | boolean | Derived from auth status (not a direct field) |
| `password` | N/A | string | Only for new users |
| avatar (preview) | `avatar_url` | string | Image URL |

## Fixes Applied

### 1. Enhanced Page Component (`page.tsx`)

**File**: `app/admin/users/[userId]/page.tsx`

#### Changes:
- ✅ Added Next.js 15 async params support
- ✅ Added comprehensive error handling with redirects
- ✅ Added detailed console logging for debugging
- ✅ Proper data fetching from Supabase

```typescript
interface PageProps {
    params: Promise<{ userId: string }> | { userId: string };
}

export default async function UserPage({ params }: PageProps) {
    // Await params if it's a promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const { userId } = resolvedParams;
    const isNew = userId === 'new';

    let initialData = null;

    if (!isNew) {
        console.log('[UserPage] Fetching user with ID:', userId);
        
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[UserPage] Error fetching user:', error);
            redirect('/admin/users');
        }

        if (data) {
            console.log('[UserPage] User data fetched:', data);
            initialData = data;
        } else {
            console.log('[UserPage] No user data found');
            redirect('/admin/users');
        }
    }

    return <UserForm userId={userId} initialData={initialData} isNew={isNew} />;
}
```

### 2. Enhanced Form Component (`UserForm.tsx`)

**File**: `app/admin/users/[userId]/UserForm.tsx`

#### Changes:
- ✅ Added logging to track initialData prop
- ✅ Added logging for name parsing
- ✅ Added logging for form reset operations
- ✅ Proper field mapping from database fields to form fields

```typescript
export default function UserForm({ userId, initialData, isNew }: UserFormProps) {
    // Log initial data on mount
    useEffect(() => {
        console.log('[UserForm] Component mounted');
        console.log('[UserForm] userId:', userId);
        console.log('[UserForm] isNew:', isNew);
        console.log('[UserForm] initialData:', initialData);
    }, []);

    // Parse initial name
    const [initialFirst, ...initialLastParts] = (initialData?.full_name || '').split(' ');
    const initialLast = initialLastParts.join(' ');

    console.log('[UserForm] Parsed name - First:', initialFirst, 'Last:', initialLast);

    // Form initialization with proper field mapping
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: initialFirst || '',
            lastName: initialLast || '',
            email: initialData?.email || '',
            role: initialData?.role || 'customer',
            status: initialData?.status !== 'Suspended' && initialData?.status !== false,
            password: '',
        }
    });

    // Sync data when initialData changes
    useEffect(() => {
        if (initialData) {
            console.log('[UserForm] Syncing initialData:', initialData);
            const [first, ...lastParts] = (initialData.full_name || '').split(' ');
            const last = lastParts.join(' ');

            const formValues = {
                firstName: first || '',
                lastName: last || '',
                email: initialData.email || '',
                role: initialData.role || 'customer',
                status: initialData.status !== 'Suspended' && initialData.status !== false,
                password: '',
            };

            console.log('[UserForm] Resetting form with values:', formValues);
            reset(formValues);
            setAvatarPreview(initialData.avatar_url || null);
        }
    }, [initialData, reset]);
}
```

## Debugging Steps

### Check Console Logs

When you click Edit on a user, you should see these logs in the browser console and server terminal:

#### Server Terminal (from page.tsx):
```
[UserPage] Fetching user with ID: <uuid>
[UserPage] User data fetched: { id: "...", full_name: "...", email: "...", role: "...", ... }
[UserPage] Rendering UserForm with initialData: Yes
```

#### Browser Console (from UserForm.tsx):
```
[UserForm] Component mounted
[UserForm] userId: <uuid>
[UserForm] isNew: false
[UserForm] initialData: { id: "...", full_name: "...", email: "...", role: "...", ... }
[UserForm] Parsed name - First: John Last: Doe
[UserForm] Syncing initialData: { ... }
[UserForm] Resetting form with values: { firstName: "John", lastName: "Doe", ... }
```

### Common Issues & Solutions

#### Issue 1: No server logs appearing
**Problem**: Page component not executing
**Solution**: Check if Next.js server is running and there are no build errors

#### Issue 2: Error logs show "User not found"
**Problem**: userId doesn't match any profile in database
**Solution**: 
- Check if the userId in the URL matches a valid profile id
- Verify the user exists in Supabase profiles table

#### Issue 3: Data fetched but form fields still empty
**Problem**: Form not resetting with new values
**Solution**: 
- Check browser console for UserForm logs
- Verify the `reset()` function is being called
- Check if `initialData` prop is being passed correctly

#### Issue 4: Params is undefined
**Problem**: Next.js params not being resolved
**Solution**: Already fixed with `await Promise.resolve(params)`

## Testing Checklist

1. ✅ Navigate to `/admin/users`
2. ✅ Click Edit icon for any user
3. ✅ Check server terminal for [UserPage] logs
4. ✅ Check browser console for [UserForm] logs
5. ✅ Verify all form fields are populated:
   - First Name
   - Last Name
   - Email (should be locked for existing users)
   - Role (should show correct radio button)
   - Status (should show correct toggle state)
   - Avatar preview (if user has avatar_url)

## Data Flow

```
User clicks Edit
    ↓
Navigate to /admin/users/[userId]
    ↓
page.tsx (Server Component)
  - Resolves params
  - Fetches user from profiles table
  - Passes initialData to UserForm
    ↓
UserForm.tsx (Client Component)
  - Receives initialData prop
  - Parses full_name into firstName/lastName
  - Sets form defaultValues
  - useEffect syncs data when initialData changes
  - Form fields populate with data
```

## Files Modified

1. `app/admin/users/[userId]/page.tsx`
   - Added async params handling
   - Added error handling and redirects
   - Added comprehensive logging

2. `app/admin/users/[userId]/UserForm.tsx`
   - Added logging throughout component lifecycle
   - Added proper field mapping documentation
   - Enhanced data syncing logic

## Expected Behavior After Fix

✅ Click Edit button → Navigate to edit page
✅ Server fetches user data from database
✅ Form fields populate with user data:
  - First Name field shows first part of full_name
  - Last Name field shows remaining part of full_name
  - Email field shows user's email (locked/disabled)
  - Role radio buttons show current role selected
  - Status toggle shows current status
  - Avatar preview shows user's avatar if available
✅ User can modify fields and save changes
✅ Changes persist to database

## Next Steps

If data is still not loading:
1. Check the console logs to identify where the data flow breaks
2. Verify Supabase connection and admin permissions
3. Check if the profiles table has the correct schema
4. Verify RLS policies allow reading profile data
5. Check if user ID in URL is valid UUID format
