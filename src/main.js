/* ------------------------- DOM Views ------------------------- */

let el_QuizView = document.getElementById("quiz-view");

let el_ReviewView = document.getElementById("review-view");

let el_LeaderboardView = document.getElementById("leaderboard-view");


function ScrollView(ViewElement){
    ViewElement.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

export {el_QuizView,el_ReviewView,el_LeaderboardView,ScrollView}