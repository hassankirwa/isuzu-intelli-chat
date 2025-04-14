import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

// Extend the session and JWT types
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    }
  }

  interface User {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "admin" && credentials?.password === "admin123") {
          return { id: '1', name: 'Admin', role: 'admin' };
        }
        return null;
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
});

export { handler as GET, handler as POST }; 