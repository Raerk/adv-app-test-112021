import getParameter from "./user.js";

import quizQuestions from "./quiz-questions.js";

import {SubmitScoreDB} from "./leaderboard.js";


import {el_QuizView,el_QuizViewScrollArea,el_ReviewView,el_LeaderboardView,ScrollView,ScrollTop} from "./main.js";



// Visual Styles and Animation Functions

const VisualStyles = {

  Clickable:
  function(element){element.classList.remove("unclickable","faded");},
  Unclickable: 
  function(element){element.classList.add("unclickable","faded");},

  Visible:
  function(element){element.classList.remove("invisible");},
  Invisible:
  function(element){element.classList.add("invisible");},

  Active:
  function(element){element.classList.add("active");},
  Inactive:
  function(element){element.classList.remove("active");},

  Uninteractable:
  function(element){element.classList.add("unclickable");},

  FullHeight:
  function(element){element.classList.add("full-height");},

  RegularHeight:
  function(element){element.classList.remove("full-height");},  

  Answers: {
    Clicked:
    function(element){element.classList.add("clicked");},
    Correct:
    function(element){element.classList.add("correct");},
    Incorrect:
    function(element){element.classList.add("incorrect");},
    CorrectFix:
    function(element){element.classList.add("correctfix");},

    Unselect:
    function(element){element.classList.remove("clicked");},
    Clear:
    function(element){element.classList.remove("clicked","correct","incorrect");},


  }

}

function PressButtonAnimation(element){

  element.classList.add('add-transition');
  element.classList.add('push-button');
  setTimeout(function(){
    element.classList.remove('push-button');
  },150);
  setTimeout(function(){
    element.classList.remove('add-transition');
  },300);

}

const fadeInOutUpdate = function fadeInOutUpdate(element,text,delay){
  VisualStyles.Invisible(element);
  
  setTimeout(function(){
    if(text!='')
    element.textContent = text;

    VisualStyles.Visible(element);
  }
  ,delay);
}




// Quiz Logic





const UserEmail = getParameter("useremail");

const UserFirstName = getParameter("username");

const resultsURL = getParameter("quizResultsURL");


