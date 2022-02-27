import getParameter from "./user.js";

import quizQuestions from "./quiz-questions.js";


// Visual Styles and Animation Functions

const VisualStyles = {

  Clickable:
  function(element){element.removeClass("unclickable faded");},
  Unclickable: 
  function(element){element.addClass("unclickable faded");},

  Visible:
  function(element){element.removeClass("invisible");},
  Invisible:
  function(element){element.addClass("invisible");},

  Active:
  function(element){element.addClass("active");},
  Inactive:
  function(element){element.removeClass("active");},

  Uninteractable:
  function(element){element.addClass("unclickable");},

  FullHeight:
  function(element){element.addClass("full-height");},

  RegularHeight:
  function(element){element.removeClass("full-height");},  

  Answers: {
    Clicked:
    function(element){element.addClass("clicked");},
    Correct:
    function(element){element.addClass("correct");},
    Incorrect:
    function(element){element.addClass("incorrect");},
    CorrectFix:
    function(element){element.addClass("correctfix");},

    Unselect:
    function(element){element.removeClass("clicked");},
    Clear:
    function(element){element.removeClass("clicked correct incorrect correctfix");},


  }

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

function fadeInOutUpdate(element,text,delay){
  VisualStyles.Invisible(element);
  
  setTimeout(function(){
    element.text(text);
    VisualStyles.Visible(element);
  }
  ,delay);
}




// Quiz Logic


$(document).ready(function () {

const username = getParameter("username");
const resultsURL = getParameter("quizResultsURL");


  /*--------------------------------
  DOM ELEMENTS
  --------------------------------*/

  // Quiz Particle Header

  let el_QuizContainer = $('#quiz-view .main-content .quiz-container');

  // Quiz Review Controls

  let el_ReviewControls = $(".review-controls");

  let el_ReviewNextButton = $(".review-next");
  let el_ReviewPreviousButton = $(".review-previous");

  // Quiz Timer

  let el_QuestionTimer = $("#question-timer");
  let el_TimerCircle = document.querySelector(".progress-ring__circle");
  let el_TimerCircleFill = document.querySelector(".progress-ring");
  let el_QuestionSeconds = $(".seconds");

  // Quiz Question Box

  let el_CurrentCorrectAnswers = $("#correct-answers");
  let el_CurrentIncorrectAnswers = $("#incorrect-answers");
  let el_CurrentQuestionNumber = $("#question-number");

  let el_QuestionArea = $('.box');

  let el_QuestionParagraph = $('#question p');
  let el_QuestionParagraphWrapper = $('#question');

  let el_QuestionBottomOverlay = $(".scrolling-overlay");

  // Answers

  let el_AnswerGroup = $('.answers');

  let el_Answer1 = $('#answer1');
  let el_Answer2 = $('#answer2');  
  let el_Answer3 = $('#answer3');
  let el_Answer4 = $('#answer4');

  // Quiz Complete Message

  let el_QuizCompleteMessage = $('#quiz-complete-message');


  // Quiz Results Page

  let el_SummaryButtons = $("#summary-buttons");

  let el_ReviewAnswersButton = $('#review-answers');
  let el_ReviewAnswersButtonLabel = $('#review-label')

  let el_ResultsPointsText = $('#results-points');
  let el_ResultsPercentageText = $('#results-percentage');
  let el_ResultsCorrectText = $('#results-correct');
  let el_ResultsIncorrectText = $('#results-incorrect');

  let el_ReplayQuizButton = $('#replay-quiz');

  let el_ClickFunnelsRedirect = $('#clickfunnels-redirect');


  
  /*--------------------------------
  LOGIC VARIABLES
  --------------------------------*/

  const QuizQuestions = quizQuestions.AIFluencyQuiz;
  let TotalQuestions = quizQuestions.AIFluencyQuiz.length;

  let ReviewingQuiz = false;

  let QuizActive = false;

  let QuestionTimer = 60;

  let QuestionTimerElement;

  var DisplayingIncorrectAnswer = false;

  let CurrentQuestion = 0;

  let CorrectAnswers = 0;

  let IncorrectAnswers = 0;

  let CanChangeAnswer = true;

  let StartedSelectionTimer = false;

  let QuizAnwsers = [];
  let QuizAnwsersElement = [];

  let UserAnswers = [];
  let UserAnswersElement = [];

  let PointsResults = 0;

  let EnlargedQuestion = false;

  let initialQuestionHeight;

  let canClickQuestion = true;


  // Timer Logic


  let radius = el_TimerCircle.r.baseVal.value;
  let circumference = radius * 2 * Math.PI;

  el_TimerCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  el_TimerCircle.style.strokeDashoffset = `${circumference}`;

  let QuestionCounter = QuestionTimer;
  el_QuestionSeconds.text(QuestionCounter);


  function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    el_TimerCircle.style.strokeDashoffset = offset;
  }

  function StartQuestionTimer() {

    setProgress(0);
    QuestionTimerElement = setInterval(function () {
      el_TimerCircle.style.transition = QuestionTimer + "s linear stroke-dashoffset";
      el_QuestionSeconds.textContent = "" + QuestionCounter;

      console.log(QuestionCounter);

      if (QuestionCounter > 0) {
        el_QuestionSeconds.text(QuestionCounter);
        QuestionCounter -= 1;

      } else {
        // If counter gets to 0, incorrect answer and move to next question
        el_QuestionSeconds.text(QuestionCounter);
        QuestionCounter = 0;
        StopQuestionTimer();
        if (!DisplayingIncorrectAnswer) AnimateTimeOutAnswer();
      }

      el_TimerCircle.style.opacity = "1";
      setProgress(100);
    }, 1000);
  }


  function StopQuestionTimer(){
    clearInterval(QuestionTimerElement);
  }


  /* ---------- Quiz Logic ---------- */


  initializeQuiz();


  // INITIALIZE QUIZ: Reset the values and hide / show the elements

  function initializeQuiz(){

    // If the user enlarged the question box (while reviewing for example), then reset the size by shortening.
    if(EnlargedQuestion){
      shortenQuestion();
    }

    // Display the timer, question and answer boxes.

    VisualStyles.Visible(el_QuestionTimer);
    VisualStyles.Visible(el_QuestionArea);
    VisualStyles.Visible(el_AnswerGroup);

    // Hide the 'Review' elements from the quiz and set ReviewingQuiz to false

    ReviewingQuiz = false;

    VisualStyles.Unclickable(el_SummaryButtons);

    VisualStyles.Uninteractable(el_ClickFunnelsRedirect);

    VisualStyles.Inactive(el_ReviewAnswersButton);
    VisualStyles.Inactive(el_ReviewAnswersButtonLabel);

    VisualStyles.Invisible(el_ReviewControls);
    VisualStyles.Unclickable(el_ReviewNextButton);
    VisualStyles.Unclickable(el_ReviewPreviousButton);

    // Reset the quiz variables values

    QuizAnwsers = [];
    QuizAnwsersElement = [];

    UserAnswers = [];
    QuizAnwsersElement = [];

    TotalQuestions = quizQuestions.AIFluencyQuiz.length;
    CurrentQuestion = 1;

    CorrectAnswers = 0;
    IncorrectAnswers = 0;

    DisplayingIncorrectAnswer = false;
    CanChangeAnswer = true;

    StartedSelectionTimer = false;

    // Initialize Quiz

    UpdateQuiz();
    AwaitAnswers(CurrentQuestion);
    StartQuestionTimer();

    QuizActive = true;

  }


  function endQuiz(){
    QuizActive = false;

    // Hide the whole quiz area (including background), to display the full-height message
    VisualStyles.Invisible(el_QuizContainer);
    VisualStyles.Uninteractable(el_AnswerGroup);
    VisualStyles.Uninteractable(el_QuestionArea);

    setTimeout(function(){VisualStyles.Visible(el_QuizCompleteMessage)},1000);
    setTimeout(function(){VisualStyles.Clickable(el_SummaryButtons)},1000);
    setTimeout(function(){VisualStyles.Clickable(el_ClickFunnelsRedirect)},1000);
  }

  


  function LoadNewQuestion(questionNumber) {
    const TempQuestion = QuizQuestions[questionNumber - 1];

    const TempAnswer = QuizQuestions[questionNumber - 1].answer;

    el_QuestionParagraph.text(TempQuestion.question);

    el_Answer1.text(TempQuestion.options[0]);
    el_Answer2.text(TempQuestion.options[1]);
    el_Answer3.text(TempQuestion.options[2]);
    el_Answer4.text(TempQuestion.options[3]);

    // Get Current Correct Answer

    if (el_Answer1.text() == TempAnswer) {
      QuizAnwsersElement[CurrentQuestion-1] = el_Answer1;
    }
    if (el_Answer2.text() == TempAnswer) {
      QuizAnwsersElement[CurrentQuestion-1] = el_Answer2;
    }
    if (el_Answer3.text() == TempAnswer) {
      QuizAnwsersElement[CurrentQuestion-1] = el_Answer3;
    }
    if (el_Answer4.text() == TempAnswer) {
      QuizAnwsersElement[CurrentQuestion-1] = el_Answer4;
    }

    QuizAnwsers[CurrentQuestion-1] = QuizAnwsersElement[CurrentQuestion-1].text();

  }

  // Select answer: this will select a new answer or change the previously selected answer

  function SelectedAnswer(element) {

    // Hide the timer
    VisualStyles.Invisible(el_QuestionTimer);

    // Unselect all the answers in case the user is re-selecting an answer
    VisualStyles.Answers.Unselect(el_Answer1);
    VisualStyles.Answers.Unselect(el_Answer2);
    VisualStyles.Answers.Unselect(el_Answer3);
    VisualStyles.Answers.Unselect(el_Answer4);

    // Style the currently selected answer
    VisualStyles.Answers.Clicked(element);

    UserAnswersElement[CurrentQuestion-1] = element;
    UserAnswers[CurrentQuestion-1] = UserAnswersElement[CurrentQuestion-1].text();
  }





  // Reset the StartSelectionTimer to false and CanChangeAnswer to true; so that it can work in the new round.

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
    TriggerAnswer(el_Answer1);
    TriggerAnswer(el_Answer2);
    TriggerAnswer(el_Answer3);
    TriggerAnswer(el_Answer4);
  }

  function TriggerAnswer(element){
    element.unbind("click").click(function () {
      if (!DisplayingIncorrectAnswer) {
        if (!StartedSelectionTimer) {
          StopQuestionTimer();
          // Start the second timer to give some leeway to the user to change the answer
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

      ClearAllAnswers();

      el_CurrentCorrectAnswers.text(CorrectAnswers);
      el_CurrentIncorrectAnswers.text(IncorrectAnswers);
      el_CurrentQuestionNumber.text(CurrentQuestion + "/" + TotalQuestions);

      DisplayingIncorrectAnswer = false;

      LoadNewQuestion(CurrentQuestion);

      QuestionCounter = QuestionTimer;
      el_TimerCircle.style.transition = "0s linear stroke-dashoffset";
      setProgress(0);

      AwaitAnswers(CurrentQuestion);

      VisualStyles.Clickable(el_QuestionArea);
      VisualStyles.Clickable(el_AnswerGroup);

      // Reset the timer to update the remaining time to the original settings
      el_QuestionSeconds.text(QuestionTimer);

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

    // Before animating the answer, we make the question short if it was previously large.
    if(EnlargedQuestion){
    shortenQuestion();    
    }
    // We also make the answers and question unclickable
    //VisualStyles.Uninteractable(el_QuestionArea);
    //VisualStyles.Uninteractable(el_AnswerGroup);


    // Check if answer was correct or incorrect
    if (result == "correct") {
      VisualStyles.Answers.Unselect(selectedAnswer);
      VisualStyles.Answers.Correct(selectedAnswer);
      CorrectAnswer();
    } else {
      if(UserAnswers[CurrentQuestion-1]!=""){
        VisualStyles.Answers.Unselect(selectedAnswer);
        VisualStyles.Answers.Incorrect(selectedAnswer);

        VisualStyles.Answers.CorrectFix(QuizAnwsersElement[CurrentQuestion-1]);
        IncorrectAnswer();
      }else{
        VisualStyles.Answers.CorrectFix(QuizAnwsersElement[CurrentQuestion-1]);
        IncorrectAnswer();
      }
    }

  }

  // Quick Fade Transition to Update Quiz
  
  function ClearAllAnswers(){
    VisualStyles.Answers.Clear(el_Answer1);
    VisualStyles.Answers.Clear(el_Answer2);
    VisualStyles.Answers.Clear(el_Answer3);
    VisualStyles.Answers.Clear(el_Answer4);
    el_QuestionSeconds.text(QuestionTimer);
  }


  function FadeInQuiz(delay){
    ClearAllAnswers();
    setTimeout(ShowQuiz(),delay);
  }

  function FadeOutQuiz(delay){
    HideQuiz();
    setTimeout(ClearAllAnswers(),delay);
  }

  function HideQuiz(){
    VisualStyles.Invisible(el_QuestionArea);
    VisualStyles.Invisible(el_AnswerGroup);
    VisualStyles.Invisible(el_QuestionTimer);
  }

  function ShowQuiz(){
    VisualStyles.Visible(el_QuestionArea);
    VisualStyles.Visible(el_AnswerGroup);
    VisualStyles.Visible(el_QuestionTimer);
  }

  function FadeQuizAnimation(){
    setTimeout(function () {

      VisualStyles.Invisible(el_QuestionArea);
      VisualStyles.Invisible(el_AnswerGroup);

      ClearAllAnswers();

    }, 2000);
    setTimeout(function () {
      CurrentQuestion++;
      if (CurrentQuestion <= TotalQuestions) {
        UpdateQuiz();
        el_QuestionSeconds.textContent = "" + QuestionCounter;

        VisualStyles.Visible(el_QuestionArea);
        VisualStyles.Visible(el_AnswerGroup);
        VisualStyles.Visible(el_QuestionTimer);

        EnableNewQuestion();
      }else{
          endQuiz();
          UpdateQuizResults();
      }
    }, 2500);
  }

  function AnimateTimeOutAnswer() {

        // Before animating the answer, we make the question short if it was previously large.
        if(EnlargedQuestion)
        shortenQuestion();    

    // We also make the answers and question unclickable
    VisualStyles.Uninteractable(el_QuestionArea);
    VisualStyles.Uninteractable(el_AnswerGroup);

    DisplayingIncorrectAnswer = true;
    UserAnswers[CurrentQuestion-1]="";
    IncorrectAnswer();
    el_TimerCircleFill.classList.add("timeout");
    setTimeout(function () {
      VisualStyles.Answers.CorrectFix(QuizAnwsersElement[CurrentQuestion-1]);
    }, 1000);

    setTimeout(function () {

      VisualStyles.Invisible(el_QuestionArea);
      VisualStyles.Invisible(el_AnswerGroup);
      VisualStyles.Invisible(el_QuestionTimer);
      VisualStyles.Answers.CorrectFix(QuizAnwsersElement[CurrentQuestion-1]);

      //QuizAnwsersElement[CurrentQuestion-1].removeClass("correctfix");
    }, 3000);
    setTimeout(function () {
      el_TimerCircleFill.classList.remove("timeout");
      CurrentQuestion++;
      if (CurrentQuestion <= TotalQuestions) {
        UpdateQuiz();
        el_QuestionSeconds.textContent = "" + QuestionCounter;

        VisualStyles.Visible(el_QuestionArea);
        VisualStyles.Visible(el_AnswerGroup);
        VisualStyles.Visible(el_QuestionTimer);

        EnableNewQuestion();
      }else{
        endQuiz();
        UpdateQuizResults();
      }
    }, 3500);
  }

  /* Enlarge Question Area */


  el_QuestionArea
    .unbind("click")
    .click(function () {
      if(!StartedSelectionTimer||ReviewingQuiz){

        if (!EnlargedQuestion&&canClickQuestion) {
            enlargeQuestion();
        }

        if (EnlargedQuestion&&canClickQuestion){
            shortenQuestion();
        }

      }
    });

    function enlargeQuestion(){

      canClickQuestion = false;

      initialQuestionHeight = $(".header").outerHeight(true)+el_QuestionParagraphWrapper.outerHeight(true);

      let tempHeight = el_QuestionParagraph.outerHeight(true)+$(".header").outerHeight(true)+15;
      el_QuestionArea.height(''+tempHeight);

      el_QuestionParagraphWrapper.addClass("full-height");
      
      
      VisualStyles.Invisible(el_AnswerGroup);
      VisualStyles.Uninteractable(el_AnswerGroup);

      VisualStyles.Invisible(el_QuestionBottomOverlay);

      EnlargedQuestion = true;

      setTimeout(function(){canClickQuestion=true},500);

    }

    function shortenQuestion(){

      canClickQuestion = false;

      el_QuestionArea.height(''+initialQuestionHeight);


      VisualStyles.Visible(el_QuestionBottomOverlay);
      el_QuestionParagraphWrapper.removeClass("full-height");
      VisualStyles.Visible(el_AnswerGroup);
      VisualStyles.Clickable(el_AnswerGroup);


      EnlargedQuestion = false;

      setTimeout(function(){canClickQuestion=true},500);

    }





   // Results Page

   function UpdateQuizResults(){

    let CorrectResults = CorrectAnswers;
    let IncorrectResults = IncorrectAnswers;
    let PercentageResults = Math.round((CorrectAnswers/TotalQuestions)*100);
    PointsResults = CorrectAnswers*100;


    fadeInOutUpdate(el_ResultsPointsText,PointsResults,500);
    fadeInOutUpdate(el_ResultsPercentageText,PercentageResults,600);
    fadeInOutUpdate(el_ResultsCorrectText,CorrectResults,700);
    fadeInOutUpdate(el_ResultsIncorrectText,IncorrectResults,800);
 


   }



   // Replay Quiz

   function ReplayQuiz(){
    if(!QuizActive){

      // Show the quiz area and remove the quiz-complete message
      VisualStyles.Visible(el_QuizContainer);
      VisualStyles.Clickable(el_AnswerGroup);
      VisualStyles.Clickable(el_QuestionArea);

      VisualStyles.Invisible(el_QuizCompleteMessage);

      FadeOutQuiz(2000);
      FadeInQuiz(4000);
      setTimeout(initializeQuiz(),4000);
    }
   }



     el_ReplayQuizButton.unbind('click').click(function(){
     PressButtonAnimation($(this));
     ReplayQuiz();


     VisualStyles.Invisible(el_ReviewControls);
     VisualStyles.Unclickable(el_ReviewNextButton);
     VisualStyles.Unclickable(el_ReviewPreviousButton);

     });



   // Visual & Animation Auxiliaries






   // Review Answers Logic

    el_ReviewAnswersButton.unbind('click').click(function(){

      if(!QuizActive && !ReviewingQuiz){




        ReviewingQuiz = true;
        CurrentQuestion = 1;

        el_CurrentCorrectAnswers.text(CorrectAnswers);
        el_CurrentIncorrectAnswers.text(IncorrectAnswers);

        PressButtonAnimation($(this));

        // Make the quiz area visible
        VisualStyles.Visible(el_QuizContainer);
        VisualStyles.Clickable(el_QuestionArea);

        VisualStyles.Invisible(el_QuizCompleteMessage);

        VisualStyles.Visible(el_ReviewControls);

        VisualStyles.Unclickable(el_ReviewPreviousButton);
        VisualStyles.Clickable(el_ReviewNextButton);


        VisualStyles.Active(el_ReviewAnswersButton);
        VisualStyles.Active(el_ReviewAnswersButtonLabel);




        VisualStyles.Visible(el_QuestionArea);
        VisualStyles.Visible(el_AnswerGroup);

        ReviewQuiz(CurrentQuestion);

        let result = CheckCorrectAnswer();

        AnimateAnswerResult(UserAnswersElement[CurrentQuestion-1],result,0);

      }

    });


    el_ReviewNextButton.unbind('click').click(function(){
      if(CurrentQuestion<TotalQuestions)
      ReviewQuestion(1);
    });

    el_ReviewPreviousButton.unbind('click').click(function(){
      if(CurrentQuestion>1)
      ReviewQuestion(-1);
    });


    function ReviewQuestion(number){
      CurrentQuestion += number;
      ReviewQuiz(CurrentQuestion);
      let result = CheckCorrectAnswer();
      AnimateAnswerResult(UserAnswersElement[CurrentQuestion-1],result,0);

     // VisualStyles.Clickable(el_QuestionArea);
     // VisualStyles.Clickable(el_AnswerGroup);

      // Check to update if Previous or next question are clickable

      if(CurrentQuestion==1){
        VisualStyles.Unclickable(el_ReviewPreviousButton);
      }else{
        VisualStyles.Clickable(el_ReviewPreviousButton);
      }

      if(CurrentQuestion==TotalQuestions){
        VisualStyles.Unclickable(el_ReviewNextButton);
      }else{
        VisualStyles.Clickable(el_ReviewNextButton);
      }

    };



    function ReviewQuiz(questionNumber){

      ReviewingQuiz = true;

      const TempQuestion = QuizQuestions[questionNumber - 1];

      el_CurrentQuestionNumber.text(CurrentQuestion + "/" + TotalQuestions);
  
      el_QuestionParagraph.text(TempQuestion.question);
  
      el_Answer1.text(TempQuestion.options[0]);
      el_Answer2.text(TempQuestion.options[1]);
      el_Answer3.text(TempQuestion.options[2]);
      el_Answer4.text(TempQuestion.options[3]);

      ClearAllAnswers();


      
    }



    // End Quiz Button: Send to Clickfunnels

    function buildResultsURL(){
      let tempURL = encodeURI(resultsURL)+"?username="+username+"&points="+PointsResults;
      return tempURL;
    }

    el_ClickFunnelsRedirect.unbind('click').click(function(){
      window.location.replace(buildResultsURL());
    });


});
  
/* 

Disable clicking question just before the timer ends for that question. Done

Reset Question to initial height after each question. Done

PREVENT CLICKING QUESITON AFTER TIMER EXPIRES: this causes the lats answers to show up even without the questions showing. Done

Make uninteractable answers once the quiz fades. Done

make uninteractable previous / next review buttons unless reviewing is active. Done

add complete quiz message. done

Enable clicking question box while reviewing. done

fix user data when sending back to clickfunnels. Left to do.

fade out in animation when refreshing results and points. done

if reviewing enlarged question, and then replay > shorten question upon replaying. done



*/