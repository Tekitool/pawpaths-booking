export const authConfig = {
    pages: {
        signIn: '/login',
    },
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
            }
            return session;
        },
        jwt({ token, user }) {
            if (user) {
                console.log('JWT Callback - User logged in:', user.email);
                token.role = user.role;
            }
            return token;
        }
    },
    providers: [], // Configured in auth.js
};
