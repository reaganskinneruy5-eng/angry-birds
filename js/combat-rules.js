(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CombatRules=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  var PIG_HP={s:60,m:90,l:150,h:120};
  var BIRD_RESTITUTION={R:0.56,Y:0.5,B:0.68,K:0.38,W:0.58};
  var MATERIAL_DAMAGE={ice:0.85,wood:1.05,stone:1.35,tnt:1.2};

  function finitePositive(value){
    return Number.isFinite(value)&&value>0?value:0;
  }

  function reducedMass(firstMass,secondMass){
    var a=finitePositive(firstMass),b=finitePositive(secondMass);
    return a&&b?(a*b)/(a+b):0;
  }

  function structureImpactDamage(material,structureMass,pigMass,relativeSpeed){
    var speed=finitePositive(relativeSpeed);
    if(speed<1.8)return 0;
    var energy=0.5*reducedMass(structureMass,pigMass)*speed*speed;
    return energy*14*(MATERIAL_DAMAGE[material]||1);
  }

  function birdRestitution(type){
    return BIRD_RESTITUTION[type]||BIRD_RESTITUTION.R;
  }

  function pigHitPoints(size){
    return PIG_HP[size]||PIG_HP.s;
  }

  function starsForResult(wrongAnswers,birdsUsed){
    if(wrongAnswers===0&&birdsUsed<=12)return 3;
    if(wrongAnswers<=1&&birdsUsed<=15)return 2;
    return 1;
  }

  return {
    reducedMass:reducedMass,
    structureImpactDamage:structureImpactDamage,
    birdRestitution:birdRestitution,
    pigHitPoints:pigHitPoints,
    starsForResult:starsForResult
  };
});
