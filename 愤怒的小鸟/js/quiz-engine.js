(function(root, factory){
  var api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.VocabularyQuiz = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  var SPECIAL_BIRDS=['Y','B','K','W'];

  function cleanNumber(value){
    return Number.isFinite(value)&&value>=0?Math.floor(value):0;
  }

  function createLearningState(unit, saved){
    saved=saved||{};
    var state={};
    unit.words.forEach(function(word){
      var previous=saved[word.term]||{};
      state[word.term]={
        shown:cleanNumber(previous.shown),
        correct:cleanNumber(previous.correct),
        wrong:cleanNumber(previous.wrong),
        nextExample:cleanNumber(previous.nextExample)%word.examples.length
      };
    });
    return state;
  }

  function createAttempt(){
    return {wrongAnswers:0,correctStreak:0,correctAnswers:0,wrongTerms:{}};
  }

  function compareTuple(a,b){
    for(var i=0;i<a.length;i++){
      if(a[i]!==b[i])return a[i]-b[i];
    }
    return 0;
  }

  function priority(word,learning,attempt){
    var stats=learning[word.term];
    return [
      attempt.wrongTerms[word.term]?0:1,
      stats.shown===0?0:1,
      stats.correct,
      stats.shown
    ];
  }

  function shuffled(values,rng){
    var out=values.slice();
    for(var i=out.length-1;i>0;i--){
      var j=Math.floor(rng()*(i+1));
      var tmp=out[i];out[i]=out[j];out[j]=tmp;
    }
    return out;
  }

  function buildQuestion(unit,learning,attempt,rng){
    rng=rng||Math.random;
    var best=[];
    var bestPriority=null;
    unit.words.forEach(function(word){
      if(!learning[word.term])learning[word.term]={shown:0,correct:0,wrong:0,nextExample:0};
      var current=priority(word,learning,attempt);
      var cmp=bestPriority?compareTuple(current,bestPriority):-1;
      if(cmp<0){best=[word];bestPriority=current;}
      else if(cmp===0)best.push(word);
    });
    var word=best[Math.floor(rng()*best.length)];
    var stats=learning[word.term];
    var exampleIndex=stats.nextExample%word.examples.length;
    var sentence=word.examples[exampleIndex];
    stats.shown+=1;
    stats.nextExample=(exampleIndex+1)%word.examples.length;
    var distractors=shuffled(unit.words.filter(function(candidate){
      return candidate.term!==word.term;
    }).map(function(candidate){return candidate.term;}),rng).slice(0,3);
    return {
      unitId:unit.id,
      term:word.term,
      sentence:sentence,
      completedSentence:sentence.replace('___',word.term),
      choices:shuffled([word.term].concat(distractors),rng)
    };
  }

  function answerResult(correct,failed,awardedBirds,attempt){
    return {
      correct:correct,
      failed:failed,
      awardedBirds:awardedBirds,
      correctStreak:attempt.correctStreak,
      wrongAnswers:attempt.wrongAnswers
    };
  }

  function submitAnswer(question,selected,learning,attempt,rng){
    rng=rng||Math.random;
    var stats=learning[question.term];
    if(selected===question.term){
      stats.correct+=1;
      attempt.correctStreak+=1;
      attempt.correctAnswers+=1;
      delete attempt.wrongTerms[question.term];
      var birds=['R'];
      if(attempt.correctStreak%4===0){
        birds.push(SPECIAL_BIRDS[Math.floor(rng()*SPECIAL_BIRDS.length)]);
      }
      return answerResult(true,false,birds,attempt);
    }
    stats.wrong+=1;
    attempt.wrongAnswers+=1;
    attempt.correctStreak=0;
    attempt.wrongTerms[question.term]=true;
    return answerResult(false,attempt.wrongAnswers>=3,[],attempt);
  }

  return {
    SPECIAL_BIRDS:SPECIAL_BIRDS.slice(),
    createLearningState:createLearningState,
    createAttempt:createAttempt,
    buildQuestion:buildQuestion,
    submitAnswer:submitAnswer
  };
});