// Add Answer Component



  /*--------------------------------
  DOM ELEMENTS
  --------------------------------*/

  // Quiz Particle Header

  let el_QuizContainer = document.querySelector('#quiz-view .main-content .quiz-container');

  // Quiz Review Controls

  let el_ReviewControls = document.querySelector(".review-controls");

  let el_ReviewNextButton = document.querySelector(".review-next");
  let el_ReviewPreviousButton = document.querySelector(".review-previous");

  // Quiz Timer

  let el_QuestionTimer = document.querySelector("#question-timer");
  let el_TimerCircle = document.querySelector(".progress-ring__circle");
  let el_TimerCircleFill = document.querySelector(".progress-ring");
  let el_QuestionSeconds = document.querySelector(".seconds");

  // Quiz Question Box

  let el_CurrentCorrectAnswers = document.querySelector("#correct-answers");
  let el_CurrentIncorrectAnswers = document.querySelector("#incorrect-answers");
  let el_CurrentQuestionNumber = document.querySelector("#question-number");

  let el_QuestionArea = document.querySelector('.box');

  let el_QuestionParagraph = document.querySelector('#question p');
  let el_QuestionParagraphWrapper = document.querySelector('#question');

  let el_QuestionBottomOverlay = document.querySelector(".scrolling-overlay");

  // Answers

  let el_AnswerGroup = document.querySelector('.answers');

  let el_Answer = [];

  let el_Answer1 = document.querySelector('#answer1');
  let el_Answer2 = document.querySelector('#answer2');  
  let el_Answer3 = document.querySelector('#answer3');
  let el_Answer4 = document.querySelector('#answer4');

  // Quiz Complete Message

  let el_QuizCompleteMessage = document.querySelector('#quiz-complete-message');


  // Quiz Results Page

  let el_SummaryButtons = document.querySelector("#summary-buttons");

  let el_ReviewAnswersButton = document.querySelector('#review-answers');
  let el_ReviewAnswersButtonLabel = document.querySelector('#review-label')

  let el_ResultsPointsText = document.querySelector('#results-points');
  let el_ResultsPercentageText = document.querySelector('#results-percentage');
  let el_ResultsCorrectText = document.querySelector('#results-correct');
  let el_ResultsIncorrectText = document.querySelector('#results-incorrect');

  let el_ReplayQuizButton = document.querySelector('#replay-quiz');

  let el_ClickFunnelsRedirect = document.querySelector('#clickfunnels-redirect');
  let el_ClickFunnelsRedirectMobile = document.querySelector('#clickfunnels-redirect-mobile');

  let el_ContinueToLeaderboard = document.querySelector('#continue-to-leaderboard');


  
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

  let result = '';



  let CorrectAnswers = 0;

  let IncorrectAnswers = 0;

  let CanChangeAnswer = true;

  let StartedSelectionTimer = false;

  let QuizAnswers = [];
  let QuizAnswersElement = [];

  let UserAnswers = [];
  let UserAnswersElement = [];

  let PointsResults = 0;

  let QuestionTimeLeft;

  let EnlargedQuestion = false;

  let initialQuestionHeight;

  let canClickQuestion = true;



  // Timer Logic


  let radius = el_TimerCircle.r.baseVal.value;
  let circumference = radius * 2 * Math.PI;

  el_TimerCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  el_TimerCircle.style.strokeDashoffset = `${circumference}`;

  let QuestionCounter = QuestionTimer;
  el_QuestionSeconds.textContent = ""+QuestionCounter;


  function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    el_TimerCircle.style.strokeDashoffset = offset;
  }

  function StartQuestionTimer() {

    QuestionTimeLeft = QuestionTimer;

    setProgress(0);

    QuestionTimerElement = setInterval(function () {
      el_TimerCircle.style.transition = QuestionTimer + "s linear stroke-dashoffset";
      el_QuestionSeconds.textContent = "" + QuestionCounter;

      console.log(QuestionCounter);

      if (QuestionCounter > 0) {
        el_QuestionSeconds.textContent = ""+QuestionCounter;
        QuestionCounter -= 1;
        QuestionTimeLeft -= 1;

      } else {
        // If counter gets to 0, incorrect answer and move to next question
        el_QuestionSeconds.textContent = ""+QuestionCounter;
        QuestionCounter = 0;
        StopQuestionTimer();
        if (!DisplayingIncorrectAnswer)
        AnimateTimeOutAnswer();
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
    VisualStyles.Uninteractable(el_ClickFunnelsRedirectMobile);

    VisualStyles.Inactive(el_ReviewAnswersButton);
    VisualStyles.Inactive(el_ReviewAnswersButtonLabel);

    VisualStyles.Invisible(el_ReviewControls);
    VisualStyles.Unclickable(el_ReviewNextButton);
    VisualStyles.Unclickable(el_ReviewPreviousButton);

    // Reset the quiz variables values



    QuizAnswers = [];
    QuizAnswersElement = [];

    UserAnswers = [];
    QuizAnswersElement = [];

    TotalQuestions = quizQuestions.AIFluencyQuiz.length;
    CurrentQuestion = 1;

    CorrectAnswers = 0;
    IncorrectAnswers = 0;

    DisplayingIncorrectAnswer = false;
    CanChangeAnswer = true;

    StartedSelectionTimer = false;

    PointsResults = 0;
    fadeInOutUpdate(el_ResultsPointsText,""+PointsResults,500);
    fadeInOutUpdate(el_ResultsPercentageText,"-",500);
    fadeInOutUpdate(el_ResultsCorrectText,"-",500);
    fadeInOutUpdate(el_ResultsIncorrectText,"-",500);

    /*
    PointsResults = 0;
    fadeInOutUpdate(el_ResultsPointsText,PointsResults,500);
    */


    // Initialize Quiz

    UpdateQuiz();
    AwaitAnswers(CurrentQuestion-1);
    //StartQuestionTimer();

    QuizActive = true;

  }


  function endQuiz(){
    QuizActive = false;

    // Hide the whole quiz area (including background), to display the full-height message
    VisualStyles.Invisible(el_QuizContainer);
    VisualStyles.Uninteractable(el_AnswerGroup);
    VisualStyles.Uninteractable(el_QuestionArea);

    setTimeout(function(){
      // clear answer section
      document.getElementById('answers').innerHTML = "";
    },1000);

    setTimeout(function(){VisualStyles.Visible(el_QuizCompleteMessage)},1000);
    setTimeout(function(){VisualStyles.Clickable(el_SummaryButtons)},1000);
    setTimeout(function(){VisualStyles.Clickable(el_ClickFunnelsRedirect)},1000);
    setTimeout(function(){VisualStyles.Clickable(el_ClickFunnelsRedirectMobile)},1000);

    // Make the continue to leaderboard button visible (for mobile)
    setTimeout(function(){VisualStyles.Clickable(el_ContinueToLeaderboard)},1000);
  }

  


  function LoadNewQuestion(questionNumber) {
    const TempQuestion = QuizQuestions[questionNumber];

    el_QuestionParagraph.textContent=TempQuestion.question;

    Create_el_Answer(questionNumber);


  }

function Create_el_Answer(questionNumber){


  // clear answer section
  document.getElementById('answers').innerHTML = "";

  // check the answer quantity for the current question
  let AnswerQuantity = QuizQuestions[questionNumber].options.length;


  // clear the answer element
  el_Answer = [];
  
  // get the current answer
  let CurrentCorrectAnswer = QuizQuestions[questionNumber].answer;

  // Create answer elements based on the current possible answers, and add the text from the current quiz answers
  for(var i=0;i<AnswerQuantity;i++){
    

      document.getElementById('answers').innerHTML += `
        <a id="answer" class="option">`+QuizQuestions[questionNumber].options[i]+`</a>
      `;
            


    }

    el_Answer = document.querySelectorAll('#answer');

    for(var x=0;x<el_Answer.length;x++){
      //Check if the loaded answer is the current answer. If it is, make the answer element the correct element
      if (QuizQuestions[questionNumber].options[x]==CurrentCorrectAnswer){
      QuizAnswersElement[questionNumber] = el_Answer[x];
      //alert("Correct answer is element index "+x)
      }
    }

                    // Check if the loaded answer is the current answer. If it is, make the answer element the correct element
                /*    if (QuizQuestions[questionNumber].options[i]==CurrentCorrectAnswer){
                      QuizAnswersElement[questionNumber] = el_Answer[i];
                    }*/
    
}



  // Select answer: this will select a new answer or change the previously selected answer

  function SelectedAnswer(element) {

    // Hide the timer
    VisualStyles.Invisible(el_QuestionTimer);

    // Unselect all the answers in case the user is re-selecting an answer
   /* VisualStyles.Answers.Unselect(el_Answer1);
    VisualStyles.Answers.Unselect(el_Answer2);
    VisualStyles.Answers.Unselect(el_Answer3);
    VisualStyles.Answers.Unselect(el_Answer4);*/

    // Style the currently selected answer
    VisualStyles.Answers.Clicked(element);

    UserAnswersElement[CurrentQuestion-1] = element;
    UserAnswers[CurrentQuestion-1] = UserAnswersElement[CurrentQuestion-1].textContent;
  }





  // Reset the StartSelectionTimer to false and CanChangeAnswer to true; so that it can work in the new round.

  function EnableNewQuestion() {
    CanChangeAnswer = true;
    StartedSelectionTimer = false;
    //StartQuestionTimer();
  }

  function StartToleranceTimer(element) {
    StartedSelectionTimer = true;
    setTimeout(function () {
      CanChangeAnswer = false;
      let result = CheckCorrectAnswer(element.textContent);
      AnimateAnswerResult(UserAnswersElement[CurrentQuestion-1], result, 2000);
      FadeQuizAnimation();
    }, 2000);
  }


  // Await answer selection function. This will check for the clicks, start the timer in the first click, and enable to switch the answer if within the timer limit.

  function AwaitAnswers(questionNumber) {

    let AnswerQuantity = QuizQuestions[questionNumber].options.length;

    for(let i=0;i<AnswerQuantity;i++){
      el_Answer[i].onclick =  function(){
        TriggerAnswer(el_Answer[i]);

        CheckCorrectAnswer(el_Answer[i].textContent);
        };

    }

  }

  function TriggerAnswer(element){
      if (!DisplayingIncorrectAnswer) {
        if (!StartedSelectionTimer) {
          StopQuestionTimer();
          // Start the second timer to give some leeway to the user to change the answer
          StartToleranceTimer(element);
        }
        if (CanChangeAnswer) {
          SelectedAnswer(element);
        }
      }
  }
/*
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
  }*/


  function CorrectAnswer() {
    if(QuizActive)
    CorrectAnswers++;

    // If the answer is correct, it will award 100 points + a bonus between 1 and 100 depending on the amount left (it's a % value that adjusts to the initial timer settings)

    PointsResults += 100+Math.round((QuestionTimeLeft/QuestionTimer)*100);
/*
    VisualStyles.Invisible(el_ResultsPointsText);

    setTimeout(function(){
      el_ResultsPointsText.textContent = PointsResults;;
      VisualStyles.Visible(el_ResultsPointsText);
    },500);
*/

    fadeInOutUpdate(el_ResultsPointsText,PointsResults,500);

  }

  function IncorrectAnswer() {
    if(QuizActive)
    IncorrectAnswers++;
  }


  // Update Quiz View Information and trigger the await for answers function.

  function UpdateQuiz() {

      ClearAllAnswers();

      el_CurrentCorrectAnswers.textContent=CorrectAnswers;
      el_CurrentIncorrectAnswers.textContent=IncorrectAnswers;
      el_CurrentQuestionNumber.textContent=CurrentQuestion + "/" + TotalQuestions;

      DisplayingIncorrectAnswer = false;

      LoadNewQuestion(CurrentQuestion-1);

      ResetQuestionHeight();

        // Reset the timer to update the remaining time to the original settings
        setTimeout(function(){el_QuestionSeconds.textContent= ''+QuestionTimer},300);


      setTimeout(function(){

        QuestionCounter = QuestionTimer;
        el_TimerCircle.style.transition = "0s linear stroke-dashoffset";
        setProgress(0);

        StartQuestionTimer();
  
        AwaitAnswers(CurrentQuestion-1);
  
        VisualStyles.Clickable(el_QuestionArea);
        VisualStyles.Clickable(el_AnswerGroup);
  


        VisualStyles.Visible(el_QuestionArea);
        VisualStyles.Visible(el_AnswerGroup);
        VisualStyles.Visible(el_QuestionTimer);


      },500);

  }


  function ResetQuestionHeight(){
            //Display Original Question Size
            canClickQuestion = true;
            VisualStyles.Visible(el_QuestionBottomOverlay);

            initialQuestionHeight = document.querySelector(".header").offsetHeight+el_QuestionParagraphWrapper.offsetHeight;
            let tempHeight = el_QuestionParagraph.offsetHeight+document.querySelector(".header").offsetHeight+35;
            el_QuestionArea.style.height = tempHeight+'px';

            // Get Line Amount
            let tempBox = document.querySelector('#question').firstElementChild;
            //alert(tempBox.offsetHeight/22);

            let lineAmount = tempBox.offsetHeight/22;

            if(lineAmount<=5){
              canClickQuestion = false;
              VisualStyles.Invisible(el_QuestionBottomOverlay);  
            }
  }

    // Check if the selected answer is the same as the correct answer for the round and return the result as 'correct' or 'incorrect'

   /* function CheckCorrectAnswer() {
      let result;
  
      if (QuizAnswers[CurrentQuestion-1] == UserAnswers[CurrentQuestion-1]) {
        result = "correct";
      } else {
        result = "incorrect";
      }
  
      return result;
    }*/


    function CheckCorrectAnswer(selectedAnswerText) {
      let result;
  
      if (QuizQuestions[CurrentQuestion-1].answer == selectedAnswerText) {
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

    // Check if answer was correct or incorrect
    if (result == "correct") {
      VisualStyles.Answers.Unselect(selectedAnswer);
      VisualStyles.Answers.Correct(selectedAnswer);
      CorrectAnswer();
    } else {
      if(UserAnswers[CurrentQuestion-1]!=""){
        VisualStyles.Answers.Unselect(selectedAnswer);
        VisualStyles.Answers.Incorrect(selectedAnswer);

        VisualStyles.Answers.CorrectFix(QuizAnswersElement[CurrentQuestion-1]);
        IncorrectAnswer();
      }else{
        VisualStyles.Answers.CorrectFix(QuizAnswersElement[CurrentQuestion-1]);
        IncorrectAnswer();
      }
    }


    // Scroll to the top of the quiz page (useful for when the question area was large enough to scroll)

    setTimeout(function(){ScrollTop(el_QuizViewScrollArea)},2500);


  }

  // Quick Fade Transition to Update Quiz
  
  function ClearAllAnswers(){
   /* VisualStyles.Answers.Clear(el_Answer1);
    VisualStyles.Answers.Clear(el_Answer2);
    VisualStyles.Answers.Clear(el_Answer3);
    VisualStyles.Answers.Clear(el_Answer4);*/
    //el_QuestionSeconds.textContent= ""+QuestionTimer;
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
      /*  el_QuestionSeconds.textContent = "" + QuestionCounter;

        VisualStyles.Visible(el_QuestionArea);
        VisualStyles.Visible(el_AnswerGroup);
        VisualStyles.Visible(el_QuestionTimer);*/

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
      VisualStyles.Answers.CorrectFix(QuizAnswersElement[CurrentQuestion-1]);
    }, 1000);

    setTimeout(function () {

      VisualStyles.Invisible(el_QuestionArea);
      VisualStyles.Invisible(el_AnswerGroup);
      VisualStyles.Invisible(el_QuestionTimer);
      VisualStyles.Answers.CorrectFix(QuizAnswersElement[CurrentQuestion-1]);

      //QuizAnswersElement[CurrentQuestion-1].classList.remove("correctfix");
    }, 3000);
    setTimeout(function () {
      el_TimerCircleFill.classList.remove("timeout");
      CurrentQuestion++;
      if (CurrentQuestion <= TotalQuestions) {
        UpdateQuiz();
      /*  el_QuestionSeconds.textContent = "" + QuestionCounter;

        VisualStyles.Visible(el_QuestionArea);
        VisualStyles.Visible(el_AnswerGroup);
        VisualStyles.Visible(el_QuestionTimer);*/

        EnableNewQuestion();
      }else{
        endQuiz();
        UpdateQuizResults();
      }
    }, 3500);
  }

  /* Enlarge Question Area */


  el_QuestionArea.onclick = function () {
      if(!StartedSelectionTimer||ReviewingQuiz){

        if (!EnlargedQuestion&&canClickQuestion) {
            enlargeQuestion();
        }

        if (EnlargedQuestion&&canClickQuestion){
            shortenQuestion();
        }

      }
    };

    function enlargeQuestion(){


      canClickQuestion = false;

      initialQuestionHeight = document.querySelector(".header").offsetHeight+el_QuestionParagraphWrapper.offsetHeight;
      let tempHeight = el_QuestionParagraph.offsetHeight+document.querySelector(".header").offsetHeight+35;


      el_QuestionArea.style.height=tempHeight+'px';

      el_QuestionArea.style.maxHeight = tempHeight+'px';

      el_QuestionParagraphWrapper.classList.add("full-height");
      
      
      VisualStyles.Invisible(el_AnswerGroup);
      VisualStyles.Uninteractable(el_AnswerGroup);

      VisualStyles.Invisible(el_QuestionBottomOverlay);

      EnlargedQuestion = true;

      setTimeout(function(){canClickQuestion=true},500);

    }

    function shortenQuestion(){

      canClickQuestion = false;

      el_QuestionArea.style.height = initialQuestionHeight+'px';
      el_QuestionArea.style.maxHeight = '200px';


      VisualStyles.Visible(el_QuestionBottomOverlay);
      el_QuestionParagraphWrapper.classList.remove("full-height");
      VisualStyles.Visible(el_AnswerGroup);
      VisualStyles.Clickable(el_AnswerGroup);


      EnlargedQuestion = false;

      setTimeout(function(){canClickQuestion=true},500);

    }





   // Results Page

   function UpdateQuizResults(){

    setTimeout(function(){ScrollView(el_ReviewView);},2500);


    let CorrectResults = CorrectAnswers;
    let IncorrectResults = IncorrectAnswers;
    let PercentageResults = Math.round((CorrectAnswers/TotalQuestions)*100);

    /*fadeInOutUpdate(el_ResultsPointsText,PointsResults,500);*/
    fadeInOutUpdate(el_ResultsPercentageText,PercentageResults,600);
    fadeInOutUpdate(el_ResultsCorrectText,CorrectResults,700);
    fadeInOutUpdate(el_ResultsIncorrectText,IncorrectResults,800);
 
    SubmitScoreDB();

   }

   el_ContinueToLeaderboard.onclick = function(){ScrollView(el_LeaderboardView);};



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

      // Scroll Horizontally to the Quiz View
      setTimeout(function(){ScrollView(el_QuizView);},1000);

    }
   }



     el_ReplayQuizButton.onclick = function(){
     PressButtonAnimation(this);
     ReplayQuiz();

     VisualStyles.Invisible(el_ReviewControls);
     VisualStyles.Unclickable(el_ReviewNextButton);
     VisualStyles.Unclickable(el_ReviewPreviousButton);

     };



   // Visual & Animation Auxiliaries






   // Review Answers Logic

    el_ReviewAnswersButton.onclick=function(){

      if(!QuizActive && !ReviewingQuiz){

        ReviewingQuiz = true;
        CurrentQuestion = 1;

        el_CurrentCorrectAnswers.textContent = CorrectAnswers;
        el_CurrentIncorrectAnswers.textContent = IncorrectAnswers;

        PressButtonAnimation(this);

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

        ReviewQuiz(CurrentQuestion-1);


        AnimateAnswerResult(UserAnswersElement[CurrentQuestion-1],result,0);

        // Scroll Horizontally to the Quiz View
        setTimeout(function(){ScrollView(el_QuizView);},200);

      }

    };


    el_ReviewNextButton.onclick = function(){
      if(CurrentQuestion<TotalQuestions)
      ReviewQuestion(+1);
    };

    el_ReviewPreviousButton.onclick = function(){
      if(CurrentQuestion>1)
      ReviewQuestion(-1);
    };


    function ReviewQuestion(number){
      CurrentQuestion += number;
      ReviewQuiz(CurrentQuestion-1);
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

      const TempQuestion = QuizQuestions[questionNumber];

      el_CurrentQuestionNumber.textContent = CurrentQuestion + "/" + TotalQuestions;
  
      el_QuestionParagraph.textContent = TempQuestion.question;
  
      Create_el_Answer(questionNumber);

      ClearAllAnswers();

      ResetQuestionHeight();

      
    }



    // End Quiz Button: Send to Clickfunnels

    function buildResultsURL(){
      let tempURL = encodeURI(resultsURL)+"?username="+UserFirstName+"&useremail="+UserEmail+"&points="+PointsResults;
      return tempURL;
    }

    el_ClickFunnelsRedirect.onclick = function(){
      if(resultsURL!=null){
        window.location.replace(buildResultsURL());
      }else{
        alert("There was an error submitting the score.")
      }
    };

    el_ClickFunnelsRedirectMobile.onclick = function(){
      if(resultsURL!=null){
        window.location.replace(buildResultsURL());
      }else{
        alert("There was an error submitting the score.")
      }
    };



  
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


Questions will automatically get the default question height (but keep a max height as default.) Done
Answers should auto adjust to the answer length (keep arrow button at center). Done
Fix max-height animation transition issue. Done
Enlarge question function and white overlay for overflow should only work on questions where there is overflow.

Align answer elements vertically within the answers area.

If the questions and answers are too large and overflow is happening, then the answer area should be vertically scrollable.

Important: Adjust funcionality to display amount of answers based off the entered answers in the quiz object.



*/







/* ----------- LEADERBOARD --------------_*/

export {PointsResults,UserEmail,UserFirstName,VisualStyles,fadeInOutUpdate}