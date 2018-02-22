var lockAlt = false;

$(document).keyup(function(e){
  if(e.keyCode == 18){ // alt/meta
    lockAlt = false;
  }
});

$(document).keydown(function(e){
    // document.title = e.keyCode;

    if(e.keyCode == 18){ // alt/meta // so that you can still switch tabs in firefox with alt + number
      lockAlt = true;
    }
    if(lockAlt)
      return;

    $("#typespot input").readOnly = true;

    if(!$("#typespot").is(":visible") && e.keyCode==84){
      $("#typespot").show();
    }
    else if(e.keyCode==13){
      // return
      e.preventDefault();
      if(vocTrainer.Answered > 0 && vocTrainer.Answered < vocTrainer.Labels.length - 1){
        $("#typespot input:not(.alert-success):not(.alert-warning):first").focus();
      }
      else{
        vocTrainer.ask();
      }
    }
    else if(e.keyCode==27){
      // esc
      vocTrainer.dontKnow();
    }
    else if(e.keyCode==49){
      e.preventDefault();
      vocTrainer.answerViaOption(0);
    }
    else if(e.keyCode==50){
      e.preventDefault();
      vocTrainer.answerViaOption(1);
    }
    else if(e.keyCode==51){
      e.preventDefault();
      vocTrainer.answerViaOption(2);
    }
    else if(e.keyCode==52){
      e.preventDefault();
      vocTrainer.answerViaOption(3);
    }
    else {
      $("#typespot input").readOnly = false;
      if($(document.activeElement).parent().attr("id") != "typespot"){
        if(e.keyCode == 9){
          e.preventDefault(); // so that a tab does not tab into the second box
        }
        $("#typespot input:not(.alert-success):first").focus();
      }
      if(vocTrainer.Answered){
        vocTrainer.BlockNextQuestion = true;
      }
    }
});

$("#typespot").click(function(){
  $("#typespot input").readOnly = false;
});

$(document).focusin(function(){
  if($(document.activeElement).parent().attr("id") == "typespot"){
    answernr = $(document.activeElement).attr("id").replace("typespot","");
    vocTrainer.AnswerLabel = answernr;
    vocTrainer.Answer = vocTrainer.Data[vocTrainer.QuestionIndex][answernr]
  }
});

$(document.activeElement).keyup(function(e){
  if($(document.activeElement).parent().attr("id") == "typespot"){
    $(document.activeElement).removeClass("alert-success");
    if(vocTrainer.checkTypespot($(document.activeElement).val())){
      $(document.activeElement).addClass("alert-success");
    }
  }
});
