import {it,expect} from 'vitest';
import request from 'supertest';
import {randomUUID} from 'node:crypto';
import {app} from '../src/server.js';
it('health is public',async()=>{const r=await request(app).get('/api/health');expect(r.status).toBe(200);});
it('rejects unauthenticated scan',async()=>{expect((await request(app).post('/api/chores/email/scan').send({})).status).toBe(401);});
it('validates action input',async()=>{const a=request.agent(app);await a.post('/api/auth/demo').send({});expect((await a.post('/api/actions').send({})).status).toBe(400);});
it('prevents foreign-origin mutations',async()=>{expect((await request(app).post('/api/auth/demo').set('Origin','https://attacker.invalid').send({})).status).toBe(403);});
it('scores confirmed actions and rejects fabricated totals',async()=>{const a=request.agent(app);await a.post('/api/auth/demo').send({});const run=(await a.post('/api/chores/email/scan').send({})).body;await a.post('/api/actions').send({runId:run.runId,actions:[{id:randomUUID(),messageId:'1',kind:'archive'}]});const r=await a.post('/api/scores').send({runId:run.runId,name:'Tester',score:999999});expect(r.body.score).toBe(100);});
