(function(root,factory){
  var data=factory();
  if(typeof module==='object'&&module.exports)module.exports=data;
  if(root)root.VOCAB_LEVELS=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  var PH=1.55,PW=0.24,TOP=0.24;
  var pigRadius={s:0.35,m:0.45,l:0.6,h:0.45};
  function block(x,y,w,h,mat){return {k:'b',x:x,y:y,w:w,h:h,m:mat};}
  function pig(x,y,size){return {k:'p',x:x,y:y,s:size||'s'};}
  function tnt(x,y){return {k:'t',x:x,y:y,w:0.6,h:0.6};}
  function pigY(surface,size){return surface+pigRadius[size||'s'];}
  function hut(a,x,mat,y){
    y=y||0;
    a.push(block(x-0.7,y+PH/2,PW,PH,mat));
    a.push(block(x+0.7,y+PH/2,PW,PH,mat));
    a.push(block(x,y+PH+TOP/2,1.75,TOP,mat));
    return y+PH+TOP;
  }
  function bridge(a,left,right,mat,y){
    y=y||0;
    a.push(block(left,y+PH/2,PW,PH,mat));
    a.push(block(right,y+PH/2,PW,PH,mat));
    a.push(block((left+right)/2,y+PH+TOP/2,right-left+0.45,TOP,mat));
    return y+PH+TOP;
  }
  function tower(a,x,materials,stories,y){
    var top=y||0;
    for(var story=0;story<stories;story++)top=hut(a,x,materials[story%materials.length],top);
    return top;
  }
  function sizedPig(a,slot,index,helmetSlot){
    var size=index===helmetSlot?'h':slot[2];
    a.push(pig(slot[0],pigY(slot[1],size),size));
  }
  function level(id,name,theme,chapter,items){
    return {id:id,unitId:id,name:name,theme:theme,chapter:chapter,items:items};
  }

  var chapters=[
    {id:1,name:'First Steps',desc:'Open structures and clear targets · Units 1-3',units:['1A','1B','2A','2B','3A','3B']},
    {id:2,name:'Growing Skills',desc:'Mixed materials and linked towers · Units 4-6',units:['4A','4B','5A','5B','6A','6B']},
    {id:3,name:'Big Ideas',desc:'Layered bridges and chain reactions · Units 7-9',units:['7A','7B','8A','8B','9A','9B']},
    {id:4,name:'World Challenges',desc:'Dense forts and advanced demolition · Units 10-12',units:['10A','10B','11A','11B','12A','12B']}
  ];

  function buildOpenVillage(config){
    var a=[],centers=[7.5,11,14.5,18],tops=[];
    centers.forEach(function(x,index){
      tops.push(hut(a,x,config.materials[index%config.materials.length],0));
    });
    a.push(
      block(6,0.15,1,0.3,config.materials[1]),
      block(9.25,0.15,1,0.3,config.materials[2]),
      block(12.75,0.15,1,0.3,config.materials[0]),
      block(16.25,0.15,1,0.3,config.materials[1]),
      block(9.25,PH+TOP+0.12,2.2,0.24,config.materials[2]),
      block(16.25,PH+TOP+0.12,2.2,0.24,config.materials[0])
    );
    var slots=[];
    centers.forEach(function(x,index){
      slots.push([x,0,index%2?'m':'s'],[x,tops[index],'s']);
    });
    slots.push(
      [6,0.3,'s'],[9.25,0.3,'m'],[12.75,0.3,'s'],[16.25,0.3,'m'],
      [4.5,0,'s'],[5.25,0,'s'],[19.65,0,'s']
    );
    slots.forEach(function(slot,index){sizedPig(a,slot,index,config.helmetSlot);});
    config.tntX.forEach(function(x){a.push(tnt(x,0.3));});
    return level(config.id,config.name,config.theme,1,a);
  }

  var firstChapter=[
    {id:'1A',name:'Explorer Village',theme:'grass',materials:['wood','ice','wood'],helmetSlot:7,tntX:[]},
    {id:'1B',name:'Nature Crossing',theme:'grass',materials:['ice','wood','stone'],helmetSlot:10,tntX:[]},
    {id:'2A',name:'Athlete Arena',theme:'grass',materials:['wood','stone','ice'],helmetSlot:3,tntX:[]},
    {id:'2B',name:'Healthy Garden',theme:'ice',materials:['ice','wood','ice'],helmetSlot:9,tntX:[]},
    {id:'3A',name:'Lucky History Hall',theme:'grass',materials:['stone','wood','ice'],helmetSlot:5,tntX:[10.15]},
    {id:'3B',name:'Project Market',theme:'dusk',materials:['wood','ice','stone'],helmetSlot:12,tntX:[15.35]}
  ].map(buildOpenVillage);

  function build4AOpenVillage(){
    var a=[];
    [7.5,11,14.5,18].forEach(function(x){
      var top=hut(a,x,'wood',0);
      var topSize=x===18?'h':'s';
      a.push(pig(x,pigY(0,'s'),'s'),pig(x,pigY(top,topSize),topSize));
    });
    a.push(
      block(6,0.15,1,0.3,'stone'),block(9.25,0.15,1,0.3,'ice'),
      block(12.75,0.15,1,0.3,'stone'),block(16.25,0.15,1,0.3,'ice'),
      block(9.25,PH+TOP+0.12,2.2,0.24,'ice'),
      block(16.25,PH+TOP+0.12,2.2,0.24,'stone')
    );
    a.push(pig(6,pigY(0.3,'s'),'s'),pig(9.25,pigY(0.3,'m'),'m'),
      pig(12.75,pigY(0.3,'s'),'s'),pig(16.25,pigY(0.3,'m'),'m'),
      pig(4.5,pigY(0,'s'),'s'),pig(5.25,pigY(0,'s'),'s'),
      pig(19.65,pigY(0,'s'),'s'));
    return level('4A','Agreement Village','grass',2,a);
  }

  function build4BWorkshopTowers(){
    var a=[];
    var t1=hut(a,8,'wood',0);hut(a,8,'stone',t1);
    var t2=hut(a,13,'stone',0);hut(a,13,'wood',t2);
    var t3=hut(a,18,'wood',0);hut(a,18,'stone',t3);
    a.push(block(10.5,t1*2+0.12,4,0.24,'ice'));
    a.push(
      pig(8,pigY(0,'s'),'s'),pig(8,pigY(t1,'m'),'m'),pig(8,pigY(t1*2,'s'),'s'),
      pig(13,pigY(0,'m'),'m'),pig(13,pigY(t2,'s'),'s'),pig(13,pigY(t2*2,'s'),'s'),
      pig(18,pigY(0,'s'),'s'),pig(18,pigY(t3,'m'),'m'),pig(18,pigY(t3*2,'h'),'h'),
      pig(6,pigY(0,'s'),'s'),pig(10.5,pigY(0,'s'),'s'),pig(15.5,pigY(0,'s'),'s'),
      pig(5.25,pigY(0,'s'),'s'),pig(11.25,pigY(0,'s'),'s'),pig(19.65,pigY(0,'s'),'s')
    );
    return level('4B','Metal Workshop','stone',2,a);
  }

  function build5AHazardYard(){
    var a=[];
    var left=hut(a,7.5,'wood',0),mid=hut(a,12.5,'ice',0),right=hut(a,17.5,'wood',0);
    bridge(a,9.4,10.8,'ice',0);bridge(a,14.4,15.8,'wood',0);
    a.push(tnt(10.1,0.3),tnt(15.1,0.3));
    a.push(block(7.5,left+0.12,2.2,0.24,'stone'));
    a.push(block(10.1,PH+TOP+0.12,2.2,0.24,'stone'),block(15.1,PH+TOP+0.12,2.2,0.24,'ice'));
    a.push(
      pig(7.5,pigY(0,'s'),'s'),pig(7.5,pigY(left+0.24,'m'),'m'),
      pig(12.5,pigY(0,'s'),'s'),pig(12.5,pigY(mid,'h'),'h'),
      pig(17.5,pigY(0,'s'),'s'),pig(17.5,pigY(right,'m'),'m'),
      pig(10.1,pigY(PH+TOP+0.24,'s'),'s'),pig(15.1,pigY(PH+TOP+0.24,'s'),'s'),
      pig(6,pigY(0,'s'),'s'),pig(9,pigY(0,'s'),'s'),
      pig(14,pigY(0,'s'),'s'),pig(19.2,pigY(0,'s'),'s'),
      pig(5.25,pigY(0,'s'),'s'),pig(11.25,pigY(0,'s'),'s'),pig(20,pigY(0,'s'),'s')
    );
    return level('5A','Hazard Yard','dusk',2,a);
  }

  function build5BWidePlatforms(){
    var a=[];
    var p1=bridge(a,6.4,9.2,'wood',0);
    var p2=bridge(a,10.4,13.6,'ice',0);
    var p3=bridge(a,14.8,18.8,'wood',0);
    a.push(block(8.5,p1+0.7,PW,1.4,'ice'),block(12,p2+0.7,PW,1.4,'wood'),block(17,p3+0.7,PW,1.4,'ice'));
    var upper=hut(a,12,'stone',p2);
    a.push(block(17,p3+0.12,2.4,0.24,'stone'),
      block(9.8,p1+0.12,1.2,0.24,'stone'),block(14.2,p2+0.12,1.2,0.24,'stone'));
    a.push(
      pig(7,pigY(0,'s'),'s'),pig(8.6,pigY(0,'m'),'m'),pig(7.8,pigY(p1,'s'),'s'),
      pig(10.9,pigY(0,'s'),'s'),pig(13.1,pigY(0,'s'),'s'),pig(12,pigY(p2,'m'),'m'),
      pig(15.5,pigY(0,'s'),'s'),pig(18.1,pigY(0,'m'),'m'),pig(17,pigY(p3+0.24,'s'),'s'),
      pig(6,pigY(0,'s'),'s'),pig(14.2,pigY(0,'s'),'s'),pig(19.6,pigY(0,'s'),'s'),
      pig(12,pigY(upper,'h'),'h'),pig(5.2,pigY(0,'s'),'s'),pig(8.65,pigY(p1,'s'),'s')
    );
    return level('5B','Direction Bridges','ice',2,a);
  }

  function build6AFestivalFort(){
    var a=[];
    var l1=hut(a,7.5,'wood',0);hut(a,7.5,'ice',l1);
    var l2=hut(a,12.5,'stone',0);hut(a,12.5,'wood',l2);
    var l3=hut(a,17.5,'ice',0);hut(a,17.5,'wood',l3);
    a.push(tnt(10,0.3),tnt(15,0.3));
    a.push(block(10,l1*2+0.12,3.8,0.24,'stone'));
    a.push(
      pig(7.5,pigY(0,'s'),'s'),pig(7.5,pigY(l1,'s'),'s'),pig(7.5,pigY(l1*2,'m'),'m'),
      pig(12.5,pigY(0,'m'),'m'),pig(12.5,pigY(l2,'s'),'s'),pig(12.5,pigY(l2*2,'h'),'h'),
      pig(17.5,pigY(0,'s'),'s'),pig(17.5,pigY(l3,'s'),'s'),pig(17.5,pigY(l3*2,'m'),'m'),
      pig(6,pigY(0,'s'),'s'),pig(10,pigY(0.6,'s'),'s'),pig(15,pigY(0.6,'s'),'s'),
      pig(5.2,pigY(0,'s'),'s'),pig(11,pigY(0,'s'),'s'),pig(19.65,pigY(0,'s'),'s')
    );
    return level('6A','Speech Festival Fort','dusk',2,a);
  }

  function build6BForestStronghold(){
    var a=[];
    var left=hut(a,7,'wood',0);hut(a,7,'stone',left);
    var center=bridge(a,9.5,14.5,'stone',0);hut(a,12,'ice',center);
    var right=hut(a,18,'stone',0);hut(a,18,'wood',right);
    a.push(block(9.5,center+0.85,PW,1.7,'wood'),block(14.5,center+0.85,PW,1.7,'wood'));
    a.push(
      pig(7,pigY(0,'s'),'s'),pig(7,pigY(left,'m'),'m'),pig(7,pigY(left*2,'s'),'s'),
      pig(10.5,pigY(0,'s'),'s'),pig(12,pigY(0,'l'),'l'),pig(13.5,pigY(0,'s'),'s'),
      pig(12,pigY(center,'m'),'m'),pig(12,pigY(center+PH+TOP,'s'),'s'),
      pig(18,pigY(0,'m'),'m'),pig(18,pigY(right,'s'),'s'),pig(18,pigY(right*2,'h'),'h'),
      pig(19.7,pigY(0,'s'),'s'),pig(5.2,pigY(0,'s'),'s'),
      pig(8.6,pigY(0,'s'),'s'),pig(16,pigY(0,'s'),'s')
    );
    return level('6B','Forest Stronghold','night',2,a);
  }

  var secondChapter=[build4AOpenVillage(),build4BWorkshopTowers(),build5AHazardYard(),
    build5BWidePlatforms(),build6AFestivalFort(),build6BForestStronghold()];

  function buildChainBridge(config){
    var a=[];
    var p1=bridge(a,6.4,9.2,config.materials[0],0);
    var p2=bridge(a,10.4,13.6,config.materials[1],0);
    var p3=bridge(a,14.8,18.8,config.materials[2],0);
    a.push(
      block(8.5,p1+0.7,PW,1.4,config.materials[1]),
      block(12,p2+0.7,PW,1.4,config.materials[2]),
      block(17,p3+0.7,PW,1.4,config.materials[0])
    );
    var upper=hut(a,12,config.materials[0],p2);
    a.push(
      block(17,p3+0.12,2.4,0.24,config.materials[1]),
      block(9.8,p1+0.12,1.2,0.24,config.materials[2]),
      block(14.2,p2+0.12,1.2,0.24,config.materials[0])
    );
    var slots=[
      [7,0,'s'],[8.6,0,'m'],[7.8,p1,'s'],[10.9,0,'s'],[13.1,0,'s'],
      [12,p2,'m'],[15.5,0,'s'],[18.1,0,'m'],[17,p3+0.24,'s'],[6,0,'s'],
      [14.2,0,'s'],[19.6,0,'s'],[12,upper,'s'],[5.2,0,'s'],[8.65,p1,'s']
    ];
    slots.forEach(function(slot,index){sizedPig(a,slot,index,config.helmetSlot);});
    config.tntX.forEach(function(x){a.push(tnt(x,0.3));});
    return level(config.id,config.name,config.theme,3,a);
  }

  var thirdChapter=[
    {id:'7A',name:'Memory Causeway',theme:'ice',materials:['ice','wood','stone'],helmetSlot:12,tntX:[]},
    {id:'7B',name:'Mind Trick Keep',theme:'dusk',materials:['wood','stone','ice'],helmetSlot:5,tntX:[9.8]},
    {id:'8A',name:'Frozen Crossing',theme:'ice',materials:['ice','stone','wood'],helmetSlot:8,tntX:[]},
    {id:'8B',name:'Laughing Gallery',theme:'grass',materials:['wood','ice','stone'],helmetSlot:2,tntX:[14.2]},
    {id:'9A',name:'Tourist Center',theme:'stone',materials:['stone','wood','ice'],helmetSlot:11,tntX:[9.8]},
    {id:'9B',name:'Inventor Liftworks',theme:'night',materials:['stone','ice','wood'],helmetSlot:6,tntX:[9.8,14.2]}
  ].map(buildChainBridge);

  function buildLayeredFort(config){
    var a=[],centers=[7.5,12.5,17.5],tops=[];
    centers.forEach(function(x,index){
      var mats=[config.materials[index%3],config.materials[(index+1)%3]];
      tops.push(tower(a,x,mats,2,0));
    });
    a.push(
      block(10,tops[0]+0.12,3.8,0.24,config.materials[2]),
      block(15,tops[2]+0.12,3.8,0.24,config.materials[1]),
      block(12.5,tops[1]+0.42,6.6,0.24,config.materials[0])
    );
    config.tntX.forEach(function(x){a.push(tnt(x,0.3));});
    var unit=PH+TOP;
    var slots=[
      [7.5,0,'s'],[7.5,unit,'s'],[7.5,tops[0],'m'],
      [12.5,0,'m'],[12.5,unit,'s'],[12.5,tops[1]+0.54,'s'],
      [17.5,0,'s'],[17.5,unit,'s'],[17.5,tops[2],'m'],
      [6,0,'s'],[10,config.tntX.indexOf(10)>=0?0.6:0,'s'],
      [15,config.tntX.indexOf(15)>=0?0.6:0,'s'],[5.2,0,'s'],[11,0,'s'],[19.65,0,'s']
    ];
    slots.forEach(function(slot,index){sizedPig(a,slot,index,config.helmetSlot);});
    return level(config.id,config.name,config.theme,4,a);
  }

  var fourthChapter=[
    {id:'10A',name:'Forecast Power Plant',theme:'dusk',materials:['wood','stone','ice'],helmetSlot:5,tntX:[10]},
    {id:'10B',name:'Warning Depot',theme:'stone',materials:['stone','wood','ice'],helmetSlot:8,tntX:[15]},
    {id:'11A',name:'Hidden Storehouse',theme:'night',materials:['ice','stone','wood'],helmetSlot:2,tntX:[10,15]},
    {id:'11B',name:'Hunter Heights',theme:'stone',materials:['stone','ice','wood'],helmetSlot:13,tntX:[15]},
    {id:'12A',name:'Rough Factory',theme:'dusk',materials:['wood','stone','ice'],helmetSlot:7,tntX:[10,15]},
    {id:'12B',name:'Electric Mirror Citadel',theme:'night',materials:['stone','wood','ice'],helmetSlot:11,tntX:[10,15]}
  ].map(buildLayeredFort);

  return {
    chapters:chapters,
    levels:firstChapter.concat(secondChapter,thirdChapter,fourthChapter),
    pigRadius:pigRadius
  };
});
