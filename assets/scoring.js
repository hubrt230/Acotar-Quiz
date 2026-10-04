/* Normalized affinity, not a scientific compatibility percentage. */
(function(root){
function rank(quiz,answers,allowed){
 const keys=Object.keys(quiz.results).filter(k=>!allowed||allowed.includes(k));
 const scores=keys.map((key,index)=>{
  let earned=0,max=0;
  quiz.questions.forEach((q,i)=>{max+=Math.max(...q.answers.map(a=>a.weights[key]||0));earned+=q.answers[answers[i]]?.weights[key]||0});
  return {key,score:max?earned/max:0,index};
 });
 return scores.sort((a,b)=>b.score-a.score||a.index-b.index);
}
root.AcotarScoring={rank};if(typeof module!=='undefined')module.exports={rank};
})(typeof window!=='undefined'?window:globalThis);
