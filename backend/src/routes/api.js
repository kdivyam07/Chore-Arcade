import {Router} from 'express';
import {rateLimit} from 'express-rate-limit';
import * as c from '../controllers/api.js';
import {requireSession} from '../middleware/security.js';
const router=Router();
router.get('/health',c.health);router.get('/auth/me',c.me);router.post('/auth/demo',c.demo);router.get('/auth/google',c.google);router.get('/auth/callback',c.callback);router.get('/leaderboard',c.leaderboard);
router.use(requireSession);router.get('/chores',c.chores);router.post('/chores/email/scan',c.scan);router.post('/chores/email/dry-run',c.preview);router.post('/actions',rateLimit({windowMs:60000,limit:30,standardHeaders:'draft-8',legacyHeaders:false}),c.execute);router.get('/runs/:runId',c.report);router.post('/runs/:runId/undo',c.undo);router.post('/scores',c.scores);
export default router;
