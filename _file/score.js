// sql
// usertabelle
//  id
//  hash
//  name
//  erstdatum
//  letztesdatum
// scoretabelle
//  userid
//  filename
//  filehash
//  score = 100 / (MaxStage * Date.length) * answercount
//  time
//  elapsedtime

// html5
//  filename
//  filehash
//  score
//  time
//  elapsedtime
//  synced = true/false

// last time trained
// trainerselectorbg => weiß (kein score in der Zeit)
//                      grün (100% score in der Zeit)
//                      gelb (60%< score in der Zeit)
//                      rot  (<=60% score in der Zeit)
// Zeit ~3 Monate?

var score = {
  AnswerCount : 0,
  TimeStart : 0,
  saveScore : function(){
    scorevalue = Math.floor((100 * (vocTrainer.MaxStage - 1) * vocTrainer.Data.length) / this.AnswerCount);
    localStorage.setItem(vocTrainer.File.split("/").reverse()[0]+"score",scorevalue);
    localStorage.setItem(vocTrainer.File.split("/").reverse()[0]+"timestart",this.TimeStart);
    localStorage.setItem(vocTrainer.File.split("/").reverse()[0]+"timeend",Math.floor(new Date().getTime()/1000));
  }
}
