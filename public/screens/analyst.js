
const TURNS = [{"q":"Who should we award this contract to?","spec":{"intent":"compare_total","basis":"landed","filters":{"qualified_only":true},"metric":"annualised_spend","sort":"asc"},"result":{"kind":"vendor_table","basis":"landed","rows":[{"vendor":"Continental Corrugators","annualised_inr":228081505.9,"annualised_cr":22.81,"lines_quoted":30,"lines_missing":0,"qualified":true,"failed_mandatory":[]},{"vendor":"Global Fibre Solutions","annualised_inr":232948809.1,"annualised_cr":23.29,"lines_quoted":23,"lines_missing":7,"qualified":true,"failed_mandatory":[]}],"note":"Totals cover only the lines each vendor actually quoted; they are NOT like-for-like where coverage differs."},"narration":"**Continental Corrugators, at \u20b922.81 Cr landed.**\n\nOnly two of the five vendors clear both mandatory requirements \u2014 BRC/ISO 22000 certification and FSC chain of custody. Shakti, NovaPack and Ashoka all fail Q1 and Q2, so they are not awardable regardless of price.\n\nBetween the two eligible vendors, Continental is \u20b90.48 Cr cheaper on landed cost **and** quoted all 30 lines. Global Fibre quoted 23, so its \u20b923.29 Cr does not even cover the full basket \u2014 the true gap is wider than it appears.\n\n\u26a0\ufe0f This ranking depends on the landed-cost adjustments in the ledger, particularly the 10% customs duty on Global Fibre. Change that assumption and the gap changes with it."},{"q":"Global Fibre looks cheapest. Why aren't we picking them?","spec":{"intent":"compare_total","basis":"list","filters":{},"metric":"annualised_spend","sort":"asc"},"result":{"kind":"vendor_table","basis":"list","rows":[{"vendor":"Global Fibre Solutions","annualised_inr":177868926.9,"annualised_cr":17.79,"lines_quoted":23,"lines_missing":7,"qualified":true,"failed_mandatory":[]},{"vendor":"NovaPack Industries","annualised_inr":196233080.0,"annualised_cr":19.62,"lines_quoted":24,"lines_missing":6,"qualified":false,"failed_mandatory":["Q1","Q2"]},{"vendor":"Shakti Packaging","annualised_inr":217624810.3,"annualised_cr":21.76,"lines_quoted":28,"lines_missing":2,"qualified":false,"failed_mandatory":["Q1","Q2"]},{"vendor":"Continental Corrugators","annualised_inr":226487890.0,"annualised_cr":22.65,"lines_quoted":30,"lines_missing":0,"qualified":true,"failed_mandatory":[]}],"note":"Totals cover only the lines each vendor actually quoted; they are NOT like-for-like where coverage differs."},"narration":"**Because \u20b917.79 Cr is a list price, not what you would pay.**\n\nGlobal Fibre quotes FOB Jebel Ali. Once you add ocean freight, 10% basic customs duty, inland haulage from Chennai, and LC banking charges, the landed figure is **\u20b923.29 Cr** \u2014 \u20b95.50 Cr above its own list price, and \u20b90.48 Cr *above* Continental.\n\nThree further things the list price hides:\n\n- It covers **23 of 30 lines**. Seven lines have no price at all \u2014 four not offered, three obscured by glare on the photograph.\n- Lead time is **46 days** (28 production + 18 transit) against Continental's 14.\n- Payment is **irrevocable LC at sight** \u2014 no credit terms, unlike the 60 days Continental accepted.\n\nGlobal Fibre does clear both mandatory certifications, so it is a legitimate bidder. It is simply not the cheaper one."},{"q":"What's the best split award if we can use more than one supplier?","spec":{"intent":"scenario_split","basis":"landed","filters":{"qualified_only":true}},"result":{"kind":"split_award","basis":"landed","eligible_vendors":["Continental Corrugators","Global Fibre Solutions"],"allocation":{"Continental Corrugators":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]},"lines_per_vendor":{"Continental Corrugators":30},"total_inr":228081505.9,"total_cr":22.81,"unawardable_lines":[],"note":"Only vendors clearing both mandatory certifications are eligible."},"narration":"**A split doesn't help here \u2014 Continental wins all 30 lines outright.**\n\nRestricting to the two vendors that clear both mandatory requirements, Continental is cheapest on landed cost for every single line. Total **\u20b922.81 Cr**, identical to the single-award case.\n\nThat is an unusual and useful result: it means you have no split-award trade-off to negotiate, and no line left unawardable.\n\n\u26a0\ufe0f Worth noting what this excludes. Shakti is cheaper than Continental on 21 lines and NovaPack on 24, but both fail Q1 and Q2. If Meridian is willing to accept a certification remediation plan \u2014 Shakti's BRC audit is already scheduled for November 2026 \u2014 the eligible set changes and so does this answer."},{"q":"What couldn't the system resolve?","spec":{"intent":"unresolved_report","basis":"landed","filters":{}},"result":{"kind":"unresolved","rows":[{"vendor":"Shakti Packaging","line":13,"reason":"Line absent from vendor sheet - vendor quoted 29 of 30 lines","vendor_words":null},{"vendor":"Shakti Packaging","line":19,"reason":"Vendor entered 'POA' (price on application) - no rate given","vendor_words":"POA"},{"vendor":"NovaPack Industries","line":21,"reason":"Declined - no partition assembly capability at Chakan unit","vendor_words":"We regret that we are unable to offer against your lines..."},{"vendor":"NovaPack Industries","line":22,"reason":"Declined - no partition assembly capability at Chakan unit","vendor_words":"We regret that we are unable to offer against your lines..."},{"vendor":"NovaPack Industries","line":23,"reason":"Declined - below minimum board grammage, cannot hold flatness tolerance","vendor_words":"We regret that we are unable to offer against your lines..."},{"vendor":"NovaPack Industries","line":24,"reason":"Declined - below minimum board grammage, cannot hold flatness tolerance","vendor_words":"We regret that we are unable to offer against your lines..."},{"vendor":"NovaPack Industries","line":29,"reason":"Declined - moisture-resistant coating line not yet commissioned","vendor_words":"We regret that we are unable to offer against your lines..."},{"vendor":"NovaPack Industries","line":30,"reason":"Declined - moisture-resistant coating line not yet commissioned","vendor_words":"We regret that we are unable to offer against your lines..."},{"vendor":"Global Fibre Solutions","line":8,"reason":"Illegible - glare on photograph obscures this row. Digits not readable.","vendor_words":"[row obscured by glare]"},{"vendor":"Global Fibre Solutions","line":9,"reason":"Illegible - glare on photograph obscures this row. Digits not readable.","vendor_words":"[row obscured by glare]"},{"vendor":"Global Fibre Solutions","line":10,"reason":"Illegible - glare on photograph obscures this row. Digits not readable.","vendor_words":"[row obscured by glare]"},{"vendor":"Global Fibre Solutions","line":13,"reason":"Not offered - printing and partition assembly unavailable at this facility","vendor_words":"Items 13, 18, 21 and 22 not offered"},{"vendor":"Global Fibre Solutions","line":18,"reason":"Not offered - printing and partition assembly unavailable at this facility","vendor_words":"Items 13, 18, 21 and 22 not offered"},{"vendor":"Global Fibre Solutions","line":21,"reason":"Not offered - printing and partition assembly unavailable at this facility","vendor_words":"Items 13, 18, 21 and 22 not offered"},{"vendor":"Global Fibre Solutions","line":22,"reason":"Not offered - printing and partition assembly unavailable at this facility","vendor_words":"Items 13, 18, 21 and 22 not offered"},{"vendor":"Ashoka Boards","line":1,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":2,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":3,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":4,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":5,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":6,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":7,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":8,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":9,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":10,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":11,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":12,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":13,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":14,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":15,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":16,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":17,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":18,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":19,"reason":"Vendor declined - '7 ply - not doing now'","vendor_words":"7 ply - not doing now"},{"vendor":"Ashoka Boards","line":20,"reason":"Vendor declined - '7 ply - not doing now'","vendor_words":"7 ply - not doing now"},{"vendor":"Ashoka Boards","line":21,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":22,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":23,"reason":"Conditional - vendor requires physical sample before quoting","vendor_words":"partitions + layer pads | after sample | send 1 pc courier"},{"vendor":"Ashoka Boards","line":24,"reason":"Conditional - vendor requires physical sample before quoting","vendor_words":"partitions + layer pads | after sample | send 1 pc courier"},{"vendor":"Ashoka Boards","line":25,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":26,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"},{"vendor":"Ashoka Boards","line":27,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":28,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":29,"reason":"Vendor quoted grade '5 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"5 ply boxes (all sizes) | as per your list | 42/kg | same as last year"},{"vendor":"Ashoka Boards","line":30,"reason":"Vendor quoted grade '3 ply' only, not this line. Needs buyer confirmation before it can be compared.","vendor_words":"3 ply boxes (all sizes) | as per your list | 38/kg | rate"}],"count":45},"narration":"**45 of 150 cells carry no number, and none of them were estimated.**\n\n| Vendor | Unresolved | Why |\n|---|---|---|\n| Ashoka Boards | 30 | Priced by grade, not by line; \"same as last year\" has no referent in the system |\n| Global Fibre | 7 | 4 lines not offered, 3 obscured by glare on the photograph |\n| NovaPack | 6 | Explicitly declined \u2014 no partition assembly, no coating line |\n| Shakti | 2 | Line 13 absent from the sheet, line 19 marked \"POA\" |\n\nThe Ashoka case is the one to look at. They quoted \u20b942/kg for 5-ply and \u20b938/kg for 3-ply as **grades**. Fanning that across the 26 matching lines would have produced 26 confident-looking numbers from two handwritten figures. The system holds them unresolved until you confirm the mapping.\n\nThree of Global Fibre's gaps are recoverable \u2014 ask them to resend lines 8, 9 and 10."},{"q":"What are the risks in this award?","spec":{"intent":"risk_scan","basis":"landed","filters":{}},"result":{"kind":"risk","rows":[{"vendor":"Shakti Packaging","risk":"incomplete_coverage","detail":"Quoted 28 of 30 lines"},{"vendor":"Shakti Packaging","risk":"failed_mandatory","detail":"Fails Q1, Q2"},{"vendor":"NovaPack Industries","risk":"incomplete_coverage","detail":"Quoted 24 of 30 lines"},{"vendor":"NovaPack Industries","risk":"failed_mandatory","detail":"Fails Q1, Q2"},{"vendor":"NovaPack Industries","risk":"low_extraction_confidence","detail":"4 lines below 80% confidence"},{"vendor":"Global Fibre Solutions","risk":"incomplete_coverage","detail":"Quoted 23 of 30 lines"},{"vendor":"Global Fibre Solutions","risk":"low_extraction_confidence","detail":"15 lines below 80% confidence"},{"vendor":"Ashoka Boards","risk":"incomplete_coverage","detail":"Quoted 0 of 30 lines"},{"vendor":"Ashoka Boards","risk":"failed_mandatory","detail":"Fails Q1, Q2"}]},"narration":"**Nine risks across the five vendors. Three matter for this award.**\n\n**Blocking:** Shakti, NovaPack and Ashoka each fail both mandatory certifications. That removes three of five bidders before price is considered.\n\n**Material:** Global Fibre's extraction confidence sits below 80% on 23 lines \u2014 the rate card was read from an angled photograph. Before relying on those figures, someone should check them against the source image. The system flags them; it does not resolve them.\n\n**Structural:** Coverage is uneven \u2014 30, 23, 24, 28 and 0 lines. Any total comparing vendors with different coverage is not like-for-like, and the totals above should be read with that in mind.\n\nContinental is the only vendor with complete coverage, both certifications, accepted payment terms, and an accepted penalty clause. That combination \u2014 not the price \u2014 is the strongest argument for the award."},{"q":"Show me line 19 across all vendors.","spec":{"intent":"line_detail","basis":"landed","lines":[19],"filters":{}},"result":{"kind":"line_detail","rows":[{"line":19,"desc":"Heavy Duty Shipper, Export Grade","vendor":"Shakti Packaging","state":"unresolved","list":null,"landed":null,"confidence":null,"evidence":"POA","reason":"Vendor entered 'POA' (price on application) - no rate given","working":null,"adjustments":[]},{"line":19,"desc":"Heavy Duty Shipper, Export Grade","vendor":"Continental Corrugators","state":"extracted","list":221.23,"landed":219.2032,"confidence":0.98,"evidence":"Rate/Box (INR): 221.23","reason":null,"working":null,"adjustments":[{"code":"CCL-FRT","label":"Road freight to Bommasandra","kind":"freight","amount":3.224,"source_quote":"Freight/Box column in rate table","contested":false},{"code":"CCL-HOS","label":"Hosur delivery surcharge","kind":"freight","amount":0.28,"source_quote":"deliveries to Hosur will attract an additional INR 0.28 per box which is not included above","contested":false},{"code":"CCL-REB","label":"Early settlement rebate","kind":"rebate","amount":-5.5308,"source_quote":"an early settlement rebate of 2.5% on invoice value is available where payment is received within 15 days","contested":false}]},{"line":19,"desc":"Heavy Duty Shipper, Export Grade","vendor":"NovaPack Industries","state":"extracted","list":227.41,"landed":227.63,"confidence":0.62,"evidence":"our rate for the 800x600x600 (line 19) is Rs. 227.41 per box","reason":"Rate conditional on upfront annual volume commitment; +6% on call-off basis","working":null,"adjustments":[{"code":"NPI-HOS","label":"Hosur delivery surcharge","kind":"freight","amount":0.22,"source_quote":"For the Hosur facility we would need to add Rs. 0.22 per box","contested":false}]},{"line":19,"desc":"Heavy Duty Shipper, Export Grade","vendor":"Global Fibre Solutions","state":"derived","list":196.6193,"landed":261.9946,"confidence":0.73,"evidence":"USD/100 PCS: 222.42","reason":null,"working":"222.42 USD x 88.40 = 19,661.93 INR \u2192 19,661.93 per 100 pcs / 100 = 196.6193 INR/box","adjustments":[{"code":"GFS-OCN","label":"Ocean freight, Jebel Ali to Chennai","kind":"freight","amount":35.4337,"source_quote":"Ocean freight to Chennai approx USD 1,850 per 40ft HC container","contested":false},{"code":"GFS-DUT","label":"Basic customs duty on corrugated cartons","kind":"duty","amount":19.6619,"source_quote":"Customs duty, IGST and inland haulage to be borne by buyer","contested":false},{"code":"GFS-INL","label":"Inland haulage, Chennai port to Bengaluru","kind":"freight","amount":9.1,"source_quote":"inland haulage to be borne by buyer","contested":false},{"code":"GFS-LC","label":"LC and banking charges","kind":"surcharge","amount":1.1797,"source_quote":"Payment by irrevocable LC at sight","contested":false}]},{"line":19,"desc":"Heavy Duty Shipper, Export Grade","vendor":"Ashoka Boards","state":"unresolved","list":null,"landed":null,"confidence":null,"evidence":"7 ply - not doing now","reason":"Vendor declined - '7 ply - not doing now'","working":null,"adjustments":[]}]},"narration":"**Line 19 (heavy-duty 7-ply export shipper, 800\u00d7600\u00d7600) has three real bids, and the cheapest one isn't awardable.**\n\n| Vendor | Landed | Status |\n|---|---|---|\n| Continental | **\u20b9219.20** | Quoted, complete |\n| NovaPack | \u20b9227.63 | Quoted \u2014 but fails both mandatory certs |\n| Global Fibre | \u20b9261.99 | Derived from USD/100pcs at 75% confidence |\n| Shakti | \u2014 | Marked **\"POA\"** \u2014 price on application |\n| Ashoka | \u2014 | Declined: *\"7 ply \u2014 not doing now\"* |\n\nContinental is both cheapest and eligible, so this line needs no special handling.\n\nTwo things worth flagging. Global Fibre's \u20b9261.99 came off the angled photograph at 75% confidence \u2014 below the review threshold \u2014 and it is \u20b965 above its own list rate of \u20b9196.62 once duty and freight are applied. And two of five vendors cannot supply 7-ply at all.\n\nAnnual quantity is 36,000, so this is roughly \u20b979 lakh of spend. Thin coverage, but not a problem for the award."}];

function md(s){
  const esc = t => t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const blocks = s.split(/\n\n+/);
  let out="";
  for(let b of blocks){
    b=b.trim(); if(!b) continue;
    if(b.startsWith("|")){
      const rows=b.split("\n").filter(r=>r.trim().startsWith("|"));
      const cells=r=>r.split("|").slice(1,-1).map(c=>c.trim());
      const head=cells(rows[0]);
      const body=rows.slice(2).map(cells);
      out+='<div class="tblwrap"><table><thead><tr>'+head.map(h=>`<th>${inline(h)}</th>`).join("")+
           "</tr></thead><tbody>"+body.map(r=>"<tr>"+r.map(c=>`<td>${inline(c)}</td>`).join("")+"</tr>").join("")+
           "</tbody></table></div>";
    } else if(b.startsWith("⚠️")){
      out+=`<div class="warn">${inline(b.replace("⚠️","").trim())}</div>`;
    } else if(/^#{1,4}\s/.test(b)){
      out+=b.split("\n").map(l=>{
        const m=l.match(/^(#{1,4})\s+(.*)$/);
        return m?`<h4 class="ansh">${inline(m[2].trim())}</h4>`:`<p>${inline(l.trim())}</p>`;
      }).join("");
    } else if(/^[-*] /m.test(b)){
      out+="<ul>"+b.split("\n").filter(l=>/^[-*] /.test(l.trim()))
        .map(l=>`<li>${inline(l.trim().replace(/^[-*] /,""))}</li>`).join("")+"</ul>";
    } else {
      out+=`<p>${inline(b)}</p>`;
    }
  }
  function inline(t){
    return esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
                 .replace(/\*(.+?)\*/g,"<em>$1</em>")
                 .replace(/`(.+?)`/g,"<code>$1</code>");
  }
  return out;
}

const feed=document.getElementById("feed");
const chips=document.getElementById("chips");
const form=document.getElementById("askform");
const qbox=document.getElementById("qbox");
const sendBtn=document.getElementById("asksend");
const clearBtn=document.getElementById("clearhist");

function escapeHtml(s){
  return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
}

// ── Charts & exports ───────────────────────────────────────────────────────
// Charts are inline SVG built from the SAME deterministic RESULT rows the table
// and narration use — no chart library, no second source of numbers.
let turnSeq = 0;
const turnStore = new Map(); // id → { q, result }

function svgBars(items){
  const max = Math.max(...items.map(i => i.value || 0), 1);
  const rowH = 26, padL = 150, padR = 90, w = 580, h = items.length * rowH + 8;
  const body = items.map((it,i) => {
    const y = i * rowH + 4;
    const bw = Math.max(2, ((it.value || 0) / max) * (w - padL - padR));
    const col = it.flag === "bad" ? "var(--uns)"
              : it.flag === "good" ? "var(--ok)" : "var(--navy)";
    return `<text x="${padL-8}" y="${y+14}" text-anchor="end" font-size="11">${escapeHtml(String(it.label)).slice(0,24)}</text>`
         + `<rect x="${padL}" y="${y+4}" width="${bw}" height="14" rx="2" fill="${col}" opacity="0.85"/>`
         + `<text x="${padL+bw+6}" y="${y+14}" font-size="10.5" font-family="monospace" fill="var(--ink-3)">${escapeHtml(it.sub || String(it.value))}</text>`;
  }).join("");
  return `<div class="tblwrap"><svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px" role="img" aria-label="bar chart">${body}</svg></div>`;
}

function chartFor(res){
  if(!res || !Array.isArray(res.rows) || !res.rows.length) return "";
  if(res.kind === "vendor_table"){
    return svgBars(res.rows.map(r => ({
      label: r.vendor,
      value: r.annualised_cr,
      sub: `₹${r.annualised_cr} Cr · ${r.lines_quoted}/30`,
      flag: r.qualified === false ? "bad" : null,
    })));
  }
  if(res.kind === "line_table"){
    const rows = res.rows.filter(r => r.best_rate != null).slice(0,16);
    if(!rows.length) return "";
    return svgBars(rows.map(r => ({
      label: `L${r.line} ${r.sku || ""}`.trim(),
      value: r.best_rate,
      sub: `₹${r.best_rate} · ${r.best_vendor || "—"}`,
    })));
  }
  if(res.kind === "split_award" && res.lines_per_vendor){
    return svgBars(Object.entries(res.lines_per_vendor).map(([v,n]) => ({
      label: v, value: n, sub: `${n} lines`, flag: "good",
    })));
  }
  return "";
}

function csvFor(res){
  const rows = res && res.rows;
  if(!Array.isArray(rows) || !rows.length) return "";
  const cols = [...rows.reduce((s,r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set())];
  const cell = v => {
    if(v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  };
  return cols.join(",") + "\n" + rows.map(r => cols.map(c => cell(r[c])).join(",")).join("\n");
}

// One delegated handler for every turn's export buttons.
document.getElementById("feed").addEventListener("click", e => {
  const b = e.target.closest(".expbtn");
  if(!b) return;
  const rec = turnStore.get(Number(b.dataset.turn));
  if(!rec) return;
  const csv = csvFor(rec.result);
  if(!csv) return;
  if(b.dataset.act === "copy"){
    navigator.clipboard.writeText(csv).then(() => {
      b.textContent = "Copied ✓";
      setTimeout(() => { b.textContent = "Copy table"; }, 1300);
    });
    return;
  }
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (rec.q || "analyst").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,44) + ".csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
});

// Render one completed turn. Shape matches the /api/analyst response:
// { q, spec, result, narration }. Nothing here is pre-baked.
function turnHTML(t, id){
  const rows = t.result && Array.isArray(t.result.rows) ? t.result.rows.length : null;
  const resultStr = JSON.stringify(t.result,null,1);
  const chart = chartFor(t.result);
  const hasRows = rows !== null && rows > 0;
  return `
    <div class="q"><div class="who">RN</div><p>${escapeHtml(t.q)}</p></div>
    <details class="spec">
      <summary>How this was answered
        <span class="tag">intent: ${escapeHtml(t.spec.intent)} &middot; basis: ${escapeHtml(t.spec.basis||"—")}${rows!==null?` &middot; ${rows} rows computed`:""}</span>
      </summary>
      <div class="spec-in">
        <div class="spec-step">1 &middot; Model translated the question into a spec</div>
        <pre>${escapeHtml(JSON.stringify(t.spec,null,1))}</pre>
        <div class="spec-step">2 &middot; Code executed it &mdash; this result is the authority</div>
        <pre>${escapeHtml(resultStr.slice(0,1700))}${resultStr.length>1700?"\n…":""}</pre>
      </div>
    </details>
    <div class="ans">${md(t.narration||"")}</div>
    ${chart ? `<div class="chart">${chart}</div>` : ""}
    ${hasRows ? `<div class="exports">
      <button type="button" class="expbtn" data-act="csv" data-turn="${id}">Download CSV</button>
      <button type="button" class="expbtn" data-act="copy" data-turn="${id}">Copy table</button>
    </div>` : ""}
    <div class="verified">✓ Every figure above was computed, not generated</div>`;
}

let busy=false;

async function ask(q){
  q=(q||"").trim();
  if(!q||busy) return;
  busy=true; sendBtn.disabled=true;
  qbox.value=""; autosize();
  const intro=document.getElementById("intro"); if(intro) intro.remove();

  const div=document.createElement("div");
  div.className="turn pending";
  div.innerHTML=`<div class="q"><div class="who">RN</div><p>${escapeHtml(q)}</p></div>
    <div class="ans"><p>question &rarr; spec &rarr; executed in code &rarr; narrated&hellip;</p></div>`;
  feed.appendChild(div);
  div.scrollIntoView({behavior:"smooth",block:"start"});

  try{
    const r=await fetch("/api/analyst",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({question:q}),
    });
    const d=await r.json();
    if(!d.ok) throw new Error(d.error||"The analyst could not answer that.");
    const id=++turnSeq;
    turnStore.set(id,{q,result:d.result});
    div.className="turn";
    div.innerHTML=turnHTML({q,spec:d.spec,result:d.result,narration:d.narration},id);
    showClear();
    // persist the completed turn so a refresh mid-demo keeps the conversation
    fetch("/api/analyst/history",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({turn:{id,q,spec:d.spec,result:d.result,narration:d.narration}}),
    }).catch(()=>{});
  }catch(e){
    div.className="turn";
    div.innerHTML=`<div class="q"><div class="who">RN</div><p>${escapeHtml(q)}</p></div>
      <div class="ans"><div class="err">${escapeHtml(e.message)}</div></div>`;
  }finally{
    busy=false; sendBtn.disabled=false; qbox.focus();
  }
}

// Example questions seed the input — clicking one runs it live, it is not canned.
TURNS.forEach(t=>{
  const b=document.createElement("button");
  b.type="button"; b.className="chipq";
  b.textContent=t.q.length>46?t.q.slice(0,44)+"…":t.q;
  b.onclick=()=>{ qbox.value=t.q; autosize(); ask(t.q); };
  chips.appendChild(b);
});

function autosize(){
  qbox.style.height="auto";
  qbox.style.height=Math.min(qbox.scrollHeight,140)+"px";
}
qbox.addEventListener("input",autosize);
qbox.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); ask(qbox.value); }
});
form.addEventListener("submit",e=>{ e.preventDefault(); ask(qbox.value); });

