import {google} from 'googleapis';
import {unseal} from './session.js';
export function oauth(){return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_REDIRECT_URI);}
export function client(session){const auth=oauth();auth.setCredentials(unseal(session.token));return google.gmail({version:'v1',auth});}
export async function scan(session){const gmail=client(session);const {data}=await gmail.users.messages.list({userId:'me',labelIds:['INBOX'],maxResults:30});const result=[];for(const m of data.messages||[]){const {data:d}=await gmail.users.messages.get({userId:'me',id:m.id,format:'metadata',metadataHeaders:['Subject','From']});result.push({id:m.id,subject:d.payload.headers.find(h=>h.name==='Subject')?.value||'(no subject)',sender:d.payload.headers.find(h=>h.name==='From')?.value||'Unknown',snippet:d.snippet||'',labels:d.labelIds||[]});}return result;}
export async function modify(session,ids,addLabelIds,removeLabelIds){if(!ids.length)return;await client(session).users.messages.batchModify({userId:'me',requestBody:{ids,addLabelIds,removeLabelIds}});}
