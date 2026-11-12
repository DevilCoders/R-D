import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,".."),webRoot=path.join(root,"dist"),dataDir=path.join(here,"data");
const dbFile=path.join(dataDir,"demo-state.json"),host=process.env.HOST||"127.0.0.1",port=Number(process.env.PORT||4174);
const fresh=()=>({records:[],tasks:[{id:"TASK-DEMO-001",module:"operations",title:"Sample external-surface review",description:"Synthetic workflow used to demonstrate approval and audit controls.",state:"Awaiting approval",mode:"SIMULATED",approvalRequired:true,createdAt:new Date().toISOString(),execution:"No target contact or tool execution"}],approvals:[{id:"APR-TASK-DEMO-001",taskId:"TASK-DEMO-001",state:"Pending",createdAt:new Date().toISOString()}],audit:[{id:"AUD-BOOTSTRAP",action:"DEMO_STORE_INITIALIZED",detail:"Synthetic local database created",at:new Date().toISOString(),origin:"LOCAL NODE DEMO API"}]});
let db=fresh();
async function save(){await mkdir(dataDir,{recursive:true});await writeFile(dbFile,JSON.stringify(db,null,2),"utf8");}
async function load(){try{db=JSON.parse(await readFile(dbFile,"utf8"));for(const k of ["records","tasks","approvals","audit"])if(!Array.isArray(db[k]))db[k]=[];}catch{db=fresh();await save();}}
function send(res,status,data){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});res.end(JSON.stringify(data));}
async function readBody(req){let raw="";for await(const chunk of req){raw+=chunk;if(raw.length>65536)throw new Error("Request body too large");}return raw?JSON.parse(raw):{};}
function clean(v,max=240){return String(v??"").trim().slice(0,max);}
function log(action,detail){db.audit.unshift({id:"AUD-"+crypto.randomUUID().slice(0,8).toUpperCase(),action,detail:clean(detail),at:new Date().toISOString(),origin:"LOCAL NODE DEMO API"});db.audit=db.audit.slice(0,500);}
async function api(req,res,url){
 const route=url.pathname.replace(/^.*\\/api\\//,"");
 if(req.method==="GET"&&route==="health")return send(res,200,{ok:true,service:"DEVIL EYE DEMO BACKEND",mode:"LOCAL_DEMO",data:"SYNTHETIC ONLY",targetExecution:false,now:new Date().toISOString(),uptimeSeconds:Math.floor(process.uptime())});
 if(req.method==="GET"&&route==="state")return send(res,200,db);
 if(req.method==="GET"&&route==="audit")return send(res,200,{items:db.audit});
 if(req.method==="GET"&&route==="tasks")return send(res,200,{items:db.tasks});
 if(req.method==="GET"&&route==="records"){const module=url.searchParams.get("module");return send(res,200,{items:module?db.records.filter(x=>x.module===module):db.records});}
 if(req.method==="POST"&&route==="records"){
  const v=await readBody(req),r={id:"REC-"+crypto.randomUUID().slice(0,10).toUpperCase(),module:clean(v.module,80),title:clean(v.title,180),category:clean(v.category,100),status:clean(v.status||"Needs review",64),notes:clean(v.notes,1200),source:clean(v.source||"Operator-entered demo record",180),authorized:v.authorized===true,createdAt:new Date().toISOString(),origin:"SYNTHETIC DEMO"};
  if(!r.title||!r.module)return send(res,400,{message:"module and title are required"});
  if(r.module==="targets"&&!r.authorized)return send(res,403,{message:"Explicit authorization confirmation is required for demo scope records"});
  db.records.unshift(r);log("DEMO_RECORD_CREATED",r.module+": "+r.title);await save();return send(res,201,r);
 }
 if(req.method==="PATCH"&&route.startsWith("records/")){
  const id=decodeURIComponent(route.slice(8)),r=db.records.find(x=>x.id===id);if(!r)return send(res,404,{message:"Demo record not found"});
  const v=await readBody(req);if(v.status)r.status=clean(v.status,64);if(v.notes!==undefined)r.notes=clean(v.notes,1200);r.updatedAt=new Date().toISOString();log("DEMO_RECORD_UPDATED",id);await save();return send(res,200,r);
 }
 if(req.method==="POST"&&route==="tasks"){
  const v=await readBody(req),t={id:"TASK-"+crypto.randomUUID().slice(0,8).toUpperCase(),module:clean(v.module||"operations",80),title:clean(v.title,180),description:clean(v.description,900),state:"Awaiting approval",mode:"SIMULATED",approvalRequired:true,createdAt:new Date().toISOString(),execution:"SIMULATION ONLY — no scanner, exploit, network, credential, or external service is invoked"};
  if(!t.title)return send(res,400,{message:"Task title is required"});
  db.tasks.unshift(t);db.approvals.unshift({id:"APR-"+t.id,taskId:t.id,state:"Pending",createdAt:t.createdAt});log("DEMO_TASK_CREATED",t.title);await save();return send(res,201,t);
 }
 if(req.method==="POST"&&route.startsWith("tasks/")&&route.endsWith("/decision")){
  const id=decodeURIComponent(route.split("/")[1]),v=await readBody(req);if(!["approve","reject"].includes(v.decision))return send(res,400,{message:"decision must be approve or reject"});
  const t=db.tasks.find(x=>x.id===id);if(!t)return send(res,404,{message:"Task not found"});t.state=v.decision==="approve"?"Approved — demo only":"Rejected";t.decidedAt=new Date().toISOString();
  const a=db.approvals.find(x=>x.taskId===id);if(a){a.state=v.decision==="approve"?"Approved":"Rejected";a.decidedAt=t.decidedAt;}
  log(v.decision==="approve"?"DEMO_APPROVAL_GRANTED":"DEMO_APPROVAL_REJECTED",id);await save();return send(res,200,t);
 }
 if(req.method==="POST"&&route.startsWith("tasks/")&&route.endsWith("/cancel")){
  const id=decodeURIComponent(route.split("/")[1]),t=db.tasks.find(x=>x.id===id);if(!t)return send(res,404,{message:"Task not found"});t.state="Cancelled";t.cancelledAt=new Date().toISOString();log("DEMO_TASK_CANCELLED",id);await save();return send(res,200,t);
 }
 if(req.method==="POST"&&route==="audit"){const v=await readBody(req);log(clean(v.action||"DEMO_EVENT",80),v.detail);await save();return send(res,201,db.audit[0]);}
 if(req.method==="POST"&&route==="reset"){db=fresh();await save();return send(res,200,{ok:true,state:db});}
 return send(res,404,{message:"Demo API route not found"});
}
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".ico":"image/x-icon"};
async function staticFile(req,res,url){
 const decoded=decodeURIComponent(url.pathname),relative=decoded==="/"?"index.html":decoded.replace(/^\\/+ /,"");
 const file=path.resolve(webRoot,relative);
 if(!file.startsWith(webRoot+path.sep)&&file!==path.join(webRoot,"index.html"))return send(res,403,{message:"Forbidden"});
 try{const data=await readFile(file);res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});res.end(req.method==="HEAD"?undefined:data);}catch{return send(res,404,{message:"Demo resource not found"});}
}
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,"http://"+(req.headers.host||"localhost"));
 try{if(url.pathname.startsWith("/api/"))await api(req,res,url);else if(req.method==="GET"||req.method==="HEAD")await staticFile(req,res,url);else send(res,405,{message:"Method not allowed"});}catch(e){send(res,400,{message:e.message||"Invalid demo request"});}
});
await load();
server.listen(port,host,()=>{console.log("DEVIL EYE local demo: http://"+host+":"+port);console.log("API health: http://"+host+":"+port+"/api/health");console.log("Synthetic demo only; target execution is disabled.");});