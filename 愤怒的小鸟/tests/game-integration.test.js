'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function makeElement(id){
  const classes=new Set();
  return {
    id:id||'',children:[],style:{},dataset:{},textContent:'',innerHTML:'',onclick:null,
    className:'',offsetWidth:100,
    classList:{
      add:function(name){classes.add(name);},
      remove:function(name){classes.delete(name);},
      contains:function(name){return classes.has(name);}
    },
    appendChild:function(child){this.children.push(child);return child;},
    addEventListener:function(){},
    setPointerCapture:function(){},
    querySelector:function(){return makeElement();},
    querySelectorAll:function(){return [makeElement(),makeElement(),makeElement()];},
    getContext:function(){
      const gradient={addColorStop:function(){}};
      return new Proxy({}, {get:function(target,key){
        if(key==='createLinearGradient'||key==='createRadialGradient')return function(){return gradient;};
        if(key==='measureText')return function(){return {width:20};};
        return target[key]||(target[key]=function(){});
      },set:function(target,key,value){target[key]=value;return true;}});
    }
  };
}

function loadGame(){
  const html=fs.readFileSync('index.html','utf8');
  const elements={};
  for(const match of html.matchAll(/id="([^"]+)"/g))elements[match[1]]=makeElement(match[1]);
  const storage={};
  const timers={scheduled:[],cleared:[]};
  const frames=[];
  function audioParam(){return {value:0,setValueAtTime:function(){},exponentialRampToValueAtTime:function(){}};}
  function audioNode(){return {connect:function(){return this;},start:function(){},stop:function(){},gain:audioParam(),frequency:audioParam()};}
  function FakeAudioContext(){this.sampleRate=44100;this.currentTime=0;this.state='running';this.destination=audioNode();}
  FakeAudioContext.prototype.createGain=function(){return audioNode();};
  FakeAudioContext.prototype.createOscillator=function(){return audioNode();};
  FakeAudioContext.prototype.createBufferSource=function(){var node=audioNode();node.buffer=null;node.loop=false;return node;};
  FakeAudioContext.prototype.createBiquadFilter=function(){var node=audioNode();node.frequency=audioParam();return node;};
  FakeAudioContext.prototype.createBuffer=function(){return {getChannelData:function(){return new Float32Array(32);}};};
  FakeAudioContext.prototype.resume=function(){};
  const context={
    console,
    Math,
    Map,
    Date,
    JSON,
    performance:{now:function(){return 0;}},
    requestAnimationFrame:function(callback){frames.push(callback);return frames.length;},
    cancelAnimationFrame:function(){},
    setTimeout:function(callback,delay){const id=timers.scheduled.length+1;timers.scheduled.push({id,callback,delay});return id;},
    clearTimeout:function(id){timers.cleared.push(id);},
    localStorage:{
      getItem:function(key){return Object.prototype.hasOwnProperty.call(storage,key)?storage[key]:null;},
      setItem:function(key,value){storage[key]=String(value);}
    },
    document:{
      getElementById:function(id){return elements[id]||(elements[id]=makeElement(id));},
      createElement:function(){return makeElement();}
    },
    innerWidth:1280,
    innerHeight:720,
    devicePixelRatio:1,
    AudioContext:FakeAudioContext,
    addEventListener:function(){},
    navigator:{maxTouchPoints:0}
  };
  context.window=context;
  context.globalThis=context;
  context.VOCAB_UNITS=require('../js/vocabulary-data.js');
  context.VocabularyQuiz=require('../js/quiz-engine.js');
  context.VOCAB_LEVELS=require('../js/level-data.js');
  vm.createContext(context);
  const inlineScripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  for(const script of inlineScripts)vm.runInContext(script[1],context,{filename:'index.html'});
  return {context,elements,storage,timers,frames};
}

function advanceFrames(app,count){
  for(let index=1;index<=count;index++){
    const frame=app.frames.shift();
    assert.ok(frame,'animation frame should be scheduled');
    frame(index*16.67);
  }
}

test('starts a vocabulary level with fifteen pigs and an open question', () => {
  const app=loadGame();
  app.context.Game.startLevel(0);
  const debug=app.context.Game.dbg();
  const quiz=app.context.Game.getQuizView();
  assert.equal(debug.pigsAlive,15);
  assert.equal(quiz.open,true);
  assert.equal(quiz.unitId,'4A');
  assert.equal(app.elements.questionChoices.children.length,4);
});

