import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/upload',
    '/api/upload-proxy',
    '/api/chat',
    '/api/faiss/:path*'
  ]
};

const RATE_LIMIT = {
  UPLOAD: 5,    // 5 requests per minute
  CHAT: 10      // 10 requests per minute
};

const rateLimiter = new Map<string, { count: number, lastReset: number }>();

// Wrap middleware with NextAuth
export default withAuth(
  async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    // Rate limiting
    if (path.startsWith('/api/upload') || path.startsWith('/api/upload-proxy') || path.startsWith('/api/chat')) {
      const now = Date.now();
      const limitKey = `${clientIp}-${path}`;
      const limitInfo = rateLimiter.get(limitKey) || { count: 0, lastReset: now };
      
      // Reset counter every minute
      if (now - limitInfo.lastReset > 60_000) {
        limitInfo.count = 0;
        limitInfo.lastReset = now;
      }
      
      const limit = path.startsWith('/api/upload') || path.startsWith('/api/upload-proxy') 
        ? RATE_LIMIT.UPLOAD 
        : RATE_LIMIT.CHAT;
        
      if (limitInfo.count >= limit) {
        return new NextResponse(JSON.stringify({ 
          error: `Rate limit exceeded. Try again in ${Math.ceil((60_000 - (now - limitInfo.lastReset))/1000)} seconds`
        }), { 
          status: 429,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      limitInfo.count++;
      rateLimiter.set(limitKey, limitInfo);
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }: { token: any }) => {
        return token?.role === 'admin';
      }
    }
  }
); 