import { spawn } from "node:child_process";
import net from "node:net";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

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

  const appSource=await readFile("src/app.js","utf8");
  const uiSource=await readFile("src/enhancements.js","utf8");
  const adapterSource=await readFile("src/demo-api.js","utf8");
  const indexSource=await readFile("index.html","utf8");
  const cssSource=await readFile("src/demo.css","utf8");
  const manifest=JSON.parse(await readFile("concept/manifest.json","utf8"));
  assert.ok(appSource.includes("function iconFor"));
  assert.ok(appSource.includes("nav-group-toggle"));
  assert.ok(appSource.includes("registerGroup(group)"));
  assert.ok(appSource.includes("function globalSearchEntries"));
  assert.ok(appSource.includes('e.code==="Slash"'));
  const compiledCss=await readFile("assets/app.css","utf8");
  assert.ok(compiledCss.includes(".global-search-results{"));
  assert.ok(compiledCss.includes("position:fixed!important"));
  assert.ok(appSource.includes("function renderGlobalSearch"));
  assert.ok(appSource.includes("function selectGlobalSearchResult"));
  assert.ok(indexSource.includes("workspace-switcher-menu"));
  assert.ok(indexSource.includes("global-search-results"));
  assert.ok(appSource.includes("function positionGlobalSearch"));
  assert.ok(appSource.includes('document.body.appendChild(globalResults)'));
  assert.ok(appSource.includes('window.addEventListener("resize"'));
  assert.ok(cssSource.includes("#global-search-results.global-search-results{"));
  assert.ok(cssSource.includes("#global-search-results.global-search-results[hidden]{display:none!important}"));
  assert.ok(!indexSource.includes("target-authorized"));
  assert.ok(uiSource.includes("function ensureLiveLog"));
  assert.ok(uiSource.includes("DEMO_TELEMETRY_PULSE"));
  assert.ok(uiSource.includes("sourceMatchers"));
  assert.ok(uiSource.includes("data-record-delete"));
  assert.ok(uiSource.includes("data-demo-run-task"));
  assert.ok(adapterSource.includes("async function runTask"));
  assert.equal(manifest.images.length,19);

  for(const asset of ["src/enhancements.js","src/demo-api.js","src/demo.css"]){
    const response=await fetch(base+"/"+asset);
    assert.equal(response.status,200,asset+" must be packaged into dist");
  }
  for(const entry of manifest.images){
    const response=await fetch(base+"/concept/"+encodeURIComponent(entry.file),{method:"HEAD"});
    assert.equal(response.status,200,"Missing concept asset: "+entry.file);
  }

  const home=await fetch(base+"/");
  assert.equal(home.status,200);
  assert.ok((await home.text()).includes("DEVIL EYE / R&D"));

  const map=await fetch(base+"/assets/world-map.svg");
  assert.equal(map.status,200);
  assert.match(await map.text(),/country outlines/);

  const concept=await fetch(base+"/concept/18.png");
  assert.equal(concept.status,200);
  assert.equal(concept.headers.get("content-type"),"image/png");
  assert.ok((await concept.arrayBuffer()).byteLength>10000);

  // Demo targets are freely editable synthetic fixtures; no scope checkbox or authorization gate exists.
  const target=await json("/api/records","POST",{module:"targets",title:"demo-target.example",category:"Domain"});
  assert.equal(target.status,201);
  assert.equal(target.body.authorized,true);

  const record=await json("/api/records","POST",{module:"reconnaissance",title:"Smoke test observation",category:"test",status:"Needs review"});
  assert.equal(record.status,201);
  assert.ok(record.body.id);
  const updated=await json("/api/records/"+record.body.id,"PATCH",{status:"Reviewed — demo"});
  assert.equal(updated.status,200);
  assert.equal(updated.body.status,"Reviewed — demo");

  const disposable=await json("/api/records","POST",{module:"reconnaissance",title:"Smoke delete record"});
  assert.equal(disposable.status,201);
  const deleted=await json("/api/records/"+disposable.body.id,"DELETE");
  assert.equal(deleted.status,200);
  assert.equal(deleted.body.ok,true);

  const task=await json("/api/tasks","POST",{module:"operations",title:"Smoke simulated task",description:"Synthetic only"});
  assert.equal(task.status,201);
  assert.equal(task.body.state,"Awaiting approval");

  const approval=await json("/api/tasks/"+task.body.id+"/decision","POST",{decision:"approve"});
  assert.equal(approval.status,200);
  assert.match(approval.body.state,/Approved/);

  const execution=await json("/api/tasks/"+task.body.id+"/run","POST",{});
  assert.equal(execution.status,200);
  assert.equal(execution.body.state,"Completed — demo");
  assert.match(execution.body.result,/Synthetic workflow completed/);

  const rejectedTask=await json("/api/tasks","POST",{module:"threat-feed",title:"Smoke reject workflow"});
  assert.equal(rejectedTask.status,201);
  const rejected=await json("/api/tasks/"+rejectedTask.body.id+"/decision","POST",{decision:"reject"});
  assert.equal(rejected.status,200);
  assert.equal(rejected.body.state,"Rejected");

  const cancelled=await json("/api/tasks/TASK-DEMO-001/cancel","POST",{});
  assert.equal(cancelled.status,200);
  assert.equal(cancelled.body.state,"Cancelled");

  const state=await json("/api/state");
  assert.equal(state.status,200);
  assert.ok(state.body.records.some(x=>x.title==="Smoke test observation"));
  assert.ok(state.body.audit.some(x=>x.action==="DEMO_TASK_COMPLETED"));

  const reset=await json("/api/reset","POST",{});
  assert.equal(reset.status,200);
  const after=await json("/api/state");
  assert.equal(after.body.records.length,0);

  // Exercise the browser-localStorage adapter without the Node API.
  const store=new Map();
  const localStorage={
    getItem:key=>store.has(key)?store.get(key):null,
    setItem:(key,value)=>store.set(key,String(value)),
    removeItem:key=>store.delete(key)
  };
  const sandbox={
    window:{},localStorage,document:{baseURI:"https://demo.invalid/"},URL,
    fetch:async()=>{throw new TypeError("offline for fallback test");}
  };
  vm.runInNewContext(adapterSource,sandbox,{filename:"src/demo-api.js"});
  const localApi=sandbox.window.DevilEyeDemoAPI;
  const probeResult=await localApi.probe();
  assert.equal(probeResult.online,false);
  const localRecord=await localApi.addRecord({module:"reconnaissance",title:"Browser fallback record"});
  assert.ok(localRecord.id);
  const localTask=await localApi.createTask({module:"operations",title:"Browser fallback task"});
  await localApi.decideTask(localTask.id,"approve");
  const localRun=await localApi.runTask(localTask.id);
  assert.equal(localRun.state,"Completed — demo");
  await localApi.deleteRecord(localRecord.id);
  const localState=await localApi.state();
  assert.equal(localState.records.length,0);
  assert.ok(localState.audit.some(x=>x.action==="DEMO_TASK_COMPLETED"));
  await localApi.reset();

  console.log("DEMO SMOKE TEST PASSED: navigation/command-search contracts, workspace dropdown, live log, all 19 concepts, map, unrestricted demo targets, record CRUD, task approve/reject/run/cancel, audit, reset and browser-localStorage fallback.");
}finally{
  child.kill("SIGTERM");
  await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once("exit",resolve);setTimeout(()=>{child.kill("SIGKILL");resolve();},2000).unref();});
}