test('a correct answer earns a red bird and persists learning progress', () => {
  const app=loadGame();
  app.context.Game.startLevel(0);
  const quiz=app.context.Game.getQuizView();
  const result=app.context.Game.answerQuestion(quiz.term);
  assert.equal(result.correct,true);
  assert.deepEqual(Array.from(result.awardedBirds),['R']);
  assert.deepEqual(Array.from(app.context.Game.dbg().birds,function(bird){return bird.type;}),['R']);
  assert.ok(app.storage['re0AngryBirds.progress.v1']);
});

test('starting another level discards the previous bird before loading a new reward', () => {
  const app=loadGame();
  app.context.Game.startLevel(0);
  let quiz=app.context.Game.getQuizView();
  app.context.Game.answerQuestion(quiz.term);
  app.context.Game.continueAfterAnswer();
  const previousBird=app.context.Game.dbg().activeBird;
  assert.ok(previousBird);

  app.context.Game.startLevel(1);
  assert.equal(app.context.Game.dbg().activeBird,null);

  quiz=app.context.Game.getQuizView();
  app.context.Game.answerQuestion(quiz.term);
  app.context.Game.continueAfterAnswer();
  const nextLevel=app.context.Game.dbg();
  assert.equal(nextLevel.activeBird.type,'R');
  assert.equal(nextLevel.activeBird,nextLevel.birds[0]);
  assert.notEqual(nextLevel.activeBird,previousBird);
});

test('every structure stays intact before the player launches the first bird', () => {
  const actual=[];
  for(let levelIndex=0;levelIndex<6;levelIndex++){
    const app=loadGame();
    app.context.Game.startLevel(levelIndex);
    const quiz=app.context.Game.getQuizView();
    app.context.Game.answerQuestion(quiz.term);
    app.context.Game.continueAfterAnswer();
    advanceFrames(app,240);
    const debug=app.context.Game.dbg();
    actual.push({pigs:debug.pigsAlive,score:app.elements.scoreVal.textContent});
  }
  assert.deepEqual(actual,Array.from({length:6},() => ({pigs:15,score:'0'})));
});

test('every level opens with upright building blocks', () => {
  const tilts=[];
  for(let levelIndex=0;levelIndex<6;levelIndex++){
    const app=loadGame();
    app.context.Game.startLevel(levelIndex);
    const blocks=app.context.Game.dbg().world.bodies.filter((body) => body.userData.kind==='block');
    const maxTilt=Math.max(...blocks.map((body) => Math.abs(body.angle)));
    tilts.push(Number(maxTilt.toFixed(3)));
  }
  assert.ok(tilts.every((tilt) => tilt<0.08),`opening block tilts: ${tilts.join(', ')}`);
});

test('the third wrong answer ends the attempt with a vocabulary failure', () => {
  const app=loadGame();
  app.context.Game.startLevel(0);
  for(let n=1;n<=3;n++){
    const quiz=app.context.Game.getQuizView();
    const wrong=quiz.choices.find((choice) => choice!==quiz.term);
    const result=app.context.Game.answerQuestion(wrong);
    assert.equal(result.failed,n===3);
    if(n<3)app.context.Game.continueAfterAnswer();
  }
  const debug=app.context.Game.dbg();
  assert.equal(debug.state,'result');
  assert.equal(debug.failureReason,'mistakes');
});

test('background music changes mode without duplicating loops and follows mute', () => {
  const app=loadGame();
  app.context.SFX.unlock();
  app.context.SFX.startMusic('menu');
  const firstCount=app.timers.scheduled.length;
  assert.equal(app.context.SFX.getMusicMode(),'menu');
  app.context.SFX.startMusic('menu');
  assert.equal(app.timers.scheduled.length,firstCount);
  app.context.SFX.startMusic('play');
  assert.equal(app.context.SFX.getMusicMode(),'play');
  assert.ok(app.timers.cleared.length>=1);
  app.context.SFX.setMuted(true);
  assert.equal(app.context.SFX.isMuted(),true);
  const mutedCount=app.timers.scheduled.length;
  app.context.SFX.setMuted(false);
  assert.equal(app.context.SFX.getMusicMode(),'play');
  assert.ok(app.timers.scheduled.length>mutedCount);
});
