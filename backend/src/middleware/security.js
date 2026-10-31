import {session} from '../services/session.js';
export function requireSession(q,r,next){q.session=session(q);if(!q.session)return r.status(401).json({error:{code:'AUTH_REQUIRED',message:'Start a demo or connect Gmail first.'}});next();}
export function origin(q, r, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(q.method)) return next();
  const o = q.headers.origin;
  if (!o) return next();
  const allowed = process.env.APP_ORIGIN || 'http://localhost:8080';
  const host = q.headers.host;
  const isSelf = host && (o === `https://${host}` || o === `http://${host}`);
  if (o !== allowed && !isSelf) {
    return r.status(403).json({ error: { code: 'ORIGIN_DENIED', message: 'Request origin is not allowed' } });
  }
  next();
}
export function errors(err,_q,r,_next){const status=err.name==='ZodError'?400:err.status||502;r.status(status).json({error:{code:status===400?'INVALID_REQUEST':'REQUEST_FAILED',message:status>=500?'Operation failed. Please retry; completed actions will not be duplicated.':err.message}});}
