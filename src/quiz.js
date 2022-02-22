import getParameter from "./user.js";

import quizQuestions from "./quiz-questions.js";

$(document).ready(function () {

const user = getParameter("user");

const resultsURL = decodeURI(getParameter("quizResultsURL"));

  let SummaryButtons = $("#summary-buttons");

  let ReviewingQuiz = false;

  let QuizActive = false;

  let QuestionTimer = 5;

  let QuestionTimerElement;

  var DisplayingIncorrectAnswer = false;

  const QuizQuestions = quizQuestions.AIFluencyQuiz;

  let CurrentQuestion = 0;

  let TotalQuestions = quizQuestions.AIFluencyQuiz.length;

  let CorrectAnswers = 0;

  let IncorrectAnswers = 0;

  CurrentQuestion = 1;

  let CanChangeAnswer = true;

  let StartedSelectionTimer = false;

  let QuizAnwsers = [];
  let QuizAnwsersElement = [];

  let UserAnswers = [];
  let UserAnswersElement = [];

  let PointsResults = 0;

  // TIMER

  var circle = document.querySelector(".progress-ring__circle");
  var radius = circle.r.baseVal.value;
  var circumference = radius * 2 * Math.PI;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = `${circumference}`;




  var QuestionSeconds = $(".seconds");

  var QuestionCounter = QuestionTimer;
  QuestionSeconds.text(QuestionCounter);


  function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  function StartQuestionTimer() {

    setProgress(0);
    QuestionTimerElement = setInterval(function () {
      circle.style.transition = QuestionTimer + "s linear stroke-dashoffset";
      QuestionSeconds.textContent = "" + QuestionCounter;

      console.log(QuestionCounter);

      if (QuestionCounter > 0) {
        QuestionSeconds.text(QuestionCounter);
        QuestionCounter -= 1;

      } else {
        // If counter gets to 0, incorrect answer and move to next question
        QuestionSeconds.text(QuestionCounter);
        QuestionCounter = 0;
        StopQuestionTimer();
        if (!DisplayingIncorrectAnswer) AnimateTimeOutAnswer();
        //IncorrectAnswer();
        //MoveToNextQuestion();
      }

      circle.style.opacity = "1";
      setProgress(100);
    }, 1000);
  }


  function StopQuestionTimer(){
    clearInterval(QuestionTimerElement);
  }

  /* ---------- Quiz Logic ---------- */

  // INITIALIZE QUIZ

  function initializeQuiz(){

      $("#question-timer").removeClass("invisible");
      $(".box.large").removeClass("invisible");
      $(".answers").removeClass("invisible");

    QuizAnwsers = [];
    QuizAnwsersElement = [];

    UserAnswers = [];
    QuizAnwsersElement = [];

    DisplayingIncorrectAnswer = false;

    CurrentQuestion = 0;

    TotalQuestions = quizQuestions.AIFluencyQuiz.length;

    CorrectAnswers = 0;

    IncorrectAnswers = 0;

    CurrentQuestion = 1;

    CanChangeAnswer = true;

    StartedSelectionTimer = false;

    UpdateQuiz();
    AwaitAnswers(CurrentQuestion);
    StartQuestionTimer();

    QuizActive = true;

    MakeUnclickable(SummaryButtons);

    ReviewingQuiz = false;
    MakeInactive($('#review-answers'));
    MakeInactive($('#review-label'));

  }


  function endQuiz(){
    QuizActive = false;
    MakeClickable(SummaryButtons);
  }

  initializeQuiz();


  // Add New Questions to the view and determine the correct answer for the round

  function LoadNewQuestion(questionNumber) {
    const TempQuestion = QuizQuestions[questionNumber - 1];

    const TempAnswer = QuizQuestions[questionNumber - 1].answer;

    $("#question p").text(TempQuestion.question);

    $("#answer1").text(TempQuestion.options[0]);
    $("#answer2").text(TempQuestion.options[1]);
    $("#answer3").text(TempQuestion.options[2]);
    $("#answer4").text(TempQuestion.options[3]);

    // Get Current Correct Answer

    if ($("#answer1").text() == TempAnswer) {
      QuizAnwsersElement[CurrentQuestion-1] = $("#answer1");
    }
    if ($("#answer2").text() == TempAnswer) {
      QuizAnwsersElement[CurrentQuestion-1] = $("#answer2");
    }
    if ($("#answer3").text() == TempAnswer) {
      QuizAnwsersElement[CurrentQuestion-1] = $("#answer3");
    }
    if ($("#answer4").text() == TempAnswer) {
      QuizAnwsersElement[CurrentQuestion-1] = $("#answer4");
    }

    QuizAnwsers[CurrentQuestion-1] = QuizAnwsersElement[CurrentQuestion-1].text();

  }

  // Select answer: this will select a new answer or change the previously selected answer

  function SelectedAnswer(element) {
    $("#question-timer").addClass("invisible");

    $("#answer1").removeClass("clicked");
    $("#answer2").removeClass("clicked");
    $("#answer3").removeClass("clicked");
    $("#answer4").removeClass("clicked");

    element.addClass("clicked");
    UserAnswersElement[CurrentQuestion-1] = element;
    UserAnswers[CurrentQuestion-1] = UserAnswersElement[CurrentQuestion-1].text();
  }





  // Reset the StartSelectionTimer to false and CanChangeAnswer to true; to work in the new round.

  function EnableNewQuestion() {
    CanChangeAnswer = true;
    StartedSelectionTimer = false;
    StartQuestionTimer();
  }

  function StartToleranceTimer() {
    StartedSelectionTimer = true;
    setTimeout(function () {
      CanChangeAnswer = false;
      let result = CheckCorrectAnswer();
      AnimateAnswerResult(UserAnswersElement[CurrentQuestion-1], result, 2000);
      FadeQuizAnimation();
    }, 2000);
  }


  // Await answer selection function. This will check for the clicks, start the timer in the first click, and enable to switch the answer if within the timer limit.

  function AwaitAnswers(questionNumber) {
    let answer1 = $("#answer1");
    let answer2 = $("#answer2");
    let answer3 = $("#answer3");
    let answer4 = $("#answer4");

    TriggerAnswer(answer1);
    TriggerAnswer(answer2);
    TriggerAnswer(answer3);
    TriggerAnswer(answer4);
  }

  function TriggerAnswer(element){
    element.unbind("click").click(function () {
      if (!DisplayingIncorrectAnswer) {
        if (!StartedSelectionTimer) {
          StopQuestionTimer();
          StartToleranceTimer();
        }
        if (CanChangeAnswer) {
          SelectedAnswer(element);
        }
      }
    });
  }

  function CorrectAnswer() {
    if(QuizActive)
    CorrectAnswers++;
  }

  function IncorrectAnswer() {
    if(QuizActive)
    IncorrectAnswers++;
  }


  // Update Quiz View Information and trigger the await for answers function.

  function UpdateQuiz() {
      $("#correct-answers").text(CorrectAnswers);
      $("#incorrect-answers").text(IncorrectAnswers);
      $("#question-number").text(CurrentQuestion + "/" + TotalQuestions);

      DisplayingIncorrectAnswer = false;

      LoadNewQuestion(CurrentQuestion);

      QuestionCounter = QuestionTimer;
      circle.style.transition = "0s linear stroke-dashoffset";
      setProgress(0);

      AwaitAnswers(CurrentQuestion);
  }


    // Check if the selected answer is the same as the correct answer for the round and return the result as 'correct' or 'incorrect'

    function CheckCorrectAnswer() {
      let result;
  
      if (QuizAnwsers[CurrentQuestion-1] == UserAnswers[CurrentQuestion-1]) {
        result = "correct";
      } else {
        result = "incorrect";
      }
  
      return result;
    }

  // Animate correct, incorrect answers, fade the timer and update the questions and answers

  function AnimateAnswerResult(selectedAnswer, result, delay) {
    // Check if answer was correct or incorrect
    if (result == "correct") {
      selectedAnswer.removeClass("clicked");
      selectedAnswer.addClass("correct");
      CorrectAnswer();
    } else {
      if(UserAnswers[CurrentQuestion-1]!=""){
        selectedAnswer.removeClass("clicked");
        selectedAnswer.addClass("incorrect");
        QuizAnwsersElement[CurrentQuestion-1].addClass("correctfix");
        IncorrectAnswer();
      }else{
        QuizAnwsersElement[CurrentQuestion-1].addClass("correctfix");
        IncorrectAnswer();
      }
    }

  }

  // Quick Fade Transition to Update Quiz

  function ClearAnswerResults(element){
      element.removeClass("correct");
      element.removeClass("incorrect");
      element.removeClass("clicked");
      element.removeClass("correctfix");

      var QuestionSeconds = $(".seconds");
      
      QuestionSeconds.text(QuestionTimer);

  }

  function ClearAllAnswers(){
    ClearAnswerResults($('#answer1'));
    ClearAnswerResults($('#answer2'));
    ClearAnswerResults($('#answer3'));
    ClearAnswerResults($('#answer4'));
  }


  function FadeInQuiz(delay){
    setTimeout(ShowQuiz(),delay);
  }

  function FadeOutQuiz(delay){
    HideQuiz();
    setTimeout(ClearAllAnswers(),delay);
  }

  function HideQuiz(){
    $(".box.large").addClass("invisible");
    $(".answers").addClass("invisible");
    $("#question-timer").addClass("invisible");
  }

  function ShowQuiz(){
    $(".box.large").removeClass("invisible");
    $(".answers").removeClass("invisible");
    $("#question-timer").removeClass("invisible");
  }

  function FadeQuizAnimation(){
    setTimeout(function () {
      $(".box.large").addClass("invisible");
      $(".answers").addClass("invisible");

      ClearAllAnswers();

    }, 2000);
    setTimeout(function () {
      CurrentQuestion++;
      if (CurrentQuestion <= TotalQuestions) {
        UpdateQuiz();
        QuestionSeconds.textContent = "" + QuestionCounter;
        $(".box.large").removeClass("invisible");
        $(".answers").removeClass("invisible");
        $("#question-timer").removeClass("invisible");

        EnableNewQuestion();
      }else{
          endQuiz();
          UpdateQuizResults();
      }
    }, 2500);
  }

  function AnimateTimeOutAnswer() {
    DisplayingIncorrectAnswer = true;
    UserAnswers[CurrentQuestion-1]="";
    IncorrectAnswer();
    $(".progress-ring").addClass("timeout");
    setTimeout(function () {
      QuizAnwsersElement[CurrentQuestion-1].addClass("correctfix");
    }, 1000);

    setTimeout(function () {
      $(".box.large").addClass("invisible");
      $(".answers").addClass("invisible");
      $("#question-timer").addClass("invisible");
      QuizAnwsersElement[CurrentQuestion-1].removeClass("correctfix");
    }, 3000);
    setTimeout(function () {
      $(".progress-ring").removeClass("timeout");
      CurrentQuestion++;
      if (CurrentQuestion <= TotalQuestions) {
        UpdateQuiz();
        QuestionSeconds.textContent = "" + QuestionCounter;
        $(".box.large").removeClass("invisible");
        $(".answers").removeClass("invisible");
        $("#question-timer").removeClass("invisible");
        EnableNewQuestion();
      }else{
        endQuiz();
        UpdateQuizResults();
      }
    }, 3500);
  }

  /* Enlarge Question Area */

  let EnlargedQuestion = false;

  $("#question-area")
    .unbind("click")
    .click(function () {
      if(!StartedSelectionTimer){
        if (!EnlargedQuestion) {
          $("#question-area").addClass("question-large");
          $("#question").addClass("full-height");
          $(".answers").addClass("invisible");
          $(".option").addClass("unclickable");
          EnlargedQuestion = true;
        } else {
          $("#question-area").removeClass("question-large");
          $("#question").removeClass("full-height");
          $(".answers").removeClass("invisible");
          $(".option").removeClass("unclickable");
          EnlargedQuestion = false;
        }
      }
    });




   // Results Page

   function UpdateQuizResults(){

    let CorrectResults = CorrectAnswers;
    let IncorrectResults = IncorrectAnswers;
    let PercentageResults = Math.round((CorrectAnswers/TotalQuestions)*100);
    PointsResults = CorrectAnswers*100;

    $('#results-correct').text(CorrectResults);
    $('#results-incorrect').text(IncorrectResults);
    $('#results-percentage').text(PercentageResults);
    $('#results-points').text(PointsResults);

   }



   // Replay Quiz

   function ReplayQuiz(){
    if(!QuizActive){
      FadeOutQuiz(2000);
      FadeInQuiz(4000);
      setTimeout(initializeQuiz(),4000);
    }
   }




   $('#replay-quiz').unbind('click').click(function(){
     PressButtonAnimation($(this));
     ReplayQuiz();


     $(".review-controls").addClass('invisible');
     MakeUnclickable(".review-next");
     MakeUnclickable(".review-previous");

   });



   // Animation Auxiliaries

   function MakeUnclickable(element){
      element.addClass("unclickable faded");
   }

   function MakeClickable(element){
    element.removeClass("unclickable faded");
  }

  function MakeActive(element){
    element.addClass("active");
  }

  function MakeInactive(element){
    element.removeClass("active");
  }

   function PressButtonAnimation(element){

      element.addClass('add-transition');
      element.addClass('push-button');
      setTimeout(function(){
        element.removeClass('push-button');
      },150);
      setTimeout(function(){
        element.removeClass('add-transition');
      },300);

   }


   // Review Answers Logic

    $('#review-answers').unbind('click').click(function(){

      if(!QuizActive && !ReviewingQuiz){

        ReviewingQuiz = true;

        $(".review-controls").removeClass('invisible');

        MakeUnclickable($('.review-previous'));
        MakeClickable($('.review-next'));

        PressButtonAnimation($(this));

        MakeActive($('#review-answers'));
        MakeActive($('#review-label'));

        CurrentQuestion = 1;

        $("#correct-answers").text(CorrectAnswers);
        $("#incorrect-answers").text(IncorrectAnswers);

        $(".box.large").removeClass("invisible");
        $(".answers").removeClass("invisible");

        ReviewQuiz(CurrentQuestion);

        let result = CheckCorrectAnswer();

        AnimateAnswerResult(UserAnswersElement[CurrentQuestion-1],result,0);

      }

    });


    $('.review-next').unbind('click').click(function(){
      if(CurrentQuestion<TotalQuestions)
      ReviewQuestion(1);
    });

    $('.review-previous').unbind('click').click(function(){
      if(CurrentQuestion>1)
      ReviewQuestion(-1);
    });


    function ReviewQuestion(number){
      CurrentQuestion += number;
      ReviewQuiz(CurrentQuestion);
      let result = CheckCorrectAnswer();
      AnimateAnswerResult(UserAnswersElement[CurrentQuestion-1],result,0);

      // Check to update if Previous or next question are clickable

      if(CurrentQuestion==1){
        MakeUnclickable($(".review-previous"));
      }else{
        MakeClickable($(".review-previous"));
      }

      if(CurrentQuestion==TotalQuestions){
        MakeUnclickable($(".review-next"));
      }else{
        MakeClickable($(".review-next"));
      }

    };



    function ReviewQuiz(questionNumber){

      ReviewingQuiz = true;

      const TempQuestion = QuizQuestions[questionNumber - 1];

      $("#question-number").text(CurrentQuestion + "/" + TotalQuestions);
  
      $("#question p").text(TempQuestion.question);
  
      $("#answer1").text(TempQuestion.options[0]);
      $("#answer2").text(TempQuestion.options[1]);
      $("#answer3").text(TempQuestion.options[2]);
      $("#answer4").text(TempQuestion.options[3]);

      ClearAllAnswers();
      
    }




    // End Quiz Button: Send to Clickfunnels

    function buildResultsURL(){
      let tempURL = encodeURI(resultsURL)+"?user="+user+"&?points="+PointsResults;
      return tempURL;
    }

    $('#clickfunnels-redirect').unbind('click').click(function(){
      alert(buildResultsURL());
      window.location.replace(buildResultsURL());
    });


});