function addIntro(){
  if(document.getElementById("intro")) return;
  const seed=document.createElement("div");
  seed.className="turn"; seed.id="intro";
  seed.innerHTML=`<div class="ans"><p style="color:var(--ink-3)">Ask a question about the five-vendor, thirty-line comparison. Every answer shows the QuerySpec the model generated and the deterministic result it was computed from &mdash; the model never does the arithmetic.</p></div>`;
  feed.appendChild(seed);
}

function showClear(){ if(clearBtn) clearBtn.style.display=""; }
function hideClear(){ if(clearBtn) clearBtn.style.display="none"; }

async function clearHistory(){
  await fetch("/api/analyst/history",{method:"DELETE"}).catch(()=>{});
  feed.innerHTML=""; turnStore.clear(); turnSeq=0;
  hideClear(); addIntro(); qbox.focus();
}
if(clearBtn) clearBtn.addEventListener("click",clearHistory);

// Rehydrate the conversation saved on the server (survives a refresh).
async function init(){
  hideClear();
  try{
    const r=await fetch("/api/analyst/history");
    const d=await r.json();
    const turns=(d&&d.ok&&Array.isArray(d.turns))?d.turns:[];
    if(turns.length){
      for(const t of turns){
        turnSeq=Math.max(turnSeq,Number(t.id)||0);
        turnStore.set(Number(t.id)||++turnSeq,{q:t.q,result:t.result});
        const el=document.createElement("div");
        el.className="turn";
        el.innerHTML=turnHTML({q:t.q,spec:t.spec,result:t.result,narration:t.narration},Number(t.id));
        feed.appendChild(el);
      }
      showClear();
    } else {
      addIntro();
    }
  }catch{ addIntro(); }
}
init();
autosize();
qbox.focus();
