import {describe,it,expect} from 'vitest';
import {randomUUID} from 'node:crypto';
import {createSession,seal,unseal} from '../src/services/session.js';
import * as c from '../src/services/chore.js';
function session(){return {id:createSession(),mode:'demo'};}
describe('chore service',()=>{
 it('archive removes only INBOX',()=>expect(c.labelsFor(['INBOX','UNREAD','STARRED'],'archive')).toEqual(['UNREAD','STARRED']));
 it('read removes only UNREAD',()=>expect(c.labelsFor(['INBOX','UNREAD'],'read')).toEqual(['INBOX']));
 it('keep preserves labels',()=>expect(c.labelsFor(['INBOX','UNREAD'],'keep')).toEqual(['INBOX','UNREAD']));
 it('tokens round-trip encrypted',()=>{const value=seal({access_token:'test'});expect(value).not.toContain('test');expect(unseal(value)).toEqual({access_token:'test'});});
 it('dry-run does not mutate',async()=>{const s=session(),run=await c.scan(s);c.plan(s,run.runId,[{id:randomUUID(),messageId:'1',kind:'archive'}]);expect(c.report(s,run.runId).changed).toBe(0);});
 it('execution is idempotent and undo restores inbox',async()=>{const s=session(),run=await c.scan(s);const actions=[{id:randomUUID(),messageId:'1',kind:'archive'}];await c.execute(s,run.runId,actions);await c.execute(s,run.runId,actions);expect(c.report(s,run.runId).changed).toBe(1);await c.undo(s,run.runId);expect(c.report(s,run.runId).undone).toBe(true);expect((await c.scan(s)).messages.length).toBe(12);});
 it('rejects cross-session run access',async()=>{const s=session(),run=await c.scan(s);expect(()=>c.report(session(),run.runId)).toThrow('Run not found');});
});
