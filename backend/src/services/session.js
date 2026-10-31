import {cookieValue} from '../utils/cookies.js';
import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {one,write} from '../models/store.js';
import {examples} from '../../../database/seed.js';
// Ephemeral encryption key deliberately invalidates live tokens after a restart.
const key=randomBytes(32);
export function seal(value){const iv=randomBytes(12);const c=createCipheriv('aes-256-gcm',key,iv);return encrypt(c,iv,value);}
function encrypt(c,iv,value){const data=Buffer.concat([c.update(JSON.stringify(value)),c.final()]);return Buffer.concat([iv,c.getAuthTag(),data]).toString('base64');}
export function unseal(value){const b=Buffer.from(value,'base64');const d=createDecipheriv('aes-256-gcm',key,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString());}
export function createSession(mode='demo',token=null){const id=randomBytes(32).toString('hex');write('INSERT INTO sessions VALUES(?,?,?,?)',id,mode,token?seal(token):null,Date.now());if(mode==='demo') examples.forEach((m,i)=>write('INSERT INTO messages VALUES(?,?,?,?,?,?)',String(i+1),id,...m,JSON.stringify(['INBOX','UNREAD'])));return id;}
export function session(req){const cookie=cookieValue(req,'arcade');return cookie&&one('SELECT * FROM sessions WHERE id=? AND created>?',cookie,Date.now()-86400000);}
export function setCookie(res,id){res.cookie('arcade',id,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:86400000,path:'/'});}
