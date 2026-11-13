/* DEVIL EYE — concept-driven interactive demo layer. */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const api=()=>window.DevilEyeDemoAPI,esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let conceptItems=null;
let query="",statusFilter="ALL",sourceFilter="all",lastDetail=null;
const modules={
"operations":"<div class='demo-concept-note'>Approval state is local demo workflow only. No task triggers a scan, agent or external request.</div><div id='demo-task-queue' class='demo-viz-card'><div class='demo-viz-heading'><b>WORKFLOW QUEUE</b><span>LOADING</span></div><div class='demo-viz-body'></div></div>",
"reconnaissance":"<div class='demo-card-grid'>"+["DNS & certificate context","Asset relationships","Change monitoring"].map((x,i)=>card("DISCOVERY / 0"+(i+1),x,"Passive sample observations")).join("")+"</div>",
"domain-analysis":"<div class='demo-card-grid'>"+["DNS A / AAAA / MX / TXT","Certificate transparency","Related hosts & domains"].map((x,i)=>card("DOMAIN / 0"+(i+1),x,"Source-attributed sample metadata")).join("")+"</div>",
"ip-analysis":"<div class='demo-viz-grid'><div class='demo-viz-card'><div class='demo-viz-heading'><b>PORT OBSERVATION GRID</b><span>SELECT A PORT</span></div><div class='demo-viz-body'><div class='demo-point-grid'>"+[22,25,53,80,110,143,443,445,3306,3389,5432,8080,8443,9200,27017,5000].map(p=>"<button class='demo-port "+([80,443,8080,8443].includes(p)?"open":([22,445,3389].includes(p)?"review":""))+"' data-demo-port='"+p+"'>"+p+"</button>").join("")+"</div></div></div><div class='demo-viz-card'><div class='demo-viz-heading'><b>PORT INSPECTOR</b><span>SYNTHETIC</span></div><div class='demo-viz-body' id='demo-port-info'><div class='demo-inspector'><h4>Select a port</h4><p>Inspect sample service metadata. This is not a network scan.</p></div></div></div></div>",
"social-intelligence":"<div class='demo-card-grid'>"+["Public profile context","Mention monitoring","Topic clusters"].map((x,i)=>card("SOCIAL SIGNAL / 0"+(i+1),x,"Public-source sample data only")).join("")+"</div>",
"geolocation":worldMapPanel(),
"tech-stack":"<div class='demo-viz-grid'><div class='demo-viz-card'><div class='demo-viz-heading'><b>TECHNOLOGY CONFIDENCE</b><span>ILLUSTRATIVE</span></div><div class='demo-viz-body'>"+[["Web server",86],["Application",72],["Runtime",64],["TLS profile",93],["CDN / Edge",58]].map(x=>bar(x[0],x[1])).join("")+"</div></div><div class='demo-viz-card'><div class='demo-viz-heading'><b>STACK COMPONENTS</b><span>OPEN REVIEW</span></div><div class='demo-viz-body'>"+["Nginx · Web","Node.js · Runtime","React · Frontend","TLS 1.3 · Transport"].map(x=>"<button class='demo-small-button' data-demo-review='"+x+"' style='margin:3px'>"+x+"</button>").join("")+"</div></div></div>",
"surface-web":sourceCards(["Vendor advisories","Public repositories","Research publications","Documentation portals"]),
"deep-web":sourceCards(["Academic catalogues","Public archives","Specialist indexes","Historical collections"]),
"dark-web":"<p class='demo-concept-note'>Vetted reporting only. No connection to Tor/I2P, hidden services, marketplaces, or illicit infrastructure is implemented.</p>"+sourceCards(["Vetted threat research","Public breach disclosures","Vendor exposure reports","CERT advisories"]),
"vuln-scan":"<div class='demo-card-grid'>"+[["CRITICAL","02"],["HIGH","08"],["MEDIUM","16"]].map(x=>card("SAMPLE FINDINGS / "+x[0],x[1],"Requires evidence validation")).join("")+"</div>",
"exploit-search":"<div class='demo-card-grid'>"+["CVE / advisory catalogue","Affected version mapping","Vendor mitigations"].map(x=>card("RESEARCH CONTROL",x,"Reference review only · no exploit action")).join("")+"</div>",
"security-analysis":"<div class='demo-viz-card'><div class='demo-viz-heading'><b>CONTROL REVIEW MATRIX</b><span>OPEN REVIEW</span></div><div class='demo-viz-body'>"+["Identity and access","Network segmentation","Transport security","Software supply chain","Logging and detection"].map(x=>kv(x,"<button class='demo-small-button' data-demo-review='"+x+"'>Open evidence</button>")).join("")+"</div></div>",
"post-exploitation":timeline(["Approved test evidence attached","Control effectiveness reviewed","Impact statement drafted","Remediation retest queued"]),
"privilege-escalation":"<div class='demo-viz-card'><div class='demo-viz-heading'><b>PRIVILEGE BOUNDARY LADDER</b><span>REVIEW ONLY</span></div><div class='demo-viz-body'>"+["Standard user","Power user","Service identity","Administrator"].map((x,i)=>kv(x,["Baseline","Limited","Scoped","Privileged"][i])).join("")+"</div></div>",
"lateral-movement":"<div class='demo-card-grid'>"+["USER ZONE","APP ZONE","DATA ZONE"].map(x=>card("NETWORK SEGMENT",x,"Trust boundary documented · no propagation")).join("")+"</div>",
"persistence-review":"<div class='demo-viz-card'><div class='demo-viz-heading'><b>ENDPOINT DETECTION CHECKLIST</b><span>DEFENSIVE REVIEW</span></div><div class='demo-viz-body'>"+["Startup entry inventory","Service change history","Scheduled task coverage","EDR alert references","Tamper protection status"].map(x=>kv(x,"<button class='demo-small-button' data-demo-review='"+x+"'>Review</button>")).join("")+"</div></div>",
"intelligence":relationPanel(),
"threat-feed":"<div class='demo-card-grid'>"+[["ACTIVE FEEDS","42"],["PRIORITY SIGNALS","7"],["SOURCE HEALTH","98%"]].map(x=>card("THREAT MONITOR",x[0],x[1]+" illustrative demo signal")).join("")+"</div>",
"knowledge-base":"<div class='demo-card-grid'>"+["ATT&CK references","CVE / NVD records","CWE taxonomy","Vendor advisories","Internal research","Evidence catalogue"].map(x=>card("KNOWLEDGE COLLECTION",x,"Versioned sample reference")).join("")+"</div>",
"reports":"<div class='demo-card-grid'>"+["Assessment report","Evidence manifest","Approval history"].map(x=>card("REPORT PACKAGE",x,"Exportable sample records")).join("")+"</div>"
};
function card(k,t,d){return "<button type='button' class='demo-info-card demo-info-button' data-demo-review='"+esc(t)+"'><small>"+esc(k)+"</small><strong>"+esc(t)+"</strong><span>"+esc(d)+"</span></button>";}
function kv(k,v){return "<div class='demo-kv'><span>"+k+"</span><b>"+v+"</b></div>";}
function bar(n,v){return "<div class='demo-bar-row'><span>"+n+"</span><div class='demo-bar-track'><div class='demo-bar-fill' style='width:"+v+"%'></div></div><b>"+v+"%</b></div>";}
function sourceCards(items){return "<div class='demo-card-grid'>"+items.map((x,i)=>card("CURATED SOURCE / 0"+(i+1),x,"Catalogue entry · provenance retained")).join("")+"</div>";}
function timeline(items){return "<div class='demo-viz-card'><div class='demo-viz-heading'><b>EVIDENCE LIFECYCLE</b><span>POST-ENGAGEMENT</span></div><div class='demo-viz-body'>"+items.map((x,i)=>kv("0"+(i+1)+" / "+x,"SAMPLE")).join("")+"</div></div>";}
function worldMapPanel(){const points=[["NEW YORK","29.4%","27.8%"],["LONDON","50%","21.7%"],["TALLINN","56.7%","17.2%"],["SINGAPORE","78.9%","49.4%"],["TOKYO","88.6%","30.6%"],["SÃO PAULO","24.7%","62.3%"]];return "<div class='demo-viz-grid'><div class='demo-viz-card'><div class='demo-viz-heading'><b>WORLD SIGNAL DISTRIBUTION</b><span>CLICK A MARKER</span></div><div class='demo-viz-body'><div class='world-map world-map-real'><img src='./assets/world-map.svg' alt='Complete world map with country boundaries'><div class='world-map-points'>"+points.map(p=>"<button class='world-map-point' style='left:"+p[1]+";top:"+p[2]+"' data-map-point='"+p[0]+"' data-map-location='"+p[0]+" / synthetic signal' data-map-detail='Illustrative research marker'><i></i><span>"+p[0]+"</span></button>").join("")+"</div><div class='map-caption mono'>SYNTHETIC GEO SIGNALS / NOT LIVE</div></div></div></div><div class='demo-viz-card'><div class='demo-viz-heading'><b>GEO INSPECTOR</b><span>DEMO</span></div><div class='demo-viz-body' id='demo-geo-inspector'><div class='demo-inspector'><h4>Global signal map</h4><p>Markers are synthetic and do not represent real hosts or people.</p></div></div></div></div>";}
function relationPanel(){return "<div class='demo-viz-grid'><div class='demo-viz-card'><div class='demo-viz-heading'><b>ENTITY RELATIONSHIP GRAPH</b><span>SELECT NODE</span></div><div class='demo-viz-body'><svg viewBox='0 0 600 290' style='width:100%;height:auto'><g stroke='#73404a' stroke-width='2'><path d='M300 140L130 65M300 140L470 65M300 140L130 225M300 140L470 225M130 65L470 65M130 225L470 225'/></g>"+[["ASSET",300,140],["DOMAIN",130,65],["CERT",470,65],["TECH",130,225],["ADVISORY",470,225]].map(p=>"<g class='demo-rel-node' data-demo-entity='"+p[0]+"'><circle cx='"+p[1]+"' cy='"+p[2]+"' r='35' fill='#14202b' stroke='#b14c5b' stroke-width='2'/><text x='"+p[1]+"' y='"+(p[2]+4)+"' fill='#e3eaf1' font-size='12' text-anchor='middle'>"+p[0]+"</text></g>").join("")+"</svg></div></div><div class='demo-viz-card'><div class='demo-viz-heading'><b>ENTITY INSPECTOR</b><span>DEMO</span></div><div class='demo-viz-body' id='demo-rel-inspector'><div class='demo-inspector'><h4>Fusion graph</h4><p>Sample graph entities. Confidence must be human-reviewed.</p></div></div></div></div>";}
function current(){return location.hash.slice(1)||"dashboard";}
function toast(msg){const t=$("#toast");if(!t)return;t.textContent=msg;t.classList.add("visible");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("visible"),3500);}
function addSidebar(){
 if(window.DevilEyeNavigation && window.DevilEyeNavigation.registerGroup){
  window.DevilEyeNavigation.registerGroup({id:"reference-library",label:"REFERENCE LIBRARY",icon:"knowledge",items:[["concept-library","Concept Library","knowledge","demo"]]});
  return;
 }
 const g=$("#sidebar-groups");
 if(!g || $("[data-demo-page='concept-library']",g)) return;
 const n=document.createElement("section");n.className="nav-group";
 n.innerHTML="<button class='nav-group-toggle' type='button' aria-expanded='true'><span class='nav-group-icon'>▧</span><span>REFERENCE LIBRARY</span><span class='nav-chevron'>⌄</span></button><div class='nav-children'><button class='side-link' type='button' data-demo-page='concept-library'><span class='side-icon'>▧</span><span>Concept Library</span></button></div>";
 g.append(n);
}
async function loadConceptItems(){
 if(conceptItems) return conceptItems;
 try{
  const response=await fetch("./concept/manifest.json",{cache:"no-store"});
  if(!response.ok) throw new Error("Concept manifest unavailable");
  const manifest=await response.json();
  conceptItems=(manifest.images||[]).filter(item=>item && /^[a-zA-Z0-9_.-]+\\.png$/.test(item.file||""))
    .sort((a,b)=>(a.sequence??0)-(b.sequence??0));
 }catch(_){
  conceptItems=Array.from({length:19},(_,i)=>({id:"concept-"+String(i).padStart(2,"0"),file:i+".png",sequence:i,title:"DEVIL EYE reference "+String(i).padStart(2,"0")}));
 }
 return conceptItems;
}
function conceptNames(){return (conceptItems||[]).map(item=>item.title||item.id);}
async function renderConceptLibrary(){
 const ws=$("#workspace");if(!ws)return;
 addSidebar();
 $("#page-title").textContent="Concept Library";
 $("#breadcrumbs").innerHTML="<span>DEVIL EYE</span><b>/</b><span>REFERENCE LIBRARY</span><b>/</b><strong>Concept Library</strong>";
 document.title="Concept Library — DEVIL EYE / R&D";
 const items=await loadConceptItems();
 const cards=items.map((item,i)=>{
  const src="./concept/"+encodeURIComponent(item.file);
  const title=esc(item.title||item.id||("Concept "+i));
  return "<article class='demo-concept-card' tabindex='0' role='button' data-concept-index='"+i+"' data-concept-file='"+esc(item.file)+"' data-concept-title='"+title+"' aria-label='Open "+title+"'>"+
   "<img class='demo-concept-thumb' loading='lazy' src='"+src+"' alt='"+title+"'>"+
   "<div class='demo-concept-meta'><b>"+String(item.sequence??i).padStart(2,"0")+" / "+title+"</b><span>OPEN ↗</span></div></article>";
 }).join("");
 ws.innerHTML="<div class='workspace-hero'><div><span class='section-kicker'>VISUAL SPECIFICATION / "+items.length+" ORIGINAL REFERENCES</span><h2>Concept <span class='text-gradient'>library.</span></h2><p>Concept assets load from concept/manifest.json. New entries appear here when added to the manifest.</p></div><span class='demo-stamp'>"+items.length+" CONCEPTS / LOCAL ASSETS</span></div>"+
 "<p class='demo-concept-note'>Select a card for a full-resolution preview. Original image files remain in the concept/ directory.</p><div class='demo-concept-grid'>"+cards+"</div>";
 $("#workspace-scroll").scrollTop=0;
 if(window.DevilEyeNavigation)window.DevilEyeNavigation.openGroup("reference-library");
}
function insertWorkspace(){
 const id=current(),ws=$("#workspace");if(!ws)return;
 addSidebar();
 if(id==="concept-library"){renderConceptLibrary();return;}
 if(!$(".demo-global-actions",ws)){
  const rail=document.createElement("div");rail.className="demo-rail demo-global-actions";
  const primary=id==="targets"
   ? "<button class='demo-small-button' data-demo-action='add-target'>＋ Add target</button>"
   : "<button class='demo-small-button' data-demo-action='add-record'>＋ Add observation</button>";
  rail.innerHTML="<div class='demo-rail-copy'><b>WORKSPACE CONTROLS</b> <span> / synthetic demo state</span></div><div class='demo-rail-actions'>"+primary+
   "<button class='demo-small-button' data-demo-action='create-task'>＋ Create task</button><button class='demo-small-button' data-demo-action='toggle-filters'>☷ Filters</button><button class='demo-small-button' data-demo-action='live-log'>◉ Live log</button><button class='demo-small-button' data-demo-action='export'>⇩ Export</button><button class='demo-small-button' data-demo-action='refresh'>↻ Refresh</button></div>";
  const anchor=$(".workspace-hero",ws)||$(".osint-banner",ws)||ws.firstElementChild;
  if(anchor)anchor.insertAdjacentElement("afterend",rail);else ws.prepend(rail);
 }
 if(modules[id]&&!$(".demo-module-visual",ws)){
  const block=document.createElement("section");block.className="demo-module-visual";
  block.innerHTML=modules[id];
  const anchor=$(".metric-grid",ws)||$(".module-strip",ws)||$(".demo-global-actions",ws)||ws.firstElementChild;
  if(anchor)anchor.insertAdjacentElement("afterend",block);else ws.prepend(block);
 }
 if(id==="operations")renderQueue();
 ensureLiveLog();
 renderDemoRecords();
 if(id==="settings"&&!$("[data-demo-action='reset']",ws)){
  const card=document.createElement("section");card.className="panel-card";
  card.innerHTML="<div class='panel-heading'><div><span class='panel-kicker'>DEMO STATE</span><h3>Backend controls</h3></div></div><div style='padding:14px'><p class='demo-concept-note'>Reset clears synthetic demo records, task states and audit history from the active demo store.</p><button class='btn-secondary' data-demo-action='reset'>Reset demo state</button> <button class='btn-secondary' data-demo-open='audit'>View audit log</button></div>";
  ws.append(card);
 }
}
function ensureFilters(){
 const ws=$("#workspace");if(!ws)return;
 const tableBox=$(".table-wrap",ws);if(!tableBox)return;
 let row=$(".demo-filter-row",ws);
 if(!row){
  row=document.createElement("div");row.className="demo-filter-row";
  row.innerHTML="<button class='demo-filter-chip active' data-demo-filter='ALL'>All</button><button class='demo-filter-chip' data-demo-filter='verified'>Verified</button><button class='demo-filter-chip' data-demo-filter='review'>Review</button><button class='demo-filter-chip' data-demo-filter='high'>High / critical</button><span class='demo-count'></span>";
  const parent=tableBox.closest(".panel-card")||tableBox.parentElement;
  const search=parent&&$(".search-toolbar",parent);
  if(search)search.insertAdjacentElement("afterend",row);else tableBox.insertAdjacentElement("beforebegin",row);
 }
}
function applyFilters(){
 const ws=$("#workspace");if(!ws)return;
 const rows=$$("tbody tr",ws);
 const sourceMatchers={
  web:/official website|web page|website|public webpage/i,
  social:/social media|public profile|social post/i,
  news:/news & media|news report|press release|media bulletin/i,
  forums:/forums|forum thread|discussion board/i,
  public:/public records|corporate filing|public registry/i,
  technical:/technical source|repository|dns|certificate|code reference/i
 };
 rows.forEach(row=>{
  const text=row.textContent.toLowerCase();
  const type=$$("td",row)[2]?.textContent||"";
  const matchesQuery=!query||text.includes(query.toLowerCase());
  const matchesStatus=statusFilter==="ALL"||text.includes(statusFilter.toLowerCase());
  const matchesSource=current()!=="osint-search"||sourceFilter==="all"||!!(sourceMatchers[sourceFilter]&&sourceMatchers[sourceFilter].test(type));
  row.classList.toggle("hidden-row",!(matchesQuery&&matchesStatus&&matchesSource));
 });
 const c=$(".demo-count",ws);
 if(c)c.textContent=rows.filter(r=>!r.classList.contains("hidden-row")).length+" / "+rows.length+" VISIBLE";
}
function bindInteractiveSurfaces(){
 const ws=$("#workspace");if(!ws)return;
 const selectors=".workflow-row,.health-row,.activity-row,.trend-row,.demo-kv,.demo-bar-row,.metric-card,.context-stat,.check-row";
 $$(selectors,ws).forEach(el=>{
  if(el.dataset.demoReview || el.querySelector("button,a,input,select"))return;
  let label="";
  if(el.matches(".metric-card")){
   const metric=$(".metric-top span",el)?.textContent||"Metric";
   const value=$("strong",el)?.textContent||"";
   const note=$("small",el)?.textContent||"";
   label=[metric,value,note].filter(Boolean).join(" · ");
  }else if(el.matches(".activity-row")){
   label=[$("strong",el)?.textContent,$("p",el)?.textContent].filter(Boolean).join(" — ");
  }else if(el.matches(".workflow-row")){
   label=[$("strong",el)?.textContent,$("small",el)?.textContent].filter(Boolean).join(" — ");
  }else if(el.matches(".demo-bar-row")){
   label=[$("span",el)?.textContent,$$("b",el).map(x=>x.textContent).join(" ")].filter(Boolean).join(" — ");
  }else{
   const parts=$$("span,b,strong,small",el).map(x=>x.textContent.trim()).filter(Boolean);
   label=parts.join(" — ")||el.textContent;
  }
  label=String(label||"").trim().replace(/\s+/g," ").slice(0,180);
  if(!label)return;
  el.dataset.demoReview=label;
  el.dataset.demoSurface="true";
  el.setAttribute("role","button");
  el.setAttribute("tabindex","0");
  el.setAttribute("aria-label","Inspect demo item: "+label);
 });
}
function ensureLiveLog(){
 const ws=$("#workspace");if(!ws||$(".demo-live-log",ws))return;
 const panel=document.createElement("section");panel.className="panel-card demo-live-log";
 panel.innerHTML="<div class='panel-heading'><div><span class='panel-kicker'>SYSTEM TELEMETRY / SYNTHETIC</span><h3>Live event stream</h3></div><div class='demo-live-heading-actions'><span class='live-badge'><i></i> LIVE / DEMO</span><button type='button' class='demo-small-button' data-demo-open='audit'>Full log ↗</button></div></div><div class='demo-live-log-list' id='demo-live-log-list'><div class='demo-empty'>Connecting to local demo event stream…</div></div>";
 ws.append(panel);
 renderLiveLog();
}
async function renderLiveLog(){
 const list=$("#demo-live-log-list");if(!list||!api())return;
 try{
  const state=await api().state(),items=(state.audit||[]).slice(0,8);
  list.innerHTML=items.map(item=>{
   const stamp=new Date(item.at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
   const action=esc(item.action||"DEMO_EVENT"),detail=esc(item.detail||"Synthetic event");
   return "<div class='demo-live-event'><time>"+stamp+"</time><span class='demo-live-dot'></span><div><b>"+action+"</b><small>"+detail+"</small></div><span class='demo-live-origin'>"+esc(item.origin||"DEMO")+"</span></div>";
  }).join("")||"<div class='demo-empty'>No events yet. Interact with the demo workspace to generate events.</div>";
 }catch(err){list.innerHTML="<div class='demo-empty'>Live log unavailable: "+esc(err.message)+"</div>";}
}
async function logDemoEvent(action,detail){
 if(!api())return;
 try{await api().addAudit(action,detail);await renderLiveLog();}catch(_){}
}
function logButtonInteraction(element){
 if(!element||element.closest(".demo-live-log"))return;
 const label=(element.getAttribute("aria-label")||element.dataset.action||element.dataset.demoAction||element.textContent||element.getAttribute("title")||"Control").replace(/\s+/g," ").trim().slice(0,100);
 if(!label)return;
 logDemoEvent("UI_INTERACTION",current()+" / "+label);
}
function startDemoTelemetry(){
 if(window.__devilEyeDemoTelemetryStarted)return;
 window.__devilEyeDemoTelemetryStarted=true;
 const pulses=[
  ["GLOBAL_VIEW","Synthetic dashboard telemetry refreshed"],
  ["RECON","Synthetic discovery queue heartbeat"],
  ["OSINT","Synthetic public-source index heartbeat"],
  ["VULNERABILITY","Synthetic advisory catalogue heartbeat"],
  ["OPERATIONS","Synthetic workflow scheduler heartbeat"],
  ["INTELLIGENCE","Synthetic correlation engine heartbeat"]
 ];
 let cursor=0;
 logDemoEvent("DEMO_SESSION_STARTED","Interactive synthetic session initialized");
 window.__devilEyeTelemetryTimer=setInterval(()=>{
  const event=pulses[cursor%pulses.length];cursor++;
  logDemoEvent("DEMO_TELEMETRY_PULSE",event[0]+" / "+event[1]);
 },12000);
}
function currentBind(){
 if(current()==="concept-library")return;
 insertWorkspace();
 ensureFilters();
 bindInteractiveSurfaces();
 const q=$("#workspace [data-local-search]");
 if(q&&!q.dataset.demoBound){
  q.dataset.demoBound="1";
  q.addEventListener("input",()=>{query=q.value;applyFilters();});
 }
}
async function renderQueue(){const box=$("#demo-task-queue");if(!box||!api())return;try{const st=await api().state(),items=st.tasks||[];const rows=items.map(t=>"<div class='demo-audit-item'><code>"+esc(t.id)+"</code><span><b>"+esc(t.title)+"</b><br><small>"+esc(t.module||"operations")+" · "+esc(t.execution||"SIMULATED / NO EXTERNAL ACTION")+"</small><br><span class='demo-status "+(/Approved/.test(t.state)?"approved":/Rejected|Cancelled/.test(t.state)?"rejected":"pending")+"'>"+esc(t.state)+"</span></span><span>"+(t.state==="Awaiting approval"?"<button class='demo-small-button' data-demo-decision='approve' data-task='"+esc(t.id)+"'>Approve demo</button> <button class='demo-small-button' data-demo-decision='reject' data-task='"+esc(t.id)+"'>Reject</button>":"")+(t.state!=="Cancelled"&&t.state!=="Rejected"?" <button class='demo-small-button' data-demo-cancel='"+esc(t.id)+"'>Cancel</button>":"")+"</span></div>").join("");box.innerHTML="<div class='demo-viz-heading'><b>WORKFLOW QUEUE / "+items.length+" TASKS</b><span>"+api().mode()+"</span></div><div class='demo-viz-body'>"+(rows||"<div class='demo-empty'>No demo tasks yet.</div>")+"</div>";}catch(e){toast(e.message);}}
async function renderDemoRecords(){
 const ws=$("#workspace");if(!ws||!api())return;
 let box=$(".demo-created-records",ws);
 try{
  const state=await api().state();
  const items=(state.records||[]).filter(r=>r.module===current());
  if(!items.length){if(box)box.remove();return;}
  if(!box){box=document.createElement("section");box.className="panel-card demo-created-records";ws.append(box);}
  box.innerHTML="<div class='panel-heading'><div><span class='panel-kicker'>PERSISTED DEMO STATE</span><h3>Operator-created records</h3></div><span class='demo-stamp'>"+items.length+" RECORDS</span></div><div class='demo-viz-body'>"+
   items.map(r=>"<div class='demo-audit-item'><code>"+esc(r.id)+"</code><span><b>"+esc(r.title)+"</b><br><small>"+esc(r.category||"Observation")+" · "+esc(r.notes||"")+"</small><br><span class='demo-status'>"+esc(r.status||"Needs review")+"</span></span><span><button class='demo-small-button' data-record-open='"+esc(r.id)+"'>Inspect</button> <button class='demo-small-button' data-record-review='"+esc(r.id)+"'>Mark reviewed</button> <button class='demo-small-button' data-record-delete='"+esc(r.id)+"'>Delete</button></span></div>").join("")+
   "</div>";
 }catch(err){toast(err.message);}
}
function openRecordDialog(){openDialog("Add demo observation","<form id='demo-record-form'><label class='demo-field'>Title<input name='title' required maxlength='180' placeholder='Certificate metadata reviewed'></label><label class='demo-field'>Category<input name='category' maxlength='100' placeholder='Domain / OSINT / Network'></label><label class='demo-field'>Status<select name='status'><option>Needs review</option><option>Verified source</option><option>Observed</option><option>Correlated</option><option>Archived</option></select></label><label class='demo-field'>Notes<textarea name='notes' maxlength='1200'></textarea></label><p class='demo-concept-note'>Synthetic record only. No external collection is performed.</p></form>","<button class='btn-primary' data-demo-submit='record' type='button'>Save demo record</button>");}
function openTaskDialog(){
 const groupItems=window.DevilEyeNavigation?window.DevilEyeNavigation.getGroups().flatMap(g=>g.items):[];
 const options=(groupItems.length?groupItems.filter(item=>item[0]!=="concept-library"):Object.keys(modules).map(id=>[id,id.replaceAll("-"," ")]))
  .map(item=>"<option value='"+esc(item[0])+"'>"+esc(item[1])+"</option>").join("");
 openDialog("Create simulated task","<form id='demo-task-form'><label class='demo-field'>Task title<input name='title' required maxlength='180' placeholder='Review public technology inventory'></label><label class='demo-field'>Workspace<select name='module'>"+options+"</select></label><label class='demo-field'>Task brief<textarea name='description' maxlength='900'></textarea></label><p class='demo-concept-note'>Approval changes only the demo workflow state. It never launches a scan, tool, agent or external request.</p></form>","<button class='btn-primary' data-demo-submit='task' type='button'>Create task ↗</button>");
}
function detail(row){const cells=$$("td",row).map(x=>x.textContent.trim()),heads=$$("th",row.closest("table")).map(x=>x.textContent.trim());lastDetail={cells,heads};const body="<div class='demo-record-grid'>"+cells.map((x,i)=>kv(esc(heads[i]||"FIELD "+i),esc(x))).join("")+"</div><p class='demo-concept-note'>Illustrative reference row. It is not a verified security finding.</p>";openDialog("Record details",body,"<button class='btn-primary' data-demo-copy>Copy row JSON</button>");}
async function showAudit(){const st=await api().state();const items=(st.audit||[]).slice(0,100);openDialog("Audit log","<p class='demo-concept-note'>Local demo events only. This is not a production security audit trail.</p><div class='demo-audit-list'>"+(items.map(x=>"<div class='demo-audit-item'><code>"+esc(x.action)+"</code><span>"+esc(x.detail)+"</span><time>"+esc(new Date(x.at).toLocaleString())+"</time></div>").join("")||"<div class='demo-empty'>No audit events.</div>")+"</div>","",true);}
async function exportState(){const st=await api().state();const data={notice:"SYNTHETIC DEMO DATA ONLY — NOT REAL SECURITY FINDINGS",project:"DEVIL EYE / R&D",page:current(),generatedAt:new Date().toISOString(),state:st};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="devil-eye-demo-"+current()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);await api().addAudit("DEMO_DATA_EXPORTED",current());toast("Demo state exported as JSON.");}
async function updateBadge(){const b=$("#demo-api-badge");if(!b)return;const s=await api().probe();b.classList.toggle("offline",!s.online);b.innerHTML="<i></i>"+(s.online?"LOCAL NODE DEMO API":"BROWSER LOCAL DEMO");}
async function onClick(e){const b=e.target.closest("[data-demo-page],[data-demo-action],[data-demo-open],[data-demo-close],[data-demo-submit],[data-demo-filter],[data-demo-port],[data-demo-review],[data-demo-decision],[data-demo-cancel],[data-concept-index],[data-map-point],[data-demo-entity],[data-demo-copy],[data-source-filter],[data-action],[data-toast],[data-record-review],[data-record-delete],[data-record-open],#osint-submit");if(!b)return;
 if(b.id==="osint-submit"){e.preventDefault();e.stopImmediatePropagation();const input=$("#osint-query");query=input?input.value.trim():"";statusFilter="ALL";applyFilters();const matches=$$("#workspace tbody tr").filter(r=>!r.classList.contains("hidden-row")).length;toast(matches+" matching local sample records. No external request was sent.");return;}
 if(b.dataset.action){e.preventDefault();e.stopImmediatePropagation();if(b.dataset.action==="demo-run"){openTaskDialog();return;}if(b.dataset.action==="add-target"){const modal=$("#target-modal");if(modal){modal.classList.add("open");modal.setAttribute("aria-hidden","false");$("#target-value")?.focus();}return;}if(b.dataset.action==="export"){exportState();return;}if(b.dataset.action==="filter"){ensureFilters();toast("Filter controls opened.");return;}if(b.dataset.action==="refresh"){await api().state();await renderQueue();await renderDemoRecords();toast("Demo workspace refreshed.");return;}}
 if(b.dataset.toast&&b.dataset.toast.includes("Panel menu")){e.preventDefault();e.stopImmediatePropagation();openDialog("Panel actions","<p class='demo-concept-note'>Actions apply to the current workspace's synthetic sample records.</p><div class='demo-card-grid'><button class='demo-small-button' data-demo-action='add-record'>＋ Add observation</button><button class='demo-small-button' data-demo-action='create-task'>＋ Create task</button><button class='demo-small-button' data-demo-action='export'>⇩ Export state</button></div>");return;}
 if(b.dataset.recordReview){try{await api().updateRecord(b.dataset.recordReview,{status:"Reviewed — demo"});await renderDemoRecords();toast("Demo record marked reviewed.");}catch(err){toast(err.message);}return;}
 if(b.dataset.recordOpen){
  try{const state=await api().state(),record=(state.records||[]).find(x=>x.id===b.dataset.recordOpen);if(!record)throw new Error("Demo record not found");
   openDialog("Demo record details","<div class='demo-record-grid'>"+Object.entries(record).map(([k,v])=>"<div class='demo-kv'><span>"+esc(k)+"</span><b>"+esc(typeof v==="object"?JSON.stringify(v):v)+"</b></div>").join("")+"</div>","",true);
  }catch(err){toast(err.message);}return;
 }
 if(b.dataset.recordDelete){
  if(confirm("Delete this synthetic demo record?")){try{await api().deleteRecord(b.dataset.recordDelete);await renderDemoRecords();toast("Demo record deleted.");}catch(err){toast(err.message);}}return;
 }

 if(b.hasAttribute("data-demo-close")){closeDialog();return;}
 if(b.dataset.demoPage){e.preventDefault();history.replaceState({page:"concept-library"},"","#concept-library");renderConceptLibrary();return;}
 if(b.dataset.demoOpen==="audit"){e.preventDefault();showAudit();return;}
 if(b.dataset.demoAction==="add-target"){e.preventDefault();const modal=$("#target-modal");if(modal){modal.classList.add("open");modal.setAttribute("aria-hidden","false");$("#target-value")?.focus();}return;}
 if(b.dataset.demoAction==="add-record"){e.preventDefault();if(current()==="targets"){const modal=$("#target-modal");if(modal){modal.classList.add("open");modal.setAttribute("aria-hidden","false");$("#target-value")?.focus();}}else openRecordDialog();return;}
 if(b.dataset.demoAction==="create-task"){e.preventDefault();openTaskDialog();return;}
 if(b.dataset.demoAction==="export"){e.preventDefault();exportState();return;}
 if(b.dataset.demoAction==="refresh"){e.preventDefault();await api().state();await renderQueue();await renderDemoRecords();toast("Workspace refreshed from the active demo store.");return;}
 if(b.dataset.demoAction==="reset"){e.preventDefault();if(confirm("Reset all synthetic demo state in the active demo store?")){await api().reset();await renderQueue();toast("Demo state reset.");}return;}
 if(b.dataset.demoSubmit){e.preventDefault();const form=b.dataset.demoSubmit==="record"?$("#demo-record-form"):$("#demo-task-form");if(!form||!form.reportValidity())return;const data=Object.fromEntries(new FormData(form).entries());try{if(b.dataset.demoSubmit==="record")await api().addRecord(Object.assign({module:current()},data));else await api().createTask(data);closeDialog();await api().addAudit("DEMO_WORKSPACE_UPDATED",current());await renderQueue();await renderDemoRecords();toast("Saved to demo store. No external action was performed.");}catch(err){toast(err.message);}return;}
 if(b.dataset.demoFilter){statusFilter=b.dataset.demoFilter;$$("[data-demo-filter]").forEach(x=>x.classList.toggle("active",x===b));applyFilters();return;}
 if(b.hasAttribute("data-source-filter")){const all=$$("[data-source-filter]");all.forEach(x=>x.classList.toggle("selected",x===b));const t=b.textContent.trim().toLowerCase();sourceFilter=/all sources/.test(t)?"all":/social/.test(t)?"social":/news/.test(t)?"news":/forum/.test(t)?"forums":/technical/.test(t)?"technical":/web pages/.test(t)?"web":"public";applyFilters();toast(sourceFilter==="all"?"Showing all local OSINT sources.":"Filtered OSINT demo sources: "+b.textContent.trim());return;}
 if(b.dataset.demoPort){const p=b.dataset.demoPort,box=$("#demo-port-info");if(box)box.innerHTML="<div class='demo-inspector'><span class='eyebrow'>PORT "+p+" / SYNTHETIC OBSERVATION</span><h4>"+([80,443,8080,8443].includes(+p)?"Sample service observed":"Reference port selected")+"</h4><p>Illustrative service metadata only. No packet or socket activity occurred.</p></div>";return;}
 if(b.dataset.demoReview){
  const label=b.dataset.demoReview;
  const details=b.textContent.trim().replace(/\s+/g," ").slice(0,800);
  try{await api().addAudit("DEMO_INSPECTOR_OPENED",label);}catch(_){}
  openDialog("Workspace inspector",
   "<div class='demo-inspector'><span class='eyebrow'>LOCAL DEMO / INSPECTOR</span><h4>"+esc(label)+"</h4><p>"+esc(details||"Synthetic workspace element.")+"</p><p style='margin-top:12px'>This item belongs to the current demo dataset. The inspector interaction is recorded in the local audit stream; no remote service or target was contacted.</p></div>"+
   "<div class='demo-dialog-actions' style='padding:12px 0 0;border:0'><button class='demo-small-button' data-demo-action='add-record'>＋ Add related observation</button><button class='demo-small-button' data-demo-action='create-task'>＋ Create review task</button></div>",
   "",false);
  return;
 }
 if(b.dataset.demoDecision){try{await api().decideTask(b.dataset.task,b.dataset.demoDecision);await renderQueue();toast("Demo task updated. No execution was triggered.");}catch(err){toast(err.message);}return;}
 if(b.dataset.demoCancel){try{await api().cancelTask(b.dataset.demoCancel);await renderQueue();toast("Demo task cancelled.");}catch(err){toast(err.message);}return;}
 if(b.dataset.conceptIndex!==undefined){
  const i=Number(b.dataset.conceptIndex),file=b.dataset.conceptFile,title=b.dataset.conceptTitle||("Concept "+i);
  if(!file || !/^[a-zA-Z0-9_.-]+\\.png$/.test(file)){toast("Invalid concept asset path.");return;}
  const src="./concept/"+encodeURIComponent(file);
  openDialog(title,"<img src='"+src+"' alt='"+esc(title)+"' style='display:block;width:100%;height:auto;border:1px solid #2d3b49;background:#05080d'><p class='demo-concept-note'>Original source image · concept/"+esc(file)+" · preserved unchanged.</p>","<a class='btn-secondary' href='"+src+"' target='_blank' rel='noreferrer'>Open original ↗</a>",true);
  return;
 }
 if(b.dataset.mapPoint){const box=$("#demo-geo-inspector");if(box){box.innerHTML="<div class='demo-inspector'><span class='eyebrow'>SYNTHETIC SIGNAL</span><h4>"+esc(b.dataset.mapPoint)+"</h4><p>"+esc(b.dataset.mapLocation||"")+" · "+esc(b.dataset.mapDetail||"")+" · No live geolocation was queried.</p></div>";}else{toast((b.dataset.mapLocation||b.dataset.mapPoint)+" · "+(b.dataset.mapDetail||"demo marker")+" · synthetic only");}$$(".world-map-point").forEach(x=>x.classList.toggle("selected",x===b));return;}
 if(b.dataset.demoEntity){const box=$("#demo-rel-inspector");if(box)box.innerHTML="<div class='demo-inspector'><span class='eyebrow'>ENTITY / SAMPLE GRAPH</span><h4>"+esc(b.dataset.demoEntity)+"</h4><p>Illustrative entity. Confidence and provenance require human review.</p></div>";return;}
 if(b.hasAttribute("data-demo-copy")&&lastDetail){const obj={};lastDetail.heads.forEach((h,i)=>obj[h]=lastDetail.cells[i]);try{await navigator.clipboard.writeText(JSON.stringify(obj,null,2));toast("Row JSON copied.");}catch{toast(JSON.stringify(obj));}return;}
}
async function onSubmit(e){if(e.target.id==="target-form"){e.preventDefault();e.stopImmediatePropagation();const value=$("#target-value").value.trim(),type=$("#target-type").value,authorized=$("#target-authorized").checked;if(!authorized){toast("Confirm authorization before saving this demo scope record.");return;}if(!value||/\s/.test(value)){toast("Enter a valid asset identifier.");return;}try{await api().addRecord({module:"targets",title:value,category:type,status:"In scope — demo",authorized:true,notes:"Operator confirmed authorization in demo UI."});const old=JSON.parse(localStorage.getItem("rd-demo-targets")||"[]");old.unshift({value,type,createdAt:new Date().toISOString()});localStorage.setItem("rd-demo-targets",JSON.stringify(old.slice(0,30)));$("#target-modal").classList.remove("open");e.target.reset();await renderDemoRecords();toast("Demo scope record saved. No connection was made.");}catch(err){toast(err.message);}return;}}
function init(){const overlay=document.createElement("div");overlay.id="demo-overlay";overlay.className="demo-overlay";overlay.setAttribute("aria-hidden","true");document.body.append(overlay);
 const ws=$("#workspace");if(ws)new MutationObserver(()=>{if(current()!=="concept-library")currentBind();}).observe(ws,{childList:true});
 const side=$("#sidebar-groups");if(side)new MutationObserver(addSidebar).observe(side,{childList:true});
 document.addEventListener("click",onClick,true);document.addEventListener("submit",onSubmit,true);
 document.addEventListener("click",e=>{const r=e.target.closest("#workspace tbody tr");if(r&&!e.target.closest("button,a,input,select"))detail(r);});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDialog();if(e.key==="Enter"&&e.target.id==="osint-query"){e.preventDefault();e.stopImmediatePropagation();query=e.target.value;statusFilter="ALL";applyFilters();toast("Filtered local sample records. No external search was sent.");}},true);
 document.addEventListener("keydown",e=>{
  if((e.key==="Enter"||e.key===" ") && e.target.matches('[role="button"][data-demo-surface]')){
   e.preventDefault();e.target.click();
  }
 });
 document.addEventListener("input",e=>{if(e.target.matches("[data-local-search]")){query=e.target.value;applyFilters();}});
 
 addSidebar();if(current()==="concept-library")renderConceptLibrary();else currentBind();updateBadge();
}
window.addEventListener("hashchange",()=>{if(current()==="concept-library")renderConceptLibrary();else currentBind();});
document.addEventListener("DOMContentLoaded",init);
})();