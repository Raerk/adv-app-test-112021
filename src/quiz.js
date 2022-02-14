import quizQuestions from './quiz-questions.js';

$(document).ready(function () {

  let QuestionTimer = 20;

  var DisplayingIncorrectAnswer = false;

  // TIMER



  var circle = document.querySelector(".progress-ring__circle");
  var radius = circle.r.baseVal.value;
  var circumference = radius * 2 * Math.PI;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = `${circumference}`;
  function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  setProgress(0);

  var QuestionSeconds = document.querySelector(".seconds");

  var QuestionCounter = QuestionTimer;
  QuestionSeconds.textContent = "" + QuestionCounter;


   setInterval(function () {
      circle.style.transition = QuestionTimer + "s linear stroke-dashoffset";
      QuestionSeconds.textContent = "" + QuestionCounter;

      console.log(QuestionCounter);

      if (QuestionCounter > 0) {
        QuestionCounter -= 1;
      } else {
        // If counter gets to 0, incorrect answer and move to next question
        QuestionCounter = 0;
        if(!DisplayingIncorrectAnswer)
        AnimateTimeOutAnswer();
        //IncorrectAnswer();
        //MoveToNextQuestion();
      }

      circle.style.opacity = "1";
      setProgress(100);
    }, 1000);
  

  /* ---------- Quiz Logic ---------- */

  const QuizQuestions = quizQuestions.AIFluencyQuiz;


  let CurrentQuestion = 0;

  let TotalQuestions = quizQuestions.AIFluencyQuiz.length;

  let CorrectAnswers = 0;

  let IncorrectAnswers = 0;

  let CurrentCorrectAnswer;

  // INITIALIZE QUIZ
  CurrentQuestion = 0;
  UpdateQuiz()
  AwaitAnswers(CurrentQuestion)



  // Add New Questions to the view

  function LoadNewQuestion(questionNumber){


    const TempQuestion = QuizQuestions[questionNumber-1]

    const TempAnswer = QuizQuestions[questionNumber-1].answer;

    $('#question p').text(TempQuestion.question);

    $('#answer1').text(TempQuestion.options[0]);
    $('#answer2').text(TempQuestion.options[1]);
    $('#answer3').text(TempQuestion.options[2]);
    $('#answer4').text(TempQuestion.options[3]);

    // Get Current Correct Answer

    if($('#answer1').text()==TempAnswer){
        CurrentCorrectAnswer = $('#answer1');
    }
    if($('#answer2').text()==TempAnswer){
        CurrentCorrectAnswer = $('#answer2');
    }
    if($('#answer3').text()==TempAnswer){
        CurrentCorrectAnswer = $('#answer3');
    }
    if($('#answer4').text()==TempAnswer){
        CurrentCorrectAnswer = $('#answer4');
    }

    console.log(CurrentCorrectAnswer)

  }


  // Wait for answers to be clicked



  function AwaitAnswers(questionNumber){

    const TempAnswer = QuizQuestions[questionNumber-1].answer;

    let answer1 = $('#answer1');
    let answer2 = $('#answer2');
    let answer3 = $('#answer3');
    let answer4 = $('#answer4');

        $('#answer1').unbind('click').click(
            function(){
                if($('#answer1').text()==TempAnswer){
                    AnimateClickedAnswer(answer1,"correct")
                }else{
                    AnimateClickedAnswer(answer1,"incorrect")
                }
            }
        );

        $('#answer2').unbind('click').click(
            function(){
                if($('#answer2').text()==TempAnswer){
                    AnimateClickedAnswer(answer2,"correct")
                    //MoveToNextQuestion();
                }else{
                    AnimateClickedAnswer(answer2,"incorrect")
                }
            }
        );

        $('#answer3').unbind('click').click(
            function(){
                if($('#answer3').text()==TempAnswer){
                    AnimateClickedAnswer(answer3,"correct")
                    //MoveToNextQuestion();
                }else{
                    AnimateClickedAnswer(answer3,"incorrect")
                }
            }
        );

        $('#answer4').unbind('click').click(
            function(){
                if($('#answer4').text()==TempAnswer){
                    AnimateClickedAnswer(answer4,"correct")
                    //MoveToNextQuestion();
                }else{
                    AnimateClickedAnswer(answer4,"incorrect")
                }
            }
        );
        
    }


    function CorrectAnswer(){
        CorrectAnswers++;
    }

    function IncorrectAnswer(){
        IncorrectAnswers++;
    }



    function UpdateQuiz(){
        CurrentQuestion++;
        if(CurrentQuestion<=TotalQuestions){
        $("#correct-answers").text(CorrectAnswers);
        $("#incorrect-answers").text(IncorrectAnswers);
        $("#question-number").text(CurrentQuestion+"/"+TotalQuestions);

        DisplayingIncorrectAnswer = false;

        LoadNewQuestion(CurrentQuestion);

        QuestionCounter = QuestionTimer;
        circle.style.transition = "0s linear stroke-dashoffset";
        setProgress(0)

        AwaitAnswers(CurrentQuestion)
        }else{
            alert("Internal Note: Reached end of quiz. Will need to move to results view after this.")
        }

    }





    // Animate correct, incorrect answers, fade the timer and update the questions and answers

    function AnimateClickedAnswer(selectedAnswer,result){

        // Make Timer Invisible Temporarily
        $('#question-timer').addClass('invisible');

        // Check if answer was correct or incorrect
        if(result=="correct"){
           // alert(result)
            selectedAnswer.addClass("clicked")
            setTimeout(
                function(){
                    selectedAnswer.removeClass("clicked");
                    selectedAnswer.addClass("correct");
                },2000
            )
            setTimeout(
                function(){
                    selectedAnswer.removeClass("correct");
                },4000
            )
            CorrectAnswer();
        }else{

            selectedAnswer.addClass("clicked")
            setTimeout(
                function(){
                    selectedAnswer.removeClass("clicked");
                    selectedAnswer.addClass("incorrect");
                    CurrentCorrectAnswer.addClass("correctfix");
                },2000
            )
            setTimeout(
                function(){
                    selectedAnswer.removeClass("incorrect");
                    CurrentCorrectAnswer.removeClass("correctfix");
                },4000
            )
            IncorrectAnswer();
        }

        // Quick Fade Transition to Update Quiz

        setTimeout(function(){
            $(".box.large").addClass("invisible")
            $(".answers").addClass("invisible")
        },4000);
        setTimeout(function(){
            UpdateQuiz();
            QuestionSeconds.textContent = "" + QuestionCounter;
            $(".box.large").removeClass("invisible")
            $(".answers").removeClass("invisible")
            $('#question-timer').removeClass('invisible');
        },4500);

    }

    function AnimateTimeOutAnswer(){
        DisplayingIncorrectAnswer = true;
        IncorrectAnswer();
        $(".progress-ring").addClass("timeout");
        setTimeout(
            function(){
                CurrentCorrectAnswer.addClass("correctfix");
            },1000
        )

        setTimeout(function(){
            $(".box.large").addClass("invisible")
            $(".answers").addClass("invisible")
            $('#question-timer').addClass('invisible');
            CurrentCorrectAnswer.removeClass("correctfix");
        },3000);
        setTimeout(function(){
            $(".progress-ring").removeClass("timeout");
            $('#question-timer').removeClass('invisible');
            UpdateQuiz();
            QuestionSeconds.textContent = "" + QuestionCounter;
            $(".box.large").removeClass("invisible")
            $(".answers").removeClass("invisible")
            $('#question-timer').removeClass('invisible');
        },3500);

    }


});


