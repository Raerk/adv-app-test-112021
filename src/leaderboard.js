// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";

import {
  getDatabase,
  get,
  onValue,
  ref,
  set,
  child,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/9.6.8/firebase-database.js";

import {} from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";

import {
  fadeInOutUpdate,
  PointsResults,
  UserEmail,
  UserFirstName,
  VisualStyles,
} from "./quiz.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5z5fd_pRu19Zl2Mt1ZxkgiNWUXBAWWIw",
  authDomain: "adava-test.firebaseapp.com",
  databaseURL: "https://adava-test-default-rtdb.firebaseio.com",
  projectId: "adava-test",
  storageBucket: "adava-test.appspot.com",
  messagingSenderId: "531679309237",
  appId: "1:531679309237:web:3e3b9b716c9da8edc5fdfc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getDatabase();

// DOM References

let el_LeaderboardChart = document.querySelector("#leaderboard-chart");

let el_LeaderboardTop1 = document.querySelector(
  ".leaderboard-chart .winner-one .bar"
);
let el_LeaderboardTop2 = document.querySelector(
  ".leaderboard-chart .winner-two .bar"
);
let el_LeaderboardTop3 = document.querySelector(
  ".leaderboard-chart .winner-three .bar"
);

let el_LeaderboardList = document.getElementById("leaderboard-list");

let el_LeaderboardListWrapper = document.querySelector(".row-wrapper");

let el_PersonalBestContainer = document.querySelector(
  ".personal-best-container"
);
let el_PersonalBest = document.querySelector("#personal-best");

// Logic Variables

let LeaderboardChart_BarOpacity = 85;

let PersonalBest;

function Create_el_Highscore(amount) {
  // Clear the Leaderboard List
  el_LeaderboardList.innerHTML = "";

  el_LeaderboardList.innerHTML += `
    <div class="row">
        <div class="placing">01</div>
        <div class="thumbnail"></div>
        <div id="test-username" class="name"></div>
        <div class="points"><span id="test-points"></span><span class="pts">PTS</span></div>
    </div>
    `;
}

let el_LeaderboardListRows = [];

const UpdatedPoints = ref(db);
onValue(UpdatedPoints, (snapshot) => {
  const data = snapshot.val();
  // if the user list isn't empty
  if (data != null) {
    // Reads the entire collection object: console.log(data);

    // Copy data into temporary object to sort by highscore
    let tempData = {};
    tempData = data;
    // sort by highscore

    const sorted = Object.values(tempData).sort((a, b) => b.Points - a.Points);
    tempData = sorted;

    // If the list has 3 or more users, display the user leaderboard. If not, the placeholder screen for the leaderboard.
    if (tempData.length >= 3) {
      
      // Clear the Leaderboard List after the time it takes to fade out the list
      VisualStyles.Invisible(el_LeaderboardListWrapper);
      setTimeout(function(){
        el_LeaderboardListWrapper.innerHTML = "";



      //Update Leaderboard Chart (top 3)

      setTimeout(function () {



        VisualStyles.Visible(el_LeaderboardChart);
        el_LeaderboardTop1.classList.add("start-animation");
        el_LeaderboardTop2.classList.add("start-animation");
        el_LeaderboardTop3.classList.add("start-animation");
        UpdateLeaderboardChart(tempData);
      }, 400);

      // Initialize counter
      let tempIndex = 1;

      Object.keys(tempData).forEach((key) => {
        //console.log(key, tempData[key])

        // Highlight the current active user in the leaderboard list
        let tempClass = "row";
        if (UserEmail.toLowerCase() == tempData[key].Email)
          tempClass = "row self";

        // Add leaderboard user elements
        el_LeaderboardListWrapper.innerHTML +=
          `
            <div id="leaderboard-list-row-` +
          tempIndex +
          `" class="` +
          tempClass +
          ` invisible">
                <div class="placing">` +
          tempIndex +
          `</div>
                <div class="thumbnail" style="border: 1.5px solid `+tempData[key].Avatar+`;"><i style="color:` +tempData[key].Avatar +`" class="fa-regular fa-user"></i></div>
                <div id="test-username" class="name">` +
          tempData[key].FirstName +
          `</div>
                <div class="points"><span id="test-points">` +
          tempData[key].Points +
          `</span><span class="pts">PTS</span></div>
            </div>
            `;

        // Get Personal Best from current array (if it matches email), and display it in the points screen

        console.log(tempData[key].Email + " with " + UserEmail.toLowerCase());

        if (tempData[key].Email == UserEmail.toLowerCase()) {
          setTimeout(function(){
            PersonalBest = tempData[key].Points;
            el_PersonalBest.textContent = PersonalBest;
          },500);


          // fade in the personal best container for a smooth transition
          fadeInOutUpdate(el_PersonalBestContainer, "", 500);
        }

        // Increase Index
        tempIndex++;
      });
    },500);

      // Make the row group visible and show all Rows by fading them in in order

      setTimeout(function(){

        VisualStyles.Visible(el_LeaderboardListWrapper);

        for (var i = 1; i <= tempData.length; i++) {
          let tempItem = document.getElementById("leaderboard-list-row-" + i);
          setTimeout(function () {
            tempItem.classList.remove("invisible");
          }, 150 * i);
        }
      },1000);

    }else{
        
      //Show the default leaderboard placeholder
      setTimeout(function () {
        VisualStyles.Visible(el_LeaderboardChart);
        el_LeaderboardTop1.classList.add("start-animation");
        el_LeaderboardTop2.classList.add("start-animation");
        el_LeaderboardTop3.classList.add("start-animation");


        //UpdateLeaderboardChart(tempData);
      }, 400);

    }

  }else{
            //Show the default leaderboard placeholder
            setTimeout(function () {
                VisualStyles.Visible(el_LeaderboardChart);
                el_LeaderboardTop1.classList.add("start-animation");
                el_LeaderboardTop2.classList.add("start-animation");
                el_LeaderboardTop3.classList.add("start-animation");
        
        
                //UpdateLeaderboardChart(tempData);
              }, 400);
  }
});

// Create and Update Data to DB Logic

function UpdateUserScore() {
  // If the current score is higher than the personal best score, then update automatically. If it's lower, then do nothing.

  if (PointsResults > PersonalBest) {
    let ValidatedEmail = ValidateEmailFirebase(UserEmail);

    update(ref(db, ValidatedEmail), {
      Points: PointsResults,
    })
      .then(() => {
        console.log("data updated successfully");
      })
      .catch((err) => {
        console.log("error: " + err);
      });
  }
}

function CreateUserScore() {
  let ValidatedEmail = ValidateEmailFirebase(UserEmail);

  //console.log(ValidatedEmail+ "is the email before creating");

  set(ref(db, ValidatedEmail), {
    Email: UserEmail.toLowerCase(),
    FirstName: UserFirstName,
    Points: PointsResults,
    Avatar: AssignAvatar(),
  })
    .then(() => {
      console.log("data created successfully");
    })
    .catch((err) => {
      console.log("error: " + err);
    });
}


// Colors:          Turquoise, BrightViolet, Pink, Purple, Violet
let AvatarColors = ["#28C4D4", "#C32FE4", "#E953AD", "#7000CF", "#AB2EB8"];

function AssignAvatar() {
  var RandomIndex =
    AvatarColors[Math.floor(Math.random() * AvatarColors.length)];
  return RandomIndex;
}

AssignAvatar();

// Check if the user exists. Update the score if it does exist, and Create if it doesn't.

const SubmitScoreDB = function SubmitScoreDB() {
  let ValidatedEmail = ValidateEmailFirebase(UserEmail);

  const userRef = ref(db, ValidatedEmail);

  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        //console.log(snapshot.val());
        UpdateUserScore();
      } else {
        CreateUserScore();
        //console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// Update the Laderboard Chart. The passed array should be the sorted array

let el_Top1Username = document.getElementById("top-1-username");
let el_Top1Profile = document.getElementById("top-1-profile");
let el_Top1Points = document.getElementById("top-1-points");

let el_Top2Username = document.getElementById("top-2-username");
let el_Top2Profile = document.getElementById("top-2-profile");
let el_Top2Points = document.getElementById("top-2-points");

let el_Top3Username = document.getElementById("top-3-username");
let el_Top3Profile = document.getElementById("top-3-profile");
let el_Top3Points = document.getElementById("top-3-points");

function UpdateLeaderboardChart(arr) {
  el_Top1Username.textContent = arr[0].FirstName;
  el_Top1Profile.style.color = arr[0].Avatar;
  el_Top1Profile.style.textShadow = '0px 5px 7px '+arr[0].Avatar;
 /* el_Top1Profile.style.color = '#fff';*/
  el_Top1Profile.style.border = '1.5px solid '+arr[0].Avatar;
  el_Top1Profile.style.boxShadow = '0px 4px 9px '+arr[0].Avatar;
  el_Top1Points.textContent = arr[0].Points;
  // Change the Bar Color according to the user's color
  el_LeaderboardTop1.style.backgroundColor = arr[0].Avatar+LeaderboardChart_BarOpacity;

  el_Top2Username.textContent = arr[1].FirstName;
  el_Top2Profile.style.color = arr[1].Avatar;
  el_Top2Profile.style.color = '#fff';
  el_Top2Profile.style.border = '1.5px solid '+arr[1].Avatar;
  el_Top2Profile.style.boxShadow = '0px 4px 9px '+arr[1].Avatar;
  el_Top2Points.textContent = arr[1].Points;
  // Change the Bar Color according to the user's color
  el_LeaderboardTop2.style.backgroundColor = arr[1].Avatar+LeaderboardChart_BarOpacity;



  el_Top3Username.textContent = arr[2].FirstName;
  el_Top3Profile.style.color = arr[2].Avatar;
  el_Top3Profile.style.color = '#fff';
  el_Top3Profile.style.border = '1.5px solid '+arr[2].Avatar;
  el_Top3Profile.style.boxShadow = '0px 4px 9px '+arr[2].Avatar;
  el_Top3Points.textContent = arr[2].Points;
  // Change the Bar Color according to the user's color
  el_LeaderboardTop3.style.backgroundColor = arr[2].Avatar+LeaderboardChart_BarOpacity;


}

function ValidateEmailFirebase(TempEmail) {
  let ValidatedEmail = TempEmail.replace(".", ",").toLowerCase();
  return ValidatedEmail;
}

export { SubmitScoreDB };
