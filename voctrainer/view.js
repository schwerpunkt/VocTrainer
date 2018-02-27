var view = {
  switchUI : function(ui){
    $(".vocUIelement").hide();
    $("#"+ui).show();
  },
  selectTrainer : function(){
    this.switchUI("trainerselector");
    this.loadScores();

    file = window.location.search.replace("?", "");
    if(file == "about"){
      this.switchUI("about");
      return;
    }
    if(file == ""){
      return;
    }

    // select if starts with voctrainer
    vocTrainer.start(file);
  },
  loadScore : function(file){
    return localStorage.getItem(file+"score");
  },
  loadElapsedtimeout : function(file){
    timestart = localStorage.getItem(file+"timestart");
    timeend = localStorage.getItem(file+"timeend");

    elapsedtime = timeend - timestart;

    elapsedtimeh = Math.floor(elapsedtime/60/60);
    elapsedtime = elapsedtime - elapsedtimeh * 60*60;
    elapsedtimem = Math.floor(elapsedtime/60);
    elapsedtime = elapsedtime - elapsedtimem * 60;

    elapsedtimeout = "";
    if(elapsedtimeh > 0)
      elapsedtimeout += elapsedtimeh+"h";
    if(elapsedtimem > 0)
      elapsedtimeout += elapsedtimem+"m";
    if(elapsedtime > 0)
      elapsedtimeout += elapsedtime+"s";

    return elapsedtimeout;
  },
  loadLasttrainout : function(file){
    timestart = localStorage.getItem(file+"timestart");
    timeend = localStorage.getItem(file+"timeend");
    currenttime = Math.floor(new Date().getTime()/1000);

    lasttrain = currenttime - timeend;

    switch (true) {
      case lasttrain > 60 * 60 * 24 * 7 * 12:
        lasttrainout = "on "+new Date(timeend*1000).getDate()+"."+new Date(timeend*1000).getMonth()+"."+new Date(timeend*1000).getFullYear();
        break;
      case lasttrain > 60 * 60 * 24 * 7 * 4:
        lasttrainout = "over a month ago...";
        break;
      case lasttrain > 60 * 60 * 24 * 7:
        lasttrainout = "over a week ago...";
        break;
      case lasttrain > 60 * 60 * 24 * 2:
        days = ["monday","tuseday","wednesday","thursday","friday","saturday","sunday"];
        lasttrainout = days[new Date(timeend*1000).getDay()];
        break;
      case lasttrain > 60 * 60 * 24:
        lasttrainout = "yesterday";
        break;
      case lasttrain > 60 * 60 * 2:
        lasttrainout = Math.round(lasttrain / 60 / 60)+" hours ago";
        break;
      case lasttrain > 60 * 60:
        lasttrainout = "one hour ago";
        break;
      case lasttrain > 60 * 2:
        lasttrainout = Math.round(lasttrain / 60)+" minutes ago";
        break;
      case lasttrain > 60:
        lasttrainout = "one minute ago";
        break;
      case lasttrain > 5:
        lasttrainout = lasttrain+" seconds ago";
        break;
      default:
        lasttrainout = "a few seconds ago...";
    }

    return lasttrainout;
  },
  gradeScore : function(score){
    grade = "";
    if(score == 100){
      grade = "success";
    }
    else if(score > 75){
      grade = "warning";
    }
    else if(score != null){
      grade = "danger";
    }
    return grade;
  },
  loadScoreReport : function(file){
    id = file.split("/").reverse()[0];
    scorevalue = this.loadScore(id);
    elapsedtimeout = this.loadElapsedtimeout(id);
    $("#finishedscore").html("score: "+scorevalue+"%<br>elapsed time: "+elapsedtimeout);

    grade = this.gradeScore(scorevalue);
    if(grade != null){
      $("#finishedscore").addClass("alert-"+grade);
    }
  },
  loadScores : function(){
    $("#trainerselector div a").each(function(){
      $(this).addClass("list-group-item");
      id = $(this).html();
      scorevalue = view.loadScore(id);
      elapsedtimeout = view.loadElapsedtimeout(id);
      lasttrainout = view.loadLasttrainout(id);

      if(scorevalue != null){
        $(this).append(" (score: "+scorevalue+"%; elapsed time: "+elapsedtimeout+"; last training: "+(lasttrainout)+")");
        if(lasttrain > 60*60*24*7*4 && scorevalue == 100){ // one month
          scorevalue = null;
          $(this).addClass("alert-info");
        }
      }
      else{
        $(this).append(" (never trained)");
      }

      grade = view.gradeScore(scorevalue);
      if(grade != null){
        $(this).addClass("alert-"+grade);
      }
    });
  }
}
view.selectTrainer();

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})