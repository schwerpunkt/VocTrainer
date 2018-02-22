// VocTrainer
// philippharb.at 2015

// there are 4 stages to complete
// a failed question is put in the first stage again

var vocTrainer = {
  Question : "question", // current Question
  Answer : "answer", // current Answer string (changes on text box focus)
  QuestionIndex : 0, // index in Data array
  QuestionLabel : 0, // label of asked question
  AnswerLabel : 0, // label of answer (changes on text box focus)
  AnswerOption : 0, // option of the select - VocData only
  Labels : new Array(), // e.g. HR EN
  LabelTypes : new Array(), // e.g. hr en (e.g. for spec. regex)
  Data : "array", // contains data like brod ship\n auto car...
  Stages : new Array(),   // 2D array that contains the data-question indices in each stage
  AmountOfQuestionsLeft : 0,
  File : "file",
  MaxStage : 4,
  MaxSuggestions : 4,
  QestionStage : 0, // stage of current question
  QuestionStageIndex : 0, // index of current question within current stage
  BlockNextQuestion : false,
  Answered : 0,
  AnsweredArray : "array",
  ChartBG : 0,
  ChartPieces : "array",
  start : function(file){
    view.switchUI("voctrainer");
    this.loadData(file);
  },
  fail : function(msg){
    alert(msg);
    view.switchUI("trainerselector");
  },
  loadData : function(trainer){
    this.File = trainer;
    $("#errorreportfile").html(trainer);
    // read csv file
    $.ajax({
      url : "data/"+trainer+".txt",
      dataType : "text",
      success : function(csvdata){
        $("#navtrainertitle").html('<a href="data/'+vocTrainer.File+'.txt" target="_blank">'+vocTrainer.File.split("/").reverse()[0]+'</a>');
        vocTrainer.Data = $.csv.toArrays(csvdata);

        score.TimeStart = Math.floor(new Date().getTime()/1000);

        vocTrainer.parseData();
      },
      error : function(){
        vocTrainer.fail("trainer file not found");
      }
    });
    // initialize stages
    for(i = 0;i < this.MaxStage;i++){
      this.Stages[i] = new Array();
    }
  },
  parseData : function(){
    // get title and desc from csv data
    data = this.Data;
    overridefromdataid = null;
    for(i = 0;i < data[0].length;i++){
      label = data[0][i];

      console.log();
      if(label.substr(0,1) == "-"){
        label = label.substr(1,label.length);
        overridefromdataid = i+1;
      }

      this.Labels[i] = label;
      this.LabelTypes[i] = data[1][i];

      $("#questioncolumnswitcher").append('<label class="btn btn-sm btn-default"><input type="radio" name="questioncolumn" value="c'+i+'">'+label+'</label>');
    }
    if(overridefromdataid != null){// override questoincolumn active by txt data "-" in front of label in the first row
      $("#questioncolumnswitcher").find("label").eq(0).removeClass("active").find("input").prop("checked",false);
      $("#questioncolumnswitcher").find("label").eq(overridefromdataid).addClass("active").find("input").prop("checked",true);
    }
    else if(this.Labels.length > 2){
      $("#questioncolumnswitcher").find("label").eq(0).removeClass("active").find("input").prop("checked",false);
      $("#questioncolumnswitcher").find("label").eq(1).addClass("active").find("input").prop("checked",true);
    }



    // strip first two rows from data (labels, labeltypes)
    data.splice(0,2);

    // load Stage1
    stage = new Array();
    for(i = 0;i < data.length;i++){
      stage[i] = i;
    }
    this.Stages[0] = stage;

    this.Data = data;

    this.initStats();
    this.ask();
  },
  initStats : function(){
    height = 15;
    $("#statschart").css({width:"auto",height:height});
    chartbg = Raphael("statschart");
    chartpieces = new Array();
    fillcolors = ["f00","f60","ff0","6f0","0f0"];
    for(i = 0;i < fillcolors.length-this.MaxStage;i++){
      fillcolors.splice(Math.floor(fillcolors.length/2-1),1);
    }
    for(i = 0;i < this.MaxStage;i++){
      chartpieces[i] = chartbg.rect(0,0,0,height).attr({fill:"#"+fillcolors[i],stroke:"none",opacity:0.7});
    }
    this.ChartBG = chartbg;
    this.ChartPieces = chartpieces;
    this.updateStats();
  },
  updateStats : function(){
    stages = this.Stages;
    $("#stats").html("Stats:");
    marginleft = 0;
    outerwidth = $("#statschart").outerWidth();
    totalleft = 0;
    for(i = 0;i < this.MaxStage;i++){
      $("#stats").append(" "+stages[i].length);
      width = (outerwidth-3*this.MaxStage)/this.Data.length*stages[i].length+3;
      this.ChartPieces[i].attr({width:width,x:marginleft});
      marginleft = marginleft + width;
      totalleft += stages[i].length * (this.MaxStage - i - 1);
    }
    scorevalue = Math.floor((100 * (this.MaxStage - 1) * this.Data.length) / (score.AnswerCount + totalleft));
    $("#stats").append(" ("+totalleft+" left; score: "+scorevalue+"%)")

    this.AmountOfQuestionsLeft = this.Data.length - stages[this.MaxStage - 1].length;
  },
  finishedCheck : function(){
    if(this.AmountOfQuestionsLeft == 0){
      score.saveScore();

      view.loadScoreReport(this.File);

      view.switchUI("finished");
      return true;
    }
    return false;
  },
  ask : function(){
    if(this.finishedCheck()){
      return;
    }

    if(this.BlockNextQuestion){
      this.BlockNextQuestion = false;
      return;
    }

    this.Answered = this.Labels.length - 1;
    answeredArray = new Array();
    for(i = 0;i < this.Labels.length;i++){
      answeredArray.push(false);
    }
    this.AnsweredArray = answeredArray;

    data = this.Data;

    // get random questionindex of the first MaxStage - 1 stages
    // ein gehacke ist das...
    // get nr of questions not in MaxStage => the number of not yet memorized questions
    notmemorizedamount = this.AmountOfQuestionsLeft;
    // get random index of the notmemorized
    questionstageindex = Math.floor(Math.random() * notmemorizedamount);
    // calculate questionstage and questionstageindex from notmemorizedindex
    for(i = 0;i < this.MaxStage;i++){
      if(questionstageindex >= this.Stages[i].length){
        questionstageindex = questionstageindex - this.Stages[i].length;
        continue;
      }
      questionstage = i;
      break;
    }

    this.QuestionStage = questionstage;
    this.QuestionStageIndex = questionstageindex;

    questionindex = this.Stages[questionstage][questionstageindex];  // which 'word'
    this.QuestionIndex = questionindex;

    // update error report question nr
    $("#errorreport").html(questionindex+3);

    questioncolumn = $('input[name="questioncolumn"]:checked').val();
    // random if both, else what selected (which 'language')
    questionlabel = Math.floor(Math.random()*this.Labels.length);
    for(i = 0;i < this.Labels.length;i++){
      if(questioncolumn == "c"+i){
        questionlabel = i;
      }
    }
    this.QuestionLabel = questionlabel;

    $("#typespot").html("");
    answerlabel = false;
    for(i = 0;i < this.Labels.length;i++){
      if(i != questionlabel){
        $("#typespot").append('<input type="text" class="form-control list-group-item" id="typespot'+i+'" placeholder="'+this.Labels[i]+'">');
        if(answerlabel == false){
          answerlabel = i;
        }
      }
    }
    this.AnswerLabel = answerlabel;
    this.Question = data[questionindex][questionlabel];
    this.Answer = data[questionindex][answerlabel];

    if(this.Labels.length <= 2){
      // generate optionlist (the clickable select options)
      optionspool = data.slice();   // slice to copy the array
      optionspool.splice(questionindex,1);
      shuffle(optionspool);
      options = new Array();
      // add real answer to options
      options.push(this.Data[questionindex][answerlabel]);
      for(i = 0;i < Math.min(this.MaxSuggestions-1,optionspool.length);i++){
        options.push(optionspool[i][answerlabel]);
      }
      shuffle(options);

      $("#answeroptions").html("");
      $.each(options, function(option){
        if(options[option] == vocTrainer.Answer){
          vocTrainer.AnswerOption = option;
        }
        $("#answeroptions").append('<a href="javascript:vocTrainer.answerViaOption('+option+')" class="list-group-item">'+options[option]+' <small>[ '+(option+1)+' ]</small></a>');
      });
    }

    $("#askedline").html("<small>"+this.Labels[questionlabel]+"</small> "+this.Question);
  },
  answerViaOption : function(optionnr){
    if(this.Answered > 0 && !$("#answeroptions a").eq(optionnr).hasClass("alert-danger")){
      if(optionnr != this.AnswerOption){   // FALSE A
        $("#answeroptions a").eq(optionnr).addClass("alert-danger");
        $("#answeroptions a").eq(optionnr).css({"pointer-events":"none"});
        this.BlockNextQuestion = true;
        this.dontKnow();
      }
      else{   // CORRECT ANSWER
        $("#answeroptions a").eq(optionnr).addClass("alert-success");
        $("#answeroptions a").css({"pointer-events":"none"});
        this.Answered = 0;
        this.BlockNextQuestion = false;
        this.answerCorrect();
      }
      $("#typespot"+this.AnswerLabel).attr("placeholder",this.Labels[this.AnswerLabel]+" "+this.Answer);
    }
  },
  answer : function(answernr,answer){
    if(this.Answered > 0 && this.AnsweredArray[answernr] == false){
      if(answer != this.Answer){ // FALSE A
        this.BlockNextQuestion = true;
      }
      else{ // CORRECT ANSWER
        $("#typespot"+answernr).attr("placeholder",this.Labels[answernr]+" "+this.Answer);
        this.Answered = this.Answered - 1;
        this.AnsweredArray[answernr] = true;
        if(this.Answered == 0){
          this.BlockNextQuestion = false;
          this.answerCorrect();
        }
      }
    }
  },
  answerCorrect : function(){
    score.AnswerCount++;
    // cut question from current stage
    this.Stages[this.QuestionStage].splice(this.QuestionStageIndex,1);
    // add question to higher stage -> don't ask from highest stage
    this.QuestionStage = this.QuestionStage+1;
    this.QuestionStageIndex = this.Stages[this.QuestionStage].length;
    this.Stages[this.QuestionStage].push(this.QuestionIndex);
    this.updateStats();
  },
  answerInCorrect : function(){
    score.AnswerCount++;
    // cut question from current stage
    this.Stages[this.QuestionStage].splice(this.QuestionStageIndex,1);
    // add question to lowest stage
    this.QuestionStage = 0;
    this.QuestionStageIndex = this.Stages[this.QuestionStage].length;
    this.Stages[this.QuestionStage].push(this.QuestionIndex);
    this.updateStats();
  },
  knowThat : function(){ // if clicked before any other action => last stage else => next stage
    if(this.Answered == this.Labels.length - 1){
      score.AnswerCount = score.AnswerCount + this.MaxStage - 1 - this.QuestionStage;
      // cut question from current stage
      this.Stages[this.QuestionStage].splice(this.QuestionStageIndex,1);
      // add question to higher stage -> don't ask from highest stage
      this.QuestionStage = this.MaxStage-1;
      this.QuestionStageIndex = this.Stages[this.QuestionStage].length;
      this.Stages[this.QuestionStage].push(this.QuestionIndex);
      this.updateStats();
    }
    else{
      this.answerCorrect();
    }

    this.BlockNextQuestion = false;
    this.ask();
  },
  dontKnow : function(){
    answerlabel = this.AnswerLabel;
    for(i = 0;i < this.Labels.length;i++){
      answerlabel = (this.AnswerLabel+i) % this.Labels.length;
      if(answerlabel == this.QuestionLabel){
        continue;
      }
      if(this.AnsweredArray[answerlabel] == false){
        break;
      }
    }
    if(this.AnsweredArray[answerlabel] == false){
      if(this.Labels.length <= 2){
        $("#answeroptions a").eq(this.AnswerOption).addClass("alert-warning");

      }
      else{
        $("#typespot"+answerlabel).val("");
        $("#typespot"+answerlabel).addClass("alert-warning");
      }
      $("#typespot"+answerlabel).attr("placeholder",this.Labels[answerlabel]+" "+this.Answer);
      this.AnsweredArray[answerlabel] = true;
      this.Answered = this.Answered - 1;
      this.answerInCorrect();
      this.BlockNextQuestion = false;
      $("#typespot"+answerlabel).focus();
    }
  },
  checkTypespot : function(typespot){
    answernr = this.AnswerLabel;

    replacepattern = new Array();
    replacecontent = new Array();

    // exclude Labels for current answer
    replacepattern.push(/(\([^()]*)*(\s*\([^()]*\)\s*)+([^()]*\))*/g);  // nested brackets (asdcad(acd)sc)
    replacecontent.push(" ");
    replacepattern.push(/(\[[^\[\]]*)*(\s*\[[^\[\]]*\]\s*)+([^\[\]]*\])*/g);  // nested brackets [asdcad[acd]sc]
    replacecontent.push(" ");
    labelreplace = this.Labels[answernr];
    for(i = 0;i < replacepattern.length;i++){
      labelreplace = labelreplace.replace(replacepattern[i],replacecontent[i]);
    }
    labelreplace = labelreplace.replace(/(\/)/g,"|");
    labelreplace = labelreplace.replace(/\' /g,"\'");
    replacepattern.push(RegExp("((^|\/|\s)("+labelreplace+"))*","g")); // todo z.b. für il/elle/on soll auch "elle on" möglich sein
    replacecontent.push("");
    switch (this.LabelTypes[answernr]) {
      case "en":
        // English
        replacepattern.push(/(((^|\s|\/)((an|a)(\s|\/))+)+)/g); // ^a /a  a ^an /an  an ^an/a /an/a ...
        replacecontent.push(" ");
        replacepattern.push(/(e\.g\.)/g);
        replacecontent.push(" ");
        break;
      case "de":
        // Deutsch
        replacepattern.push(/(etwas)/g);
        replacecontent.push("etw");
        replacepattern.push(/(jemandem)/g);
        replacecontent.push("jdm");
        replacepattern.push(/(jemanden)/g);
        replacecontent.push("jdn");
        break;
      case "fr":
        // Français
        replacepattern.push(/(ç)/g);    // TODO check
        replacecontent.push("c");
        replacepattern.push(/(quelqu'un)/g);
        replacecontent.push("qn");
        break;
      default:
    }

    answer = this.Answer.toLowerCase()+" ";
    typespot = typespot.toLowerCase()+" ";

    for(i = 0;i < replacepattern.length;i++){
      answer = answer.replace(replacepattern[i],replacecontent[i]);
      typespot = typespot.replace(replacepattern[i],replacecontent[i]);
    }

    // console.log("ans: "+answer);
    // console.log("typ: "+typespot);

    splitpattern = /[\s\/,\.\?\!\']+/;

    answerlist = answer.split(splitpattern);
    typespotlist = typespot.split(splitpattern);

    if($(answerlist).not(typespotlist).length === 0 && $(typespotlist).not(answerlist).length === 0){ // check if arrays match in any order
      if(this.Labels.length <= 2){
        this.answerViaOption(this.AnswerOption);
      }
      else{
        this.answer(answernr,this.Answer);
      }
      return true;
    }

    return false;
  }
};

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
