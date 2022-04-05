/* ------------------------- DOM Views ------------------------- */

let el_QuizView = document.getElementById("quiz-view");
let el_QuizViewScrollArea = document.querySelector('#quiz-view .main-content')

let el_ReviewView = document.getElementById("review-view");

let el_LeaderboardView = document.getElementById("leaderboard-view");


function ScrollView(ViewElement){
    ViewElement.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

function ScrollTop(ViewElementScrollArea){
    ViewElementScrollArea.scrollTo({top: 0, behavior: 'smooth'});
}

export {el_QuizView,el_QuizViewScrollArea,el_ReviewView,el_LeaderboardView,ScrollView,ScrollTop}