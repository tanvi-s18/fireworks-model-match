(function (root) {
  'use strict';
  const categories = ['Billing', 'Technical', 'Account access', 'Human review'];
  const tickets = [
    {id:1, title:'Charged twice this month', text:'My card was charged twice for the same subscription this month. Can you refund the duplicate payment?', expected:'Billing', kind:'Routine', note:'The request is about a duplicate payment, so Billing owns it.'},
    {id:2, title:'Upload gets stuck at 90%', text:'Every time I upload a CSV, the progress bar stops at 90% and the page freezes. I tried another browser too.', expected:'Technical', kind:'Routine', note:'A repeatable product malfunction belongs to Technical.'},
    {id:3, title:'Password reset never arrives', text:'I forgot my password and none of the reset emails arrive. I checked spam. Can you help me get back in?', expected:'Account access', kind:'Routine', note:'The user cannot authenticate. Account access is the correct route.'},
    {id:4, title:'Need an invoice for finance', text:'Could you send a VAT invoice for our last payment? Our finance team needs the company address on it.', expected:'Billing', kind:'Routine', note:'Invoice requests go to Billing.'},
    {id:5, title:'Export button does nothing', text:'The dashboard loads, but clicking Export does nothing. It worked yesterday. I am already signed in.', expected:'Technical', kind:'Routine', note:'The user is signed in; the failure concerns a product feature.'},
    {id:6, title:'Lost my authenticator', text:'I replaced my phone and lost the authenticator app. I can no longer pass the two-factor login screen.', expected:'Account access', kind:'Routine', note:'Recovery of two-factor authentication belongs to Account access.'},
    {id:7, title:'Paid, but still on the free plan', text:'My payment went through and the receipt is correct. I can sign in, but the app still hides every Pro feature. The plan status seems stuck.', expected:'Technical', kind:'Edge case', note:'The payment succeeded and login works. The reported defect is feature entitlement inside the product.'},
    {id:8, title:'Refund and a broken login', text:'I need a refund for last month. Separately, I lost access to my account after changing my email. Please fix both.', expected:'Human review', kind:'Mixed intent', note:'Two separate requests need different teams. The routing policy sends mixed intents to Human review.'},
    {id:9, title:'“Billing” page crashes', text:'I am not disputing a charge. Opening the Billing tab crashes the application with error 503. Other pages work.', expected:'Technical', kind:'Edge case', note:'The word Billing is a distraction. A crashing application page is a technical issue.'},
    {id:10, title:'Please stop charging me', text:'Nothing is broken and I can sign in. I simply want to cancel my renewal and understand the final charge.', expected:'Billing', kind:'Edge case', note:'Cancellation and payment questions belong to Billing, even when the text mentions login.'},
    {id:11, title:'Someone changed my email', text:'I received an email-change notification I did not request, and my password no longer works. Please help me recover my account.', expected:'Account access', kind:'Edge case', note:'Account recovery is the primary request. Route to Account access; a production policy would also define security escalation.'},
    {id:12, title:'Everything is wrong', text:'It happened again after what we discussed last week. You know the one. Can someone finally sort this out?', expected:'Human review', kind:'Missing context', note:'There is no usable context to choose a team. Ask a human to clarify instead of guessing.'}
  ];
  const scenarios = {
    everyday:{name:'Everyday inbox', subtitle:'6 routine tickets + 2 tricky cases', ids:[1,2,3,4,5,6,7,8]},
    tricky:{name:'Stress-test the edges', subtitle:'Ambiguity, mixed intent & missing context', ids:[5,6,7,8,9,10,11,12]}
  };
  // All outputs, timing and costs below are invented fixtures. They are not measurements.
  const models = [
    {id:'glm', name:'GLM 5.3 Flash', provider:'Z.ai', symbol:'G', color:'violet', modelId:'accounts/fireworks/models/glm-5p3-flash', role:'Budget profile', description:'The low-cost baseline in this simulation.', perThousand:0.12, times:[480,590,620,660,710,680,900,870,1150,1230,1320,1410], outputs:['Billing','Technical','Account access','Billing','Technical','Account access','Billing','Billing','Billing','Billing','Technical','Technical']},
    {id:'deepseek', name:'DeepSeek V4.1 Flash', provider:'DeepSeek', symbol:'D', color:'blue', modelId:'accounts/fireworks/models/deepseek-v4p1-flash', role:'Speed profile', description:'The fastest responses in this simulation.', perThousand:0.48, times:[310,340,350,390,430,450,510,530,610,630,650,720], outputs:['Billing','Technical','Account access','Billing','Technical','Account access','Technical','Account access','Technical','Billing','Account access','Technical']},
    {id:'kimi', name:'Kimi K3', provider:'Moonshot AI', symbol:'K', color:'ink', modelId:'accounts/fireworks/models/kimi-k3', role:'Quality profile', description:'The widest test coverage in this simulation.', perThousand:1.60, times:[900,1050,1100,1200,1250,1350,1600,1800,1850,1900,1950,2200], outputs:['Billing','Technical','Account access','Billing','Technical','Account access','Technical','Human review','Technical','Billing','Account access','Account access']}
  ];
  const prompt = 'Route the support ticket to exactly one category: Billing, Technical, Account access, or Human review. Billing handles payments, invoices and cancellation. Technical handles product errors, including paid features not activating after a successful payment. Account access handles login and account recovery. Use Human review for multiple independent requests needing different teams or insufficient context. Return only JSON with a single key "category".';
  const defaults = {scenario:'everyday', minCorrect:7, maxLatency:2, budget:20, volume:10000, priority:'cost', overrides:{}, step:'setup', hasCompared:false};
  function median(values) { const a=[...values].sort((x,y)=>x-y); const i=Math.floor(a.length/2); return a.length%2?a[i]:(a[i-1]+a[i])/2; }
  function evaluate(state) {
    const selected=scenarios[state.scenario].ids.map(id=>tickets.find(t=>t.id===id));
    const results=models.map(m=>{
      const rows=selected.map(t=>{const expected=state.overrides[t.id]||t.expected; return {...t, expected, output:m.outputs[t.id-1], correct:m.outputs[t.id-1]===expected, latency:m.times[t.id-1]};});
      const correct=rows.filter(t=>t.correct).length, latency=median(rows.map(t=>t.latency))/1000, cost=m.perThousand*state.volume/1000;
      const violations=[];
      if(correct<state.minCorrect) violations.push({type:'quality',text:`${correct}/${rows.length} correct; you need ${state.minCorrect}/${rows.length}`});
      if(latency>state.maxLatency) violations.push({type:'speed',text:`${latency.toFixed(2)}s median exceeds ${state.maxLatency.toFixed(1)}s`});
      if(cost>state.budget) violations.push({type:'cost',text:`$${cost.toFixed(2)}/mo exceeds $${state.budget}`});
      return {...m,rows,correct,total:rows.length,accuracy:correct/rows.length*100,latency,cost,violations,qualifies:!violations.length};
    });
    const eligible=results.filter(r=>r.qualifies).sort((a,b)=>state.priority==='quality'?(b.correct-a.correct||a.cost-b.cost||a.latency-b.latency):state.priority==='speed'?(a.latency-b.latency||a.cost-b.cost||b.correct-a.correct):(a.cost-b.cost||b.correct-a.correct||a.latency-b.latency));
    return {results,winner:eligible[0]||null,selected};
  }
  const api={categories,tickets,scenarios,models,prompt,defaults,median,evaluate};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.ModelMatch=api;
})(typeof globalThis!=='undefined'?globalThis:this);
