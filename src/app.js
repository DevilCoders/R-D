/* DEVIL EYE R&D — interactive UI prototype.
   This file is the presentation layer; real services are deliberately not simulated. */
(function () {
  "use strict";
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const safe = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const glyph = {dashboard:"▦",targets:"◎",recon:"⌕",osint:"◎",domain:"▤",network:"⌘",social:"♧",geo:"⌖",tech:"⬡",surface:"◉",deep:"♆",dark:"◈",vuln:"⌁",exploit:"⚒",security:"⛨",operations:"⌘",post:"↗",privilege:"♢",lateral:"⇄",persistence:"◈",reports:"▤",intelligence:"⌬",threat:"◉",knowledge:"▤",settings:"⚙"};
  const navGroups = [
    {id:"global",label:"GLOBAL VIEW",icon:"dashboard",items:[["dashboard","Dashboard","dashboard"],["targets","Targets","targets"]]},
    {id:"recon",label:"RECON",icon:"recon",items:[["reconnaissance","Reconnaissance","recon"],["osint-search","OSINT Search","osint"],["domain-analysis","Domain Analysis","domain"],["ip-analysis","IP / Port / MAC Analysis","network"],["network-mapping","Network Mapping","network"],["social-intelligence","Social Intelligence","social"],["geolocation","Geolocation","geo"],["tech-stack","Tech Stack","tech"]]},
    {id:"web",label:"WEB INTELLIGENCE",icon:"surface",items:[["surface-web","Surface Web","surface"],["deep-web","Deep Web","deep"],["dark-web","Dark Web","dark"]]},
    {id:"vulnerability",label:"VULNERABILITY",icon:"vuln",items:[["vuln-scan","Vulnerability Scan","vuln"],["exploit-search","Exploit Search","exploit"],["security-analysis","Security Analysis","security"]]},
    {id:"operations",label:"OPERATIONS",icon:"operations",items:[["operations","Operations","operations"],["post-exploitation","Post Exploitation","post"],["privilege-escalation","Privilege Escalation","privilege"],["lateral-movement","Lateral Movement","lateral"],["persistence-review","Persistence Review","persistence"]]},
    {id:"intelligence",label:"INTELLIGENCE",icon:"intelligence",items:[["intelligence","Intelligence Fusion","intelligence"],["threat-feed","Threat Feed","threat"],["knowledge-base","Knowledge Base","knowledge"],["reports","Reports & Evidence","reports"]]},
    {id:"system",label:"SYSTEM",icon:"settings",items:[["settings","Settings","settings"]]}
  ];
  const topNav = [["dashboard","GLOBAL VIEW","dashboard"],["targets","TARGETS","targets"],["operations","OPERATIONS","operations"],["intelligence","INTELLIGENCE","intelligence"],["threat-feed","THREAT FEED","threat"]];
  const iconAliases = {"threat-feed":"threat","concept-library":"knowledge"};
  function iconFor(key){return glyph[key] || glyph[iconAliases[key]] || "◦";}
  let navExpanded = {};
  try { navExpanded = JSON.parse(localStorage.getItem("rd-nav-expanded") || "{}") || {}; } catch (_) { navExpanded = {}; }
  const pages = {
    dashboard:["Global View","COMMAND CENTER / 00","A unified operational picture across authorized research, assessment, and intelligence work.","GLOBAL OVERVIEW","overview"],
    targets:["Targets","SCOPE MANAGEMENT / 01","A structured registry of approved assets, scope boundaries, exclusions, and ownership.","TARGET REGISTRY","targets"],
    reconnaissance:["Reconnaissance","DISCOVERY / 02","Build a verified picture of the external and internal attack surface before assessment begins.","RECONNAISSANCE","recon"],
    "osint-search":["OSINT Search","OPEN SOURCE INTELLIGENCE / 03","Search, correlate, and preserve publicly available information with source provenance.","OPEN SOURCE INTELLIGENCE","osint"],
    "domain-analysis":["Domain Analysis","DOMAIN INTELLIGENCE / 04","Review DNS, registration context, certificate history, related infrastructure, and technology signals.","DOMAIN INTELLIGENCE","domain"],
    "ip-analysis":["IP / Port / MAC Analysis","NETWORK IDENTIFIERS / 05","Normalize network identifiers and inspect observed services, ownership context, and relationships.","NETWORK ASSET ANALYSIS","ip"],
    "network-mapping":["Network Mapping","INFRASTRUCTURE GRAPH / 06","Explore asset relationships and topology using explicitly supplied or authorized observations.","NETWORK TOPOLOGY","network"],
    "social-intelligence":["Social Intelligence","PUBLIC SOCIAL SIGNALS / 07","Analyze public profiles, topics, mentions, and relationships while retaining source context.","SOCIAL INTELLIGENCE","social"],
    geolocation:["Geolocation","GEO INTELLIGENCE / 08","Visualize location signals from authorized public sources with confidence, timestamps, and provenance.","GEO INTELLIGENCE","geo"],
    "tech-stack":["Tech Stack","TECHNOLOGY FINGERPRINTING / 09","Map frameworks, services, platforms, and version signals to understand technology exposure.","TECH STACK INTELLIGENCE","tech"],
    "surface-web":["Surface Web","WEB INTELLIGENCE / 10","Organize indexed public-web content, domains, publications, and observable changes.","SURFACE WEB INTELLIGENCE","surface"],
    "deep-web":["Deep Web","RESEARCH COLLECTIONS / 11","A controlled research workspace for catalogued non-indexed resources and privacy-preserving source review.","DEEP WEB INTELLIGENCE","deep"],
    "dark-web":["Dark Web","THREAT EXPOSURE MONITORING / 12","Review vetted threat reporting, public exposure indicators, and source analysis without interacting with illicit services.","DARK WEB MONITORING","dark"],
    "vuln-scan":["Vulnerability Scan","EXPOSURE VALIDATION / 13","Plan controlled scans, review verified findings, and track remediation with clear evidence.","VULNERABILITY MANAGEMENT","vuln"],
    "exploit-search":["Exploit Search","VULNERABILITY RESEARCH / 14","Correlate advisories, CVEs, affected versions, mitigations, and defensive validation context.","EXPLOIT INTELLIGENCE","exploit"],
    "security-analysis":["Security Analysis","FINDING VALIDATION / 15","Review attack paths, control gaps, evidence quality, and remediation priorities.","SECURITY ANALYSIS","security"],
    operations:["Operations","ASSESSMENT ORCHESTRATION / 16","Coordinate authorized work, agent assignments, approvals, and execution state from one workspace.","OPERATIONS CONTROL","operations"],
    "post-exploitation":["Post Exploitation","POST-ENGAGEMENT REVIEW / 17","Document authorized post-engagement observations, impact evidence, and remediation validation.","POST-ENGAGEMENT REVIEW","post"],
    "privilege-escalation":["Privilege Escalation","PRIVILEGE CONTROL REVIEW / 18","Assess privilege boundaries and document verified control weaknesses within the approved scope.","PRIVILEGE BOUNDARY REVIEW","privilege"],
    "lateral-movement":["Lateral Movement","SEGMENTATION REVIEW / 19","Review segmentation assumptions, identity paths, and verified trust relationships without autonomous propagation.","SEGMENTATION & TRUST REVIEW","lateral"],
    "persistence-review":["Persistence Review","ENDPOINT CONTROL REVIEW / 20","Review persistence-related detections and endpoint controls using approved test evidence and defensive telemetry.","ENDPOINT CONTROL REVIEW","persistence"],
    intelligence:["Intelligence","INTELLIGENCE FUSION / 21","Connect observations, knowledge, context, and model-assisted analysis in a traceable workspace.","INTELLIGENCE FUSION","intelligence"],
    "threat-feed":["Threat Feed","LIVE INTELLIGENCE / 22","A normalized feed of advisories, indicators, public reporting, and research updates.","THREAT INTELLIGENCE FEED","threat"],
    "knowledge-base":["Knowledge Base","RESEARCH KNOWLEDGE / 23","Maintain versioned security knowledge, references, findings, and relationships with provenance.","KNOWLEDGE BASE","knowledge"],
    reports:["Reports & Evidence","DELIVERY / 24","Preserve the chain from observation to evidence, validated finding, and stakeholder-ready report.","REPORTING & EVIDENCE","reports"],
    settings:["Settings","SYSTEM CONFIGURATION / 25","Configure prototype preferences, workspace behavior, and future integration boundaries.","SYSTEM SETTINGS","settings"]
  };
  const metricSets = {
    dashboard:[["ACTIVE WORKSPACES","08","Across this demo"],["ASSETS IN SCOPE","024","Sample inventory"],["OPEN FINDINGS","08","Illustrative only"],["EVIDENCE ITEMS","036","Local demo records"]],
    targets:[["REGISTERED ASSETS","024","Sample inventory"],["IN SCOPE","018","Demo records"],["EXCLUDED","006","Protected boundary"],["SCOPE REVIEWS","03","Pending review"]],
    reconnaissance:[["DISCOVERED ASSETS","124","Illustrative records"],["DOMAINS","038","Sample inventory"],["NETWORK RANGES","012","Sample inventory"],["LAST COLLECTION","09:42","Demo timestamp"]],
    "osint-search":[["SOURCES INDEXED","8,754","Demo catalog"],["NEW MENTIONS","1,248","Illustrative"],["ACTIVE FEEDS","142","Demo configuration"],["LAST UPDATE","14:37","Demo timestamp"]],
    "domain-analysis":[["DOMAINS TRACKED","038","Sample records"],["DNS RECORDS","264","Demo snapshot"],["CERTIFICATES","019","Sample records"],["RELATED HOSTS","072","Illustrative"]],
    "ip-analysis":[["IP OBSERVATIONS","086","Demo data"],["SERVICE PORTS","214","Sample inventory"],["MAC RECORDS","031","Demo data"],["NETWORKS","012","Sample inventory"]],
    "network-mapping":[["MAPPED NODES","086","Sample graph"],["RELATIONSHIPS","142","Illustrative"],["NETWORK SEGMENTS","012","Demo data"],["UNRESOLVED LINKS","007","Sample status"]],
    "social-intelligence":[["PUBLIC PROFILES","428","Demo catalog"],["MENTIONS","1,842","Illustrative"],["TOPIC CLUSTERS","024","Sample analysis"],["SOURCE CHANNELS","016","Demo configuration"]],
    geolocation:[["GEO OBSERVATIONS","642","Demo records"],["REGIONS","018","Sample map"],["HIGH CONFIDENCE","74%","Illustrative"],["RECENT SIGNALS","032","Demo window"]],
    "tech-stack":[["TECH SIGNATURES","286","Demo catalog"],["PLATFORMS","042","Sample data"],["VERSION SIGNALS","118","Illustrative"],["UNVERIFIED","016","Review queue"]],
    "surface-web":[["INDEXED SOURCES","12,470","Demo catalog"],["PAGES OBSERVED","84.2K","Illustrative"],["NEW RESULTS","1,243","Demo window"],["ACTIVE WATCHES","036","Sample setup"]],
    "deep-web":[["CATALOGUED SOURCES","124","Sample catalog"],["COLLECTIONS","018","Demo records"],["REVIEW QUEUE","012","Illustrative"],["SOURCE HEALTH","98%","Demo metric"]],
    "dark-web":[["MONITORED SOURCES","148","Demo catalog"],["MENTION ALERTS","042","Illustrative"],["EXPOSURE REPORTS","009","Sample records"],["SOURCE STATUS","ONLINE","Demo status"]],
    "vuln-scan":[["ASSESSED ASSETS","018","Demo records"],["CRITICAL","002","Sample findings"],["HIGH","008","Sample findings"],["REMEDIATION","64%","Illustrative"]],
    "exploit-search":[["ADVISORIES","286","Demo catalog"],["CVEs TRACKED","1,420","Sample data"],["AFFECTED TECH","042","Illustrative"],["REVIEW NEEDED","018","Demo queue"]],
    "security-analysis":[["ANALYSIS CASES","024","Demo records"],["VALIDATED","016","Sample cases"],["NEEDS REVIEW","005","Demo queue"],["EVIDENCE COVERAGE","92%","Illustrative"]],
    operations:[["WORKFLOWS","008","Demo configuration"],["AGENTS READY","012","Illustrative"],["APPROVALS WAITING","002","Demo queue"],["COMPLETED TASKS","036","Sample activity"]],
    intelligence:[["KNOWLEDGE NODES","2,846","Demo graph"],["RELATIONSHIPS","8,412","Illustrative"],["CORRELATIONS","128","Sample results"],["MODEL STATUS","LOCAL DEMO","Not connected"]],
    "threat-feed":[["ACTIVE FEEDS","042","Demo sources"],["NEW INDICATORS","128","Illustrative"],["HIGH PRIORITY","007","Sample alerts"],["LAST SYNC","14:37","Demo timestamp"]],
    reports:[["REPORTS","012","Demo records"],["EVIDENCE ITEMS","236","Sample records"],["DRAFTS","003","Demo queue"],["EXPORTED","009","Illustrative"]],
    "knowledge-base":[["KNOWLEDGE RECORDS","1,842","Demo records"],["REFERENCES","428","Sample catalog"],["FRAMEWORKS","006","Illustrative"],["REVIEW QUEUE","014","Demo queue"]]
  };
  const dataRows = {
    reconnaissance:[["AST-001","portal.example.test","Domain / HTTPS","Observed","09:42"],["AST-002","api.example.test","API endpoint","Observed","09:38"],["AST-003","198.51.100.24","Documentation IP range","In scope","09:31"],["AST-004","mail.example.test","Mail gateway","Review","09:26"]],
    "osint-search":[["OSINT-2418","Public security advisory","Vendor bulletin","Verified source","2 min"],["OSINT-2417","Organization press release","Official website","Collected","8 min"],["OSINT-2416","Public code reference","Code repository","Needs review","14 min"],["OSINT-2415","Public DNS change","Technical source","Correlated","22 min"],["OSINT-2414","Public researcher post","Social media","Collected","30 min"],["OSINT-2413","Public incident news report","News & media","Source reviewed","38 min"],["OSINT-2412","Public forum thread","Forums","Needs review","46 min"],["OSINT-2411","Public corporate filing","Public records","Verified source","52 min"]],
    "domain-analysis":[["example.test","A / AAAA","198.51.100.24","Passive observation","Current"],["example.test","MX","mail.example.test","DNS record","Current"],["www.example.test","TLS","Certificate metadata","Public source","Current"],["api.example.test","CNAME","edge.example.test","DNS record","Review"]],
    "ip-analysis":[["198.51.100.24","HTTPS / 443","TCP","Documentation range","Observed"],["203.0.113.18","SSH / 22","TCP","Documentation range","Review"],["192.0.2.40","DNS / 53","UDP","Documentation range","Observed"],["00:11:22:33:44:55","MAC sample","Ethernet","Locally supplied","Imported"]],
    "social-intelligence":[["PROFILE-021","Public researcher profile","Professional network","Public","09:42"],["MENTION-118","Product security discussion","Public forum","Collected","09:37"],["TOPIC-042","Patch Tuesday","Public posts","Correlated","09:31"],["ENTITY-016","Organization reference","Public profile","Needs review","09:24"]],
    "tech-stack":[["Web server","Nginx","Service fingerprint","High confidence","Observed"],["Application","Node.js","Header / content clue","Medium","Review"],["Frontend","React","Asset signature","Medium","Review"],["TLS","TLS 1.3","Certificate metadata","High confidence","Observed"]],
    "surface-web":[["SRC-1042","Vendor security bulletin","vendor.example.test","Advisory","2 min"],["SRC-1041","Public documentation","docs.example.test","Documentation","9 min"],["SRC-1040","Research article","research.example.test","Research","16 min"],["SRC-1039","Public repository release","code.example.test","Release note","24 min"]],
    "deep-web":[["COL-018","Academic repository index","Catalogued resource","Reviewed","10 min"],["COL-017","Public archive catalog","Research archive","Reviewed","22 min"],["COL-016","Specialist discussion index","Public community","Needs review","34 min"],["COL-015","Historical web collection","Reference archive","Reviewed","48 min"]],
    "dark-web":[["SRC-148","Vetted threat report","Threat research","Source only","4 min"],["SRC-147","Public breach notification","Official disclosure","Verified","18 min"],["SRC-146","Security vendor analysis","Research report","Verified","31 min"],["SRC-145","Public incident advisory","CERT bulletin","Verified","45 min"]],
    "vuln-scan":[["FND-008","Outdated component version","High","CVE reference available","Needs validation"],["FND-007","Missing security header","Medium","HTTP response evidence","Verified"],["FND-006","Weak TLS configuration","Medium","TLS observation","Verified"],["FND-005","Exposed test endpoint","Low","Scope review required","Needs review"]],
    "exploit-search":[["CVE-2026-1042","Example component issue","Vendor advisory","Affected versions under review","Research"],["CVE-2026-0921","TLS library advisory","Vendor bulletin","Patch status tracked","Verified"],["CVE-2025-7712","Framework vulnerability","NVD reference","Version mapping incomplete","Review"],["CVE-2025-6630","Service configuration issue","CERT bulletin","Mitigation published","Verified"]],
    "security-analysis":[["CASE-024","Publicly exposed admin route","Access control","Evidence attached","Review"],["CASE-023","Certificate policy gap","Transport security","Verified observation","Open"],["CASE-022","Dependency risk","Software composition","Advisory correlated","Open"],["CASE-021","Asset ownership ambiguity","Scope integrity","Owner confirmation needed","Blocked"]],
    operations:[["OP-008","External surface review","Recon team","Awaiting approval","09:42"],["OP-007","Technology inventory","Asset intel","Running · demo","09:36"],["OP-006","Finding verification","Validation","Queued","09:22"],["OP-005","Evidence packaging","Reporting","Completed","09:10"]],
    intelligence:[["INT-128","Asset ↔ certificate correlation","Infrastructure","0.94 confidence","New"],["INT-127","Domain ↔ technology signal","Technology","0.87 confidence","Reviewed"],["INT-126","Advisory ↔ affected version","Vulnerability","0.91 confidence","New"],["INT-125","Public mention ↔ entity","OSINT","0.78 confidence","Review"]],
    "threat-feed":[["ADV-042","Vendor security advisory published","Advisory","Verified source","3 min"],["THR-041","Public incident report updated","Incident report","Source reviewed","12 min"],["IOC-040","Indicator reference added","Threat research","Needs enrichment","18 min"],["CVE-039","Vulnerability bulletin revised","CVE advisory","Correlated","26 min"]],
    "knowledge-base":[["ATT&CK Enterprise","Technique reference","Framework","Versioned reference","Current"],["CVE catalog","Vulnerability record","Advisory","External reference","Demo sync"],["CWE catalog","Weakness taxonomy","Classification","Versioned reference","Current"],["Internal research","Finding record","Evidence","Provenance retained","Review"]],
    reports:[["RPT-012","External attack surface assessment","Draft","12 evidence items","Today"],["RPT-011","Technology inventory","Review","24 assets","Yesterday"],["RPT-010","Vulnerability validation summary","Approved","8 findings","Nov 09"],["RPT-009","OSINT collection log","Archived","36 references","Nov 08"]],
    "post-exploitation":[["PE-008","Approved test evidence","Impact review","Evidence attached","Review"],["PE-007","Control effectiveness notes","Detection review","Telemetry captured","Verified"],["PE-006","Remediation retest","Validation","Awaiting owner","Queued"]],
    "privilege-escalation":[["PRV-006","Role boundary review","Identity control","Evidence recorded","Review"],["PRV-005","Local policy validation","Host control","No exploit performed","Verified"],["PRV-004","Service account exposure","Configuration","Owner confirmation","Queued"]],
    "lateral-movement":[["LAT-004","Network segmentation review","Network control","Diagram attached","Review"],["LAT-003","Identity trust mapping","Identity control","Relationship evidence","Verified"],["LAT-002","Admin boundary check","Access control","Scope-limited notes","Queued"]],
    "persistence-review":[["PER-004","Startup entry audit","Endpoint control","Telemetry evidence","Reviewed"],["PER-003","Service inventory review","Endpoint control","Change history","Verified"],["PER-002","Detection coverage check","Defensive control","Rule reference","Queued"]]
  };
  const activities = [
    ["DISCOVERY","New asset observation recorded","2 min ago","red"],
    ["INTELLIGENCE","Source relationship correlated","8 min ago","blue"],
    ["VALIDATION","Evidence package updated","14 min ago","green"],
    ["OPERATIONS","Approval request created","21 min ago","amber"]
  ];
  let activePage = "dashboard";
  let activeTop = "dashboard";
  let toastTimer;
  function savedTargets(){try{return JSON.parse(localStorage.getItem("rd-demo-targets")||"[]");}catch(e){return [];}}
  function renderSidebar(){
    const container=$("#sidebar-groups");
    container.innerHTML=navGroups.map(group=>{
      const hasActive=group.items.some(item=>activePage===item[0]);
      const expanded=navExpanded[group.id]===undefined ? true : navExpanded[group.id]===true;
      return '<section class="nav-group" data-nav-group="'+safe(group.id)+'">'+
        '<button type="button" class="nav-group-toggle" data-nav-toggle="'+safe(group.id)+'" aria-expanded="'+String(expanded)+'">'+
          '<span class="nav-group-icon">'+iconFor(group.icon)+'</span><span>'+safe(group.label)+'</span>'+
          '<span class="nav-group-count">'+String(group.items.length).padStart(2,"0")+'</span><span class="nav-chevron">⌄</span>'+
        '</button>'+
        '<div class="nav-children" data-nav-children="'+safe(group.id)+'" '+(expanded?"":"hidden")+'>'+
          group.items.map(item=>{
            const isActive=activePage===item[0] || (item[3]==="demo" && location.hash.slice(1)===item[0]),isDemo=item[3]==="demo";
            const targetAttr=isDemo?' data-demo-page="'+safe(item[0])+'"':' data-page="'+safe(item[0])+'"';
            return '<button type="button" class="side-link '+(isActive?"active":"")+'"'+targetAttr+' aria-current="'+(isActive?"page":"false")+'">'+
              '<span class="side-icon">'+iconFor(item[2])+'</span><span>'+safe(item[1])+'</span>'+
              (isActive?'<i class="side-active-indicator"></i>':'')+
            '</button>';
          }).join("")+
        '</div></section>';
    }).join("");
  }
  function renderTop(){
    $("#top-nav").innerHTML=topNav.map(item=>'<button type="button" class="top-link '+(activeTop===item[0]?"active":"")+'" data-top-page="'+safe(item[0])+'"><span>'+iconFor(item[2]||item[0])+'</span>'+safe(item[1])+'</button>').join("");
  }
  function setTopForPage(id){
    const map={targets:"targets",operations:"operations","post-exploitation":"operations","privilege-escalation":"operations","lateral-movement":"operations","persistence-review":"operations",intelligence:"intelligence","knowledge-base":"intelligence",reports:"operations","threat-feed":"threat-feed"};
    activeTop=map[id]||"dashboard";renderTop();
  }
  function metrics(id){
    const items=metricSets[id]||metricSets.reconnaissance;
    return '<div class="metric-grid">'+items.map((m,i)=>'<article class="metric-card"><div class="metric-top"><span>'+m[0]+'</span><i class="metric-mark '+["red","blue","purple","green"][i]+'"></i></div><strong>'+m[1]+'</strong><small>'+m[2]+'</small><div class="metric-spark '+["red","blue","purple","green"][i]+'"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></article>').join("")+'</div>';
  }
  function panel(title,kicker,body,extra){
    return '<section class="panel-card"><div class="panel-heading"><div><span class="panel-kicker">'+kicker+'</span><h3>'+title+'</h3></div><button class="icon-button" type="button" data-toast="Panel menu is a prototype control.">···</button></div>'+body+(extra||"")+'</section>';
  }
  function tone(value){
    const v=String(value).toLowerCase();
    if(/verified|current|ready|completed|observed|reviewed|approved|online/.test(v))return "good";
    if(/critical|high|blocked|paused|awaiting/.test(v))return "danger";
    if(/review|queued|medium|draft|running|new|research/.test(v))return "warning";
    return "neutral";
  }
  function table(rows,headers){
    const h=headers||["REFERENCE","OBSERVATION","CATEGORY","SOURCE / STATUS","UPDATED"];
    return '<div class="table-wrap"><table><thead><tr>'+h.map(x=>'<th>'+x+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr><td><span class="row-id">'+safe(row[0])+'</span></td>'+row.slice(1).map((cell,i)=>'<td>'+(i===row.length-2?'<span class="status-pill '+tone(cell)+'">'+safe(cell)+'</span>':safe(cell))+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
  }
  function activityPanel(title){
    return panel(title||"Recent activity","ACTIVITY STREAM",activities.map(a=>'<div class="activity-row"><span class="activity-bullet '+a[3]+'"></span><div><strong>'+a[0]+'</strong><p>'+a[1]+'</p></div><time>'+a[2]+'</time></div>').join(""));
  }
  function worldMap(){
    const points=[
      ["NEW YORK","29.4%","27.8%","New York · North America","Public-source demo signal","14"],
      ["LONDON","50%","21.7%","London · Europe","Research-source demo signal","22"],
      ["TALLINN","56.7%","17.2%","Tallinn · Northern Europe","Infrastructure-context demo signal","9"],
      ["SINGAPORE","78.9%","49.4%","Singapore · Asia Pacific","Public advisory demo signal","18"],
      ["TOKYO","88.6%","30.6%","Tokyo · East Asia","Threat-report demo signal","11"],
      ["SÃO PAULO","24.7%","62.3%","São Paulo · South America","Public research demo signal","6"]
    ];
    return '<div class="world-map world-map-real"><img src="./assets/world-map.svg" alt="Complete world political map with country boundaries" loading="eager"><div class="world-map-points">'+points.map(p=>'<button type="button" class="world-map-point" style="left:'+p[1]+';top:'+p[2]+'" data-map-point="'+p[0]+'" data-map-location="'+p[3]+'" data-map-detail="'+p[4]+'" data-map-count="'+p[5]+'" aria-label="'+p[0]+' demo signal marker"><i></i><span>'+p[0]+'</span></button>').join("")+'</div><div class="world-map-overlay-label">WORLD / ALL REGIONS / SYNTHETIC SIGNALS</div><div class="world-map-scale mono">180°W <span>90°W</span> 0° <span>90°E</span> 180°E</div><div class="map-caption mono">FULL WORLD / COUNTRY OUTLINES / LOCAL DEMO DATA — NOT LIVE GEOLOCATION</div></div>';
  }
  function pageHeading(id,action){
    const p=pages[id];
    return '<div class="workspace-hero"><div><span class="section-kicker">'+p[1]+'</span><h2>'+p[0]+' <span class="text-gradient">workspace.</span></h2><p>'+p[2]+'</p></div>'+(action||'<span class="demo-stamp">PROTOTYPE / SAMPLE DATA</span>')+'</div>';
  }
  function overview(){
    return '<div class="workspace-hero overview-hero"><div><span class="section-kicker">'+pages.dashboard[1]+'</span><h2>See the <span class="text-gradient">whole picture.</span></h2><p>'+pages.dashboard[2]+'</p></div><span class="scope-badge"><i></i> DEMO WORKSPACE / NO LIVE TARGETS</span></div>'+metrics("dashboard")+
      '<div class="content-grid main-content-grid">'+
      panel("Attack surface overview","ASSET RELATIONSHIP MAP",worldMap(),'<div class="panel-foot"><span><i class="legend-dot red"></i> Assets</span><span><i class="legend-dot blue"></i> Relationships</span><span class="mono">SAMPLE GRAPH</span></div>')+
      panel("Operational pulse","SYSTEM ACTIVITY",activities.map(a=>'<div class="activity-row"><span class="activity-bullet '+a[3]+'"></span><div><strong>'+a[0]+'</strong><p>'+a[1]+'</p></div><time>'+a[2]+'</time></div>').join("")+'<div class="panel-action"><button class="text-button" data-page="threat-feed">Open threat feed ↗</button></div>')+
      '</div><div class="content-grid lower-content-grid">'+
      panel("Recent asset observations","DISCOVERY / SAMPLE",table(dataRows.reconnaissance,["ASSET ID","HOST / IDENTIFIER","TYPE","SCOPE STATUS","UPDATED"]))+
      panel("Module health","WORKSPACE STATUS",["Reconnaissance","Evidence store","Policy gate","Model services"].map((x,i)=>'<div class="health-row"><span>'+x+'</span><span class="status-pill '+(i===3?"neutral":"good")+'">'+(i===3?"Not connected":"Demo ready")+'</span></div>').join(""))+
      '</div>';
  }
  function targetsPage(){
    const base=[["TGT-018","portal.example.test","Domain","In scope","Owner confirmed"],["TGT-017","api.example.test","API","In scope","Owner confirmed"],["TGT-016","198.51.100.24","Documentation IP range","In scope","Sample only"],["TGT-015","legacy.example.test","Domain","Excluded","Explicit exclusion"]];
    const saved=savedTargets().map((x,i)=>["LOCAL-"+String(i+1).padStart(3,"0"),x.value,x.type,"Local demo scope","User entered"]);
    return pageHeading("targets",'<button class="btn-primary" data-action="add-target">＋ Add in-scope asset</button>')+metrics("targets")+
      '<div class="scope-warning"><span>⛨</span><div><strong>Scope gate is a core product requirement.</strong><p>Only explicitly approved assets belong in an engagement. This prototype stores entries locally and does not contact targets or execute scans.</p></div></div>'+
      panel("Asset registry","SCOPE / INVENTORY",table(saved.concat(base),["TARGET ID","ASSET","TYPE","SCOPE","OWNER / PROVENANCE"]))+
      '<div class="content-grid lower-content-grid">'+panel("Scope checklist","BEFORE AN ENGAGEMENT",["Written authorization recorded","Asset ownership confirmed","Allowed methods and rate limits defined","Excluded systems documented","Emergency stop contact available"].map(t=>'<div class="check-row"><span class="check-box">✓</span>'+t+'</div>').join(""))+
      panel("Boundary controls","POLICY ENFORCEMENT",["Explicit allow-list","Out-of-scope deny by default","Approval-bound actions","Immutable activity log"].map(t=>'<div class="health-row"><span>'+t+'</span><span class="status-pill good">Required</span></div>').join(""))+'</div>';
  }
  const workflows={
    reconnaissance:["Passive discovery","DNS & certificate context","Asset relationships","Change monitoring"],
    "osint-search":["Person and organization search","Public source review","Mention correlation","Source preservation"],
    "domain-analysis":["DNS record review","Certificate transparency","Registration context","Related domains"],
    "ip-analysis":["Address normalization","Port observations","Service context","MAC inventory"],
    "network-mapping":["Asset relationship graph","Segment visualization","Observed trust paths","Evidence references"],
    "social-intelligence":["Public profile context","Mention monitoring","Topic clustering","Entity relationships"],
    geolocation:["Public location context","Signal confidence","Time and source attribution","Regional aggregation"],
    "tech-stack":["Web technologies","Runtime and frameworks","TLS and protocols","Version confidence"],
    "surface-web":["Search indexed pages","Monitor public sources","Track domain changes","Preserve source citations"],
    "deep-web":["Curated catalog","Archive references","Research collections","Source review queue"],
    "dark-web":["Vetted threat research","Public breach notices","Exposure mentions","Source tracking"],
    "vuln-scan":["Scan planning","Finding triage","Evidence validation","Remediation tracking"],
    "exploit-search":["CVE and advisory search","Affected version mapping","Vendor mitigation notes","Patch status"],
    "security-analysis":["Attack path review","Control validation","Evidence quality","Risk prioritization"],
    "post-exploitation":["Approved test evidence","Impact review","Detection validation","Remediation notes"],
    "privilege-escalation":["Identity boundary review","Local policy validation","Role separation","Evidence references"],
    "lateral-movement":["Network segmentation review","Identity trust mapping","Administrative boundary check","Defensive telemetry"],
    "persistence-review":["Startup entry audit","Service inventory review","Detection coverage","Endpoint control review"],
    intelligence:["Knowledge graph","Signal correlation","Entity resolution","Confidence scoring"],
    "threat-feed":["Vendor advisories","CERT / CSIRT bulletins","Public incident disclosures","Research publications"],
    "knowledge-base":["ATT&CK references","CVE / CWE records","Vendor advisories","Internal findings"],
    reports:["Assessment reports","Evidence packages","Approval history","Export registry"]
  };
  function genericPage(id){
    const p=pages[id], rows=dataRows[id]||dataRows.reconnaissance, steps=workflows[id]||["Source review","Context enrichment","Evidence capture","Reporting"];
    const extraAction=(id==="vuln-scan"?"＋ New scan plan":id==="reports"?"＋ Create report":"＋ New research task");
    const heads=id==="vuln-scan"?["FINDING","OBSERVATION","SEVERITY","EVIDENCE","STATE"]:["REFERENCE","OBSERVATION","CATEGORY","SOURCE / STATUS","UPDATED"];
    return pageHeading(id,'<div class="workspace-actions"><button class="btn-secondary" data-action="refresh">↻ Refresh view</button><button class="btn-primary" data-action="demo-run">'+extraAction+'</button></div>')+
      '<div class="module-strip"><span class="module-strip-icon">'+glyph[p[4]]+'</span><div><strong>'+p[3]+'</strong><small>'+p[1]+'</small></div><span class="demo-stamp">SAMPLE DATA</span></div>'+metrics(id)+
      '<div class="content-grid module-content-grid"><div class="main-column">'+
      panel("Research workspace","PRIMARY DATASET",'<div class="search-toolbar"><label class="workspace-search"><span>⌕</span><input type="search" data-local-search placeholder="Search this workspace…" aria-label="Search this workspace"></label><button class="filter-button" data-action="filter">☷ Filters</button></div>'+table(rows,heads)+'<div class="panel-foot"><span>Showing <b>'+rows.length+'</b> sample records</span><span class="mono">LOCAL DEMO DATA</span></div>')+
      panel("Research workflow","CAPABILITY MAP",steps.map((s,i)=>'<div class="workflow-row"><span class="workflow-index">0'+(i+1)+'</span><div><strong>'+s+'</strong><small>'+["Collect and normalize source observations","Preserve provenance and timestamps","Correlate related records and context","Review confidence and record conclusions"][i]+'</small></div><span class="workflow-arrow">↗</span></div>').join(""))+
      '</div><div class="side-column">'+
      panel("Workspace context","ANALYSIS SUMMARY",'<div class="context-highlight"><span class="context-icon">'+glyph[p[4]]+'</span><div><strong>'+p[3]+'</strong><small>Module scope</small></div></div>'+[['Collection mode','Manual / API-ready'],['Execution status','Prototype only'],['Source provenance','Required'],['Live integrations','Not connected']].map(x=>'<div class="context-stat"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join(""))+
      activityPanel("Recent module activity")+
      panel("Quick actions","WORKSPACE TOOLS",'<div class="quick-actions"><button data-action="demo-run">＋ Create task</button><button data-action="export">⇩ Export demo data</button><button data-action="refresh">↻ Refresh module</button></div>')+
      '</div></div>';
  }
  function networkPage(){
    return pageHeading("network-mapping",'<button class="btn-secondary" data-action="demo-run">＋ Add observation</button>')+metrics("network-mapping")+
      '<div class="content-grid network-layout">'+
      panel("Network topology","ILLUSTRATIVE GRAPH",'<div class="topology-workspace"><svg viewBox="0 0 760 420" role="img" aria-label="Sample network topology"><defs><pattern id="netgrid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#17222e"/></pattern></defs><rect width="760" height="420" fill="url(#netgrid)"/><g class="graph-lines"><path d="M380 204 180 90M380 204 570 90M380 204 170 322M380 204 575 320M180 90 90 205M570 90 670 190M170 322 90 205M575 320 670 190M180 90 380 70M570 90 380 70"/></g><g class="graph-nodes"><g class="graph-node selected" data-node="CORE"><circle cx="380" cy="204" r="38"/><text x="380" y="209">CORE</text></g><g class="graph-node" data-node="EDGE-GW"><circle cx="180" cy="90" r="27"/><text x="180" y="94">EDGE</text></g><g class="graph-node" data-node="WEB-01"><circle cx="570" cy="90" r="27"/><text x="570" y="94">WEB-01</text></g><g class="graph-node" data-node="API-02"><circle cx="170" cy="322" r="27"/><text x="170" y="326">API-02</text></g><g class="graph-node" data-node="DB-01"><circle cx="575" cy="320" r="27"/><text x="575" y="324">DB-01</text></g><g class="graph-node" data-node="AUTH-01"><circle cx="90" cy="205" r="22"/><text x="90" y="209">AUTH</text></g><g class="graph-node" data-node="MON-01"><circle cx="670" cy="190" r="22"/><text x="670" y="194">MON</text></g></g></svg></div><div class="panel-foot"><span><i class="legend-dot red"></i> Selected node</span><span><i class="legend-dot blue"></i> Observed relationship</span><span class="mono">SYNTHETIC TOPOLOGY</span></div>')+
      panel("Node inspector","SELECT A NODE",'<div class="node-inspector"><span class="node-inspector-icon">⌘</span><h3 id="node-name">CORE</h3><p id="node-description">Central relationship node in the sample topology.</p><div class="context-stat"><span>Node type</span><b id="node-type">Core asset</b></div><div class="context-stat"><span>Scope state</span><b class="text-green">In-scope · demo</b></div><div class="context-stat"><span>Evidence links</span><b>04 references</b></div></div>')+
      '</div>';
  }
  function osintPage(){
    return '<div class="osint-banner"><div><span class="section-kicker">'+pages["osint-search"][1]+'</span><h2>Open source <span class="text-gradient">intelligence.</span></h2><p>'+pages["osint-search"][2]+'</p></div><div class="banner-orbit" aria-hidden="true"><span>◎</span><i></i><i></i><i></i></div></div>'+metrics("osint-search")+
      '<section class="panel-card osint-search-card"><div class="panel-heading"><div><span class="panel-kicker">UNIFIED COLLECTION</span><h3>Search across public sources</h3></div><span class="demo-stamp">LOCAL DEMO</span></div><div class="search-toolbar"><label class="workspace-search prominent-search"><span>⌕</span><input id="osint-query" type="search" placeholder="Search a name, domain, email, organization, or keyword…" aria-label="OSINT search query"><button class="search-submit" id="osint-submit">SEARCH ↗</button></label></div><div class="source-filters">'+["All sources","Web pages","Social media","News & media","Forums","Public records","Technical sources"].map((x,i)=>'<button class="source-chip '+(i===0?"selected":"")+'" data-source-filter>'+x+'</button>').join("")+'</div></section>'+
      '<div class="content-grid osint-layout"><div>'+panel("Recent OSINT results","SOURCE-ATTRIBUTED OBSERVATIONS",table(dataRows["osint-search"],["REF ID","PUBLIC OBSERVATION","SOURCE TYPE","COLLECTION STATUS","UPDATED"]))+'</div><div>'+panel("Trending intelligence","ILLUSTRATIVE SIGNALS",["Cybersecurity advisories","Public breach notifications","Infrastructure changes","Software supply-chain updates"].map((x,i)=>'<div class="trend-row"><span class="trend-number">0'+(i+1)+'</span><strong>'+x+'</strong><span class="trend-up">↗ '+[42,28,19,13][i]+'%</span></div>').join(""))+panel("Quick tools","PASSIVE RESEARCH",["Domain context","Certificate references","Public DNS history","Source preservation"].map(x=>'<button type="button" class="quick-link-row" data-demo-review="'+x+'"><span>⌕</span>'+x+'<b>↗</b></button>').join(""))+'</div></div>';
  }
  function operationsPage(){
    return pageHeading("operations",'<span class="approval-badge"><span>HUMAN APPROVAL</span><b>ENABLED</b></span>')+metrics("operations")+
      '<div class="content-grid module-content-grid"><div>'+panel("Operation queue","TASK ORCHESTRATION",table(dataRows.operations,["OPERATION","WORK ITEM","ASSIGNED ROLE","STATE","UPDATED"]))+
      panel("Workflow stages","CONTROLLED LIFECYCLE",["Scope review","Plan approval","Authorized collection","Evidence validation","Reporting and closeout"].map((x,i)=>'<div class="workflow-row"><span class="workflow-index">0'+(i+1)+'</span><div><strong>'+x+'</strong><small>'+["Confirm rules of engagement and exclusions","Approve the exact planned activity","Execute only within approved boundaries","Verify results and preserve provenance","Record outcome and close the engagement"][i]+'</small></div><span class="status-pill '+(i<2?"good":"neutral")+'">'+(i<2?"Ready":"Pending")+'</span></div>').join(""))+'</div><div>'+
      panel("Autonomy controls","RUNTIME POLICY",["Autonomous within approved scope","Human approval required","Collaborative research","Human-led / manual","Paused / safe stop"].map((x,i)=>'<label class="mode-option"><input type="radio" name="autonomy" value="'+i+'" '+(i===1?"checked":"")+'><span><b>'+x+'</b><small>'+["Policy-bound tasks only","Approval bound to exact action","Operator and agent work together","Operator directs all activity","Stop new work and request cancellation"][i]+'</small></span></label>').join(""))+
      panel("Queue health","SYSTEM STATE",["Coordinator","Policy engine","Evidence service","Task workers"].map(x=>'<div class="health-row"><span>'+x+'</span><span class="status-pill good">Demo ready</span></div>').join(""))+'</div></div>';
  }
  function intelligencePage(){
    return pageHeading("intelligence",'<span class="demo-stamp">GRAPH / SAMPLE DATA</span>')+metrics("intelligence")+
      '<div class="content-grid main-content-grid">'+panel("Intelligence relationship map","ENTITY FUSION",worldMap(),'<div class="panel-foot"><span>Entity correlation</span><span>Confidence metadata</span><span class="mono">SYNTHETIC DATA</span></div>')+
      panel("Correlation queue","REVIEW REQUIRED",table(dataRows.intelligence,["REF","RELATIONSHIP","DOMAIN","CONFIDENCE","STATE"]))+'</div>'+
      '<div class="content-grid lower-content-grid">'+panel("Knowledge sources","VERSIONED REFERENCES",["MITRE ATT&CK","CVE / NVD","CWE taxonomy","Vendor advisories","Internal research"].map(x=>'<div class="health-row"><span>'+x+'</span><span class="status-pill good">Catalogued</span></div>').join(""))+
      panel("Analysis controls","TRACEABILITY",["Source provenance required","Confidence score retained","Human review for uncertain links","Versioned knowledge records"].map(x=>'<div class="check-row"><span class="check-box">✓</span>'+x+'</div>').join(""))+'</div>';
  }
  function threatPage(){
    return pageHeading("threat-feed",'<span class="live-badge"><i></i> DEMO FEED</span>')+metrics("threat-feed")+
      '<div class="content-grid module-content-grid"><div>'+panel("Threat intelligence stream","NORMALIZED PUBLIC SOURCES",table(dataRows["threat-feed"],["REF","OBSERVATION","TYPE","SOURCE STATUS","UPDATED"]))+
      panel("Feed coverage","SOURCE CATEGORIES",["Vendor advisories","CERT / CSIRT bulletins","Public incident disclosures","Research publications","Open vulnerability catalogs"].map((x,i)=>'<div class="health-row"><span>'+x+'</span><span class="status-pill '+(i<3?"good":"neutral")+'">'+(i<3?"Monitored":"Catalogued")+'</span></div>').join(""))+'</div><div>'+activityPanel("Recent feed events")+
      panel("Triage priorities","REVIEW QUEUE",["Validate source credibility","Resolve duplicate indicators","Correlate affected products","Preserve advisory snapshots"].map((x,i)=>'<div class="workflow-row"><span class="workflow-index">0'+(i+1)+'</span><strong>'+x+'</strong></div>').join(""))+'</div></div>';
  }
  function settingsPage(){
    const prefs=JSON.parse(localStorage.getItem("rd-demo-prefs")||"{}");
    return pageHeading("settings")+
      '<div class="content-grid lower-content-grid">'+panel("Interface preferences","LOCAL SETTINGS",'<label class="setting-row"><span><b>Compact tables</b><small>Reduce table row height in this browser.</small></span><input type="checkbox" data-pref="compact" '+(prefs.compact?"checked":"")+'></label><label class="setting-row"><span><b>Motion effects</b><small>Enable subtle UI motion and hover effects.</small></span><input type="checkbox" data-pref="motion" '+(prefs.motion!==false?"checked":"")+'></label><label class="setting-row"><span><b>Show demo data banners</b><small>Keep prototype/sample data labels visible.</small></span><input type="checkbox" data-pref="demo" '+(prefs.demo!==false?"checked":"")+'></label>')+
      panel("Integration boundaries","NOT CONNECTED",["AI inference services","Scanner and assessment workers","Evidence and artifact storage","Identity and access management","Private node / server scheduler"].map(x=>'<div class="health-row"><span>'+x+'</span><span class="status-pill neutral">Not connected</span></div>').join(""))+'</div>'+
      panel("Prototype information","BUILD",'<div class="context-stat"><span>Interface</span><b>HTML / JavaScript</b></div><div class="context-stat"><span>CSS pipeline</span><b>Tailwind CSS v4</b></div><div class="context-stat"><span>Data mode</span><b>Sample + localStorage</b></div><div class="context-stat"><span>Backend</span><b>Local Node demo / browser fallback</b></div>');
  }
  function renderPage(id){
    if(!pages[id])id="dashboard";
    activePage=id;setTopForPage(id);
    $("#page-title").textContent=pages[id][0];
    $("#breadcrumbs").innerHTML="<span>DEVIL EYE</span><b>/</b><span>"+safe(pages[id][1].split(" / ")[0])+"</span><b>/</b><strong>"+safe(pages[id][0])+"</strong>";
    document.title=pages[id][0]+" — DEVIL EYE / R&D";
    let html;
    if(id==="dashboard")html=overview();
    else if(id==="targets")html=targetsPage();
    else if(id==="network-mapping")html=networkPage();
    else if(id==="osint-search")html=osintPage();
    else if(id==="operations")html=operationsPage();
    else if(id==="intelligence")html=intelligencePage();
    else if(id==="threat-feed")html=threatPage();
    else if(id==="settings")html=settingsPage();
    else html=genericPage(id);
    $("#workspace").innerHTML=html;
    renderSidebar();
    bindWorkspace();
    $("#workspace-scroll").scrollTop=0;
    closeMobileNav();
  }
  function navigate(id){
    if(!pages[id])return;
    renderPage(id);history.replaceState({page:id},"","#"+id);
  }
  function showToast(message){
    const toast=$("#toast");toast.textContent=message;toast.classList.add("visible");
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("visible"),3600);
  }
  function closeMobileNav(){document.body.classList.remove("nav-open");$("#menu-toggle").setAttribute("aria-expanded","false");}
  function openTargetModal(){
    $("#target-modal").classList.add("open");$("#target-modal").setAttribute("aria-hidden","false");$("#target-value").focus();
  }
  function closeTargetModal(){
    $("#target-modal").classList.remove("open");$("#target-modal").setAttribute("aria-hidden","true");$("#target-form").reset();
  }
  async function saveTarget(e){
    e.preventDefault();
    const value=$("#target-value").value.trim(),type=$("#target-type").value;
    if(!value||value.length>180){showToast("Enter a target label or address (maximum 180 characters).");return;}
    const item={value,type,createdAt:new Date().toISOString()};
    const entries=savedTargets();entries.unshift(item);
    localStorage.setItem("rd-demo-targets",JSON.stringify(entries.slice(0,100)));
    try{
      if(window.DevilEyeDemoAPI) await window.DevilEyeDemoAPI.addRecord({module:"targets",title:value,category:type,status:"In demo scope",authorized:true,notes:"Synthetic demo target record."});
      closeTargetModal();navigate("targets");showToast("Demo target added. No network connection was made.");
    }catch(err){showToast("Demo target could not be saved: "+err.message);}
  }
  function exportData(){
    const payload={notice:"SAMPLE DATA ONLY — not a real assessment result.",project:"DEVIL EYE / R&D",page:activePage,generatedAt:new Date().toISOString(),records:dataRows[activePage]||[]};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="devil-eye-"+activePage+"-demo.json";a.click();URL.revokeObjectURL(url);
    showToast("Sample JSON exported.");
  }
  function filterTable(q){
    $$("#workspace tbody tr").forEach(row=>row.classList.toggle("hidden-row",!row.textContent.toLowerCase().includes(q.toLowerCase())));
  }
  function bindWorkspace(){
    $$("[data-page]",$("#workspace")).forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.page)));
    $$("[data-action]",$("#workspace")).forEach(btn=>btn.addEventListener("click",()=>action(btn.dataset.action)));
    $$("[data-source-filter]").forEach(btn=>btn.addEventListener("click",()=>{$$("[data-source-filter]").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");showToast("Source filter: "+btn.textContent+" · demo mode");}));
    const localSearch=$("[data-local-search]",$("#workspace"));
    if(localSearch)localSearch.addEventListener("input",()=>filterTable(localSearch.value));
    const osintSearch=$("#osint-submit"),osintQuery=$("#osint-query");
    if(osintSearch)osintSearch.addEventListener("click",()=>runOSINTSearch());
    if(osintQuery)osintQuery.addEventListener("keydown",e=>{if(e.key==="Enter")runOSINTSearch();});
    $$(".graph-node").forEach(node=>node.addEventListener("click",()=>inspectNode(node)));
    $$('input[name="autonomy"]').forEach(input=>input.addEventListener("change",()=>showToast("Demo autonomy mode: "+input.nextElementSibling.querySelector("b").textContent)));
    $$("[data-pref]").forEach(input=>input.addEventListener("change",savePrefs));
  }
  function runOSINTSearch(){
    const q=$("#osint-query").value.trim();
    if(!q){showToast("Enter a query to search the local sample dataset.");return;}
    showToast("Local sample search prepared for “"+q+"”. No external request was sent.");
  }
  function inspectNode(node){
    $$(".graph-node").forEach(n=>n.classList.remove("selected"));node.classList.add("selected");
    const name=node.dataset.node;
    $("#node-name").textContent=name;$("#node-description").textContent=name+" is a node in the synthetic sample topology.";
    $("#node-type").textContent=name==="CORE"?"Core asset":name.indexOf("EDGE")>=0?"Network edge":"Sample service";
  }
  function savePrefs(){
    const prefs={};$$("[data-pref]").forEach(x=>prefs[x.dataset.pref]=x.checked);
    localStorage.setItem("rd-demo-prefs",JSON.stringify(prefs));
    document.body.classList.toggle("compact-tables",!!prefs.compact);
    document.body.classList.toggle("reduced-motion",!prefs.motion);
    document.body.classList.toggle("hide-demo-banners",prefs.demo===false);
    showToast("Interface preference saved locally.");
  }
  function action(name){
    if(name==="add-target"){openTargetModal();return;}
    if(name==="refresh"){if(window.DevilEyeDemoAPI)window.DevilEyeDemoAPI.state().then(()=>showToast("Workspace state refreshed."));else showToast("Workspace refreshed.");return;}
    if(name==="demo-run"){showToast("Use the demo task dialog to create a simulated workflow.");return;}
    if(name==="export"){exportData();return;}
    if(name==="filter"){showToast("Use the filter controls in the workspace toolbar.");return;}
  }
  function closeGlobalSearch(){
    const box=$("#global-search-results"),input=$("#global-search");
    if(box){box.hidden=true;box.innerHTML="";}
    if(input)input.setAttribute("aria-expanded","false");
  }
  function globalSearchEntries(query){
    const q=String(query||"").trim().toLowerCase();
    const routes=Object.keys(pages).map(id=>({kind:"WORKSPACE",id,title:pages[id][0],detail:pages[id][1]}));
    const recordHits=[];
    Object.entries(dataRows).forEach(([id,rows])=>rows.forEach(row=>{
      const hay=row.join(" ").toLowerCase();
      if(q && hay.includes(q))recordHits.push({kind:"SAMPLE RECORD",id,title:row[1]||row[0],detail:pages[id]?pages[id][0]+" · "+row[0]:id,query:q});
    }));
    const routeHits=routes.filter(x=>!q||(x.title+" "+x.detail+" "+x.id).toLowerCase().includes(q));
    if(!q)return routeHits.slice(0,9);
    return routeHits.slice(0,7).concat(recordHits.slice(0,5)).slice(0,10);
  }
  function renderGlobalSearch(query){
    const box=$("#global-search-results");if(!box)return;
    const items=globalSearchEntries(query);
    const value=String(query||"").trim();
    const header=value?"SEARCH RESULTS":"QUICK DESTINATIONS";
    box.innerHTML="<div class='global-search-results-heading'>"+header+" <span>"+items.length+" MATCHES</span></div>"+
      (items.map(item=>"<button type='button' class='global-search-result' data-global-result='"+safe(item.id)+"' data-global-kind='"+safe(item.kind)+"' data-global-query='"+safe(item.query||"")+"'><span class='global-search-result-icon'>"+(item.kind==="WORKSPACE"?"⌘":"⌕")+"</span><span><b>"+safe(item.title)+"</b><small>"+safe(item.detail)+"</small></span><kbd>"+(item.kind==="WORKSPACE"?"OPEN":"VIEW")+"</kbd></button>").join("")||
      "<div class='global-search-empty'>No exact matches. Press Enter to search the local demo dataset.</div>")+
      (value?"<button type='button' class='global-search-result global-search-all' data-global-result='osint-search' data-global-kind='SEARCH' data-global-query='"+safe(value)+"'><span class='global-search-result-icon'>⌕</span><span><b>Search all demo observations</b><small>Filter the local OSINT sample dataset for “"+safe(value)+"”.</small></span><kbd>ENTER</kbd></button>":"");
    box.hidden=false;$("#global-search").setAttribute("aria-expanded","true");
  }
  function selectGlobalSearchResult(button){
    const id=button.dataset.globalResult,query=button.dataset.globalQuery||"";
    closeGlobalSearch();
    if(button.dataset.globalKind==="SAMPLE RECORD"||button.dataset.globalKind==="SEARCH"){
      navigate("osint-search");
      const field=$("#osint-query");if(field){field.value=query;runOSINTSearch();}
    }else navigate(id);
    $("#global-search").value="";
  }
  function updateWorkspaceChoice(value,silent){
    const label=$("#workspace-environment"),menu=$("#workspace-switcher-menu"),toggle=$("#workspace-switcher");
    if(label)label.textContent=value.toUpperCase();
    if(menu)$("[data-workspace-choice]",menu).forEach(item=>item.classList.toggle("selected",item.dataset.workspaceChoice===value));
    if(toggle)toggle.setAttribute("aria-expanded","false");
    if(menu)menu.hidden=true;
    localStorage.setItem("rd-demo-workspace",value);
    if(!silent)showToast("Workspace switched to "+value+" · demo environment.");
    if(window.DevilEyeDemoAPI)window.DevilEyeDemoAPI.addAudit("WORKSPACE_SWITCHED",value).catch(()=>{});
  }
  function closeWorkspaceMenu(){
    const menu=$("#workspace-switcher-menu"),toggle=$("#workspace-switcher");
    if(menu)menu.hidden=true;
    if(toggle){toggle.setAttribute("aria-expanded","false");toggle.classList.remove("open");}
  }
  function init(){
    renderSidebar();renderPage(location.hash.slice(1)||"dashboard");
    $("#sidebar-groups").addEventListener("click",e=>{
      const toggle=e.target.closest("[data-nav-toggle]");
      if(toggle){
        const id=toggle.dataset.navToggle;
        navExpanded[id]=toggle.getAttribute("aria-expanded")!=="true";
        try{localStorage.setItem("rd-nav-expanded",JSON.stringify(navExpanded));}catch(_){}
        renderSidebar();
        return;
      }
      const b=e.target.closest("[data-page]");
      if(b)navigate(b.dataset.page);
    });
    $("#top-nav").addEventListener("click",e=>{const b=e.target.closest("[data-top-page]");if(b)navigate(b.dataset.topPage);});
    $("#menu-toggle").addEventListener("click",()=>{const open=document.body.classList.toggle("nav-open");$("#menu-toggle").setAttribute("aria-expanded",String(open));});
    $("#mobile-scrim").addEventListener("click",closeMobileNav);
    $("#target-form").addEventListener("submit",saveTarget);
    $("#modal-close").addEventListener("click",closeTargetModal);
    $("#modal-cancel").addEventListener("click",closeTargetModal);
    $("#target-modal").addEventListener("click",e=>{if(e.target.id==="target-modal")closeTargetModal();});
    const globalInput=$("#global-search"),globalResults=$("#global-search-results");
    globalInput.setAttribute("aria-expanded","false");
    globalInput.addEventListener("focus",()=>renderGlobalSearch(globalInput.value));
    globalInput.addEventListener("input",()=>renderGlobalSearch(globalInput.value));
    globalInput.addEventListener("keydown",e=>{
      if(e.key==="ArrowDown"){const first=$("[data-global-result]",globalResults);if(first){e.preventDefault();first.focus();}}
      if(e.key==="Enter"){
        e.preventDefault();
        const first=$("[data-global-result]",globalResults);
        if(first)selectGlobalSearchResult(first);
        else if(globalInput.value.trim()){navigate("osint-search");const field=$("#osint-query");if(field){field.value=globalInput.value.trim();runOSINTSearch();}globalInput.value="";}
      }
      if(e.key==="Escape")closeGlobalSearch();
    });
    globalResults.addEventListener("click",e=>{const button=e.target.closest("[data-global-result]");if(button)selectGlobalSearchResult(button);});
    const workspaceToggle=$("#workspace-switcher"),workspaceMenu=$("#workspace-switcher-menu");
    workspaceToggle.addEventListener("click",()=>{const open=workspaceMenu.hidden;workspaceMenu.hidden=!open;workspaceToggle.setAttribute("aria-expanded",String(open));workspaceToggle.classList.toggle("open",open);});
    workspaceMenu.addEventListener("click",e=>{const item=e.target.closest("[data-workspace-choice]");if(item)updateWorkspaceChoice(item.dataset.workspaceChoice);});
    const storedWorkspace=localStorage.getItem("rd-demo-workspace")||"Research Environment";
    updateWorkspaceChoice(storedWorkspace,true);
    closeWorkspaceMenu();
    $("#sidebar").addEventListener("click",e=>{const b=e.target.closest("[data-toast]");if(b)showToast(b.dataset.toast);});
    document.addEventListener("click",e=>{const b=e.target.closest("[data-toast]");if(b)showToast(b.dataset.toast);});
    document.addEventListener("keydown",e=>{
      const tag=(document.activeElement&&document.activeElement.tagName)||"";
      const editing=["INPUT","TEXTAREA","SELECT"].includes(tag)||document.activeElement?.isContentEditable;
      if((e.key==="/"&&!editing)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k")){
        e.preventDefault();$("#global-search").focus();renderGlobalSearch($("#global-search").value);
      }
      if(e.key==="Escape"){closeTargetModal();closeMobileNav();closeWorkspaceMenu();closeGlobalSearch();}
    });
    document.addEventListener("click",e=>{
      if(!e.target.closest(".global-search-wrap"))closeGlobalSearch();
      if(!e.target.closest(".sidebar-workspace-wrap"))closeWorkspaceMenu();
    });
    const clock=()=>$("#system-clock").textContent=new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date());
    clock();setInterval(clock,1000);
    const prefs=JSON.parse(localStorage.getItem("rd-demo-prefs")||"{}");
    document.body.classList.toggle("compact-tables",!!prefs.compact);
    document.body.classList.toggle("reduced-motion",prefs.motion===false);
    document.body.classList.toggle("hide-demo-banners",prefs.demo===false);
  }
  window.DevilEyeNavigation = {
    registerGroup(group){
      if(!group || !group.id || !Array.isArray(group.items)) return false;
      const index=navGroups.findIndex(item=>item.id===group.id);
      if(index>=0) return true;
      navGroups.push(group);
      if(navExpanded[group.id]===undefined) navExpanded[group.id]=true;
      try{localStorage.setItem("rd-nav-expanded",JSON.stringify(navExpanded));}catch(_){}
      renderSidebar();
      return true;
    },
    openGroup(id){navExpanded[id]=true;try{localStorage.setItem("rd-nav-expanded",JSON.stringify(navExpanded));}catch(_){}renderSidebar();},
    getGroups(){return navGroups.map(group=>({id:group.id,label:group.label,items:group.items.map(item=>item.slice())}));}
  };
  document.addEventListener("DOMContentLoaded",init);
})();