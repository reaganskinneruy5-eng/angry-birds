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
  function level(id,name,theme,items){return {id:id,unitId:id,name:name,theme:theme,items:items};}

  function build4AOpenVillage(){
    var a=[];
    [7.5,11,14.5,18].forEach(function(x){
      var top=hut(a,x,'wood',0);
      a.push(pig(x,pigY(0,'s'),'s'),pig(x,pigY(top,'s'),'s'));
    });
    a.push(
      block(6,0.15,1,0.3,'stone'),block(9.25,0.15,1,0.3,'ice'),
      block(12.75,0.15,1,0.3,'stone'),block(16.25,0.15,1,0.3,'ice')
    );
    a.push(pig(6,pigY(0.3,'s'),'s'),pig(9.25,pigY(0.3,'m'),'m'),
      pig(12.75,pigY(0.3,'s'),'s'),pig(16.25,pigY(0.3,'m'),'m'),
      pig(4.5,pigY(0,'s'),'s'),pig(5.25,pigY(0,'s'),'s'),
      pig(19.65,pigY(0,'s'),'s'));
    return level('4A','Agreement Village','grass',a);
  }

  function build4BWorkshopTowers(){
    var a=[];
    var t1=hut(a,8,'wood',0);hut(a,8,'stone',t1);
    var t2=hut(a,13,'stone',0);hut(a,13,'wood',t2);
    var t3=hut(a,18,'wood',0);hut(a,18,'stone',t3);
    a.push(
      pig(8,pigY(0,'s'),'s'),pig(8,pigY(t1,'m'),'m'),pig(8,pigY(t1*2,'s'),'s'),
      pig(13,pigY(0,'m'),'m'),pig(13,pigY(t2,'s'),'s'),pig(13,pigY(t2*2,'s'),'s'),
      pig(18,pigY(0,'s'),'s'),pig(18,pigY(t3,'m'),'m'),pig(18,pigY(t3*2,'s'),'s'),
      pig(6,pigY(0,'s'),'s'),pig(10.5,pigY(0,'s'),'s'),pig(15.5,pigY(0,'s'),'s'),
      pig(5.25,pigY(0,'s'),'s'),pig(11.25,pigY(0,'s'),'s'),pig(19.65,pigY(0,'s'),'s')
    );
    return level('4B','Metal Workshop','stone',a);
  }

  function build5AHazardYard(){
    var a=[];
    var left=hut(a,7.5,'wood',0),mid=hut(a,12.5,'ice',0),right=hut(a,17.5,'wood',0);
    bridge(a,9.4,10.8,'ice',0);bridge(a,14.4,15.8,'wood',0);
    a.push(tnt(10.1,0.3),tnt(15.1,0.3));
    a.push(block(7.5,left+0.12,2.2,0.24,'stone'));
    a.push(
      pig(7.5,pigY(0,'s'),'s'),pig(7.5,pigY(left+0.24,'m'),'m'),
      pig(12.5,pigY(0,'s'),'s'),pig(12.5,pigY(mid,'m'),'m'),
      pig(17.5,pigY(0,'s'),'s'),pig(17.5,pigY(right,'m'),'m'),
      pig(10.1,pigY(PH+TOP,'s'),'s'),pig(15.1,pigY(PH+TOP,'s'),'s'),
      pig(6,pigY(0,'s'),'s'),pig(9,pigY(0,'s'),'s'),
      pig(14,pigY(0,'s'),'s'),pig(19.2,pigY(0,'s'),'s'),
      pig(5.25,pigY(0,'s'),'s'),pig(11.25,pigY(0,'s'),'s'),pig(20,pigY(0,'s'),'s')
    );
    return level('5A','Hazard Yard','dusk',a);
  }

  function build5BWidePlatforms(){
    var a=[];
    var p1=bridge(a,6.4,9.2,'wood',0);
    var p2=bridge(a,10.4,13.6,'ice',0);
    var p3=bridge(a,14.8,18.8,'wood',0);
    a.push(block(8.5,p1+0.7,PW,1.4,'ice'),block(12,p2+0.7,PW,1.4,'wood'),block(17,p3+0.7,PW,1.4,'ice'));
    var upper=hut(a,12,'stone',p2);
    a.push(block(17,p3+0.12,2.4,0.24,'stone'));
    a.push(
      pig(7,pigY(0,'s'),'s'),pig(8.6,pigY(0,'m'),'m'),pig(7.8,pigY(p1,'s'),'s'),
      pig(10.9,pigY(0,'s'),'s'),pig(13.1,pigY(0,'s'),'s'),pig(12,pigY(p2,'m'),'m'),
      pig(15.5,pigY(0,'s'),'s'),pig(18.1,pigY(0,'m'),'m'),pig(17,pigY(p3+0.24,'s'),'s'),
      pig(6,pigY(0,'s'),'s'),pig(14.2,pigY(0,'s'),'s'),pig(19.6,pigY(0,'s'),'s'),
      pig(12,pigY(upper,'s'),'s'),pig(5.2,pigY(0,'s'),'s'),pig(8.65,pigY(p1,'s'),'s')
    );
    return level('5B','Direction Bridges','ice',a);
  }

  function build6AFestivalFort(){
    var a=[];
    var l1=hut(a,7.5,'wood',0);hut(a,7.5,'ice',l1);
    var l2=hut(a,12.5,'stone',0);hut(a,12.5,'wood',l2);
    var l3=hut(a,17.5,'ice',0);hut(a,17.5,'wood',l3);
    a.push(tnt(10,0.3),tnt(15,0.3));
    a.push(
      pig(7.5,pigY(0,'s'),'s'),pig(7.5,pigY(l1,'s'),'s'),pig(7.5,pigY(l1*2,'m'),'m'),
      pig(12.5,pigY(0,'m'),'m'),pig(12.5,pigY(l2,'s'),'s'),pig(12.5,pigY(l2*2,'m'),'m'),
      pig(17.5,pigY(0,'s'),'s'),pig(17.5,pigY(l3,'s'),'s'),pig(17.5,pigY(l3*2,'m'),'m'),
      pig(6,pigY(0,'s'),'s'),pig(10,pigY(0.6,'s'),'s'),pig(15,pigY(0.6,'s'),'s'),
      pig(5.2,pigY(0,'s'),'s'),pig(11,pigY(0,'s'),'s'),pig(19.65,pigY(0,'s'),'s')
    );
    return level('6A','Speech Festival Fort','dusk',a);
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
    return level('6B','Forest Stronghold','night',a);
  }

  return {
    levels:[build4AOpenVillage(),build4BWorkshopTowers(),build5AHazardYard(),
      build5BWidePlatforms(),build6AFestivalFort(),build6BForestStronghold()],
    pigRadius:pigRadius
  };
});
