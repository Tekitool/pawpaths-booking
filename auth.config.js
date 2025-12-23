export const authConfig = {
    pages: {
        signIn: '/login',
    },
    secret: process.env.AUTH_SECRET || 'bbcbfefbbd95dc619c2fe6bb0b9a78295d40caa712d5584651b24196dc5e5410',
    trustHost: true,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const userRole = auth?.user?.role;

            console.log('Middleware check:', nextUrl.pathname, 'IsLoggedIn:', isLoggedIn, 'Role:', userRole);

            const isOnLogin = nextUrl.pathname.startsWith('/login');

            if (isOnAdmin) {
                if (isLoggedIn) {
                    // Define allowed roles for admin access
                    const allowedRoles = ['super_admin', 'admin', 'manager', 'staff'];

                    // Check if user has an allowed role
                    if (allowedRoles.includes(userRole)) {
                        return true;
                    }

                    // Redirect customers or unauthorized roles to homepage
                    return Response.redirect(new URL('/', nextUrl));
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && isOnLogin) {
                return Response.redirect(new URL('/admin/dashboard', nextUrl));
            }
            return true;
        },
        session({ session, token }) {
            if (token.role) {
                session.user.role = token.role;
                session.user.id = token.id; // Also good to have ID
                session.user.avatar = token.avatar; // Pass avatar to session
            }
            return session;
        },
        jwt({ token, user }) {
            if (user) {
                console.log('JWT Callback - User logged in:', user.email);
                token.role = user.role;
                token.id = user._id; // Store ID in token
                token.avatar = user.avatar; // Store avatar in token
            }
            return token;
        }
    },
    providers: [], // Configured in auth.js
};
