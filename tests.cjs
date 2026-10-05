const assert = require('node:assert/strict');
const {evaluate,defaults} = require('./data.js');
const run=patch=>evaluate({...structuredClone(defaults),...patch});
assert.deepEqual(run().results.map(r=>r.correct),[6,7,8]);
assert.equal(run().winner.id,'deepseek','Default quality bar rules out the cheapest model');
assert.equal(run({minCorrect:6}).winner.id,'glm','Relaxed quality with cost priority chooses budget profile');
assert.equal(run({minCorrect:6,priority:'speed'}).winner.id,'deepseek','Speed preference changes the selected model');
assert.equal(run({priority:'quality'}).winner.id,'kimi');
assert.equal(run({minCorrect:8}).winner.id,'kimi');
assert.equal(run({minCorrect:8,maxLatency:1}).winner,null,'Incompatible quality and timing limits must not produce a winner');
assert.equal(run({budget:1}).winner,null,'Nothing meets the default quality bar at $1');
assert.equal(run({scenario:'tricky'}).winner.id,'kimi');
assert.equal(run({scenario:'tricky',minCorrect:8}).winner,null,'All candidates miss at least one hard case');
assert.equal(run({volume:100000}).winner,null,'Volume makes qualifying candidates exceed the default budget');
assert.equal(run({overrides:{8:'Account access'}}).winner.id,'deepseek');
assert.equal(run({overrides:{8:'Account access'}}).results[1].correct,8,'Reviewed labels affect the score');
assert.equal(run().results[0].latency,.67,'Median uses the middle pair of selected timings');
assert.equal(run().results[1].cost,4.8,'Cost calculation scales the demo rate by monthly volume');
// Check the key product invariant over realistic combinations of all settings.
let combinations=0;
for(const scenario of ['everyday','tricky']) for(const minCorrect of [4,5,6,7,8]) for(const maxLatency of [.5,1,2,3,5]) for(const budget of [1,5,20,50]) for(const volume of [1000,10000,100000]) for(const priority of ['cost','speed','quality']){
  const e=run({scenario,minCorrect,maxLatency,budget,volume,priority});
  if(e.winner){assert.ok(e.winner.correct>=minCorrect);assert.ok(e.winner.latency<=maxLatency);assert.ok(e.winner.cost<=budget);}
  else assert.ok(e.results.every(r=>r.violations.length>0));
  combinations++;
}
console.log(`15 decision checks passed; no invalid winners across ${combinations} requirement combinations.`);
