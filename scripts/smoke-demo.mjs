import { spawn } from "node:child_process";
import net from "node:net";
import assert from "node:assert/strict";

const probe=net.createServer();
await new Promise((resolve,reject)=>{probe.once("error",reject);probe.listen(0,"127.0.0.1",resolve);});
const port=probe.address().port;
await new Promise(resolve=>probe.close(resolve));
const base="http://127.0.0.1:"+port;
const child=spawn(process.execPath,["server/index.mjs"],{
  cwd:process.cwd(),
  env:{...process.env,HOST:"127.0.0.1",PORT:String(port)},
  stdio:"ignore"
});
async function waitForServer(){
  for(let i=0;i<50;i++){
    if(child.exitCode!==null)throw new Error("Demo server exited before becoming healthy");
    try{const r=await fetch(base+"/api/health");if(r.ok)return await r.json();}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  throw new Error("Timed out waiting for local demo server");
}
async function json(path,method="GET",payload){
  const r=await fetch(base+path,{method,headers:{"Content-Type":"application/json"},body:payload===undefined?undefined:JSON.stringify(payload)});
  return {status:r.status,body:await r.json().catch(()=>({}))};
}
try{
  const health=await waitForServer();
  assert.equal(health.mode,"LOCAL_DEMO");
  assert.equal(health.targetExecution,false);

  const home=await fetch(base+"/");
  assert.equal(home.status,200);
  assert.match(await home.text(),/DEVIL EYE \/ R&D/);

  const map=await fetch(base+"/assets/world-map.svg");
  assert.equal(map.status,200);
  assert.match(await map.text(),/country outlines/);

  const concept=await fetch(base+"/concept/18.png");
  assert.equal(concept.status,200);
  assert.equal(concept.headers.get("content-type"),"image/png");
  assert.ok((await concept.arrayBuffer()).byteLength>10000);

  const denied=await json("/api/records","POST",{module:"targets",title:"unauthorized.test",authorized:false});
  assert.equal(denied.status,403);

  const record=await json("/api/records","POST",{module:"reconnaissance",title:"Smoke test observation",category:"test",status:"Needs review"});
  assert.equal(record.status,201);
  assert.ok(record.body.id);

  const disposable=await json("/api/records","POST",{module:"reconnaissance",title:"Smoke delete record"});
  assert.equal(disposable.status,201);
  const deleted=await json("/api/records/"+disposable.body.id,"DELETE");
  assert.equal(deleted.status,200);
  assert.equal(deleted.body.ok,true);

  const task=await json("/api/tasks","POST",{module:"operations",title:"Smoke test demo task",description:"Synthetic only"});
  assert.equal(task.status,201);
  assert.equal(task.body.state,"Awaiting approval");

  const approval=await json("/api/tasks/"+task.body.id+"/decision","POST",{decision:"approve"});
  assert.equal(approval.status,200);
  assert.match(approval.body.state,/Approved/);

  const cancelled=await json("/api/tasks/TASK-DEMO-001/cancel","POST",{});
  assert.equal(cancelled.status,200);
  assert.equal(cancelled.body.state,"Cancelled");

  const state=await json("/api/state");
  assert.equal(state.status,200);
  assert.ok(state.body.records.some(x=>x.title==="Smoke test observation"));
  assert.ok(state.body.audit.some(x=>x.action==="DEMO_APPROVAL_GRANTED"));

  const reset=await json("/api/reset","POST",{});
  assert.equal(reset.status,200);
  const after=await json("/api/state");
  assert.equal(after.body.records.length,0);
  console.log("DEMO SMOKE TEST PASSED: static app, world map, concept PNG, scope guard, records, task approval, cancellation, audit and reset.");
}finally{
  child.kill("SIGTERM");
  await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once("exit",resolve);setTimeout(()=>{child.kill("SIGKILL");resolve();},2000).unref();});
}
