// Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";

 import { getDatabase, get, onValue, ref, set, child, update, remove } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-database.js"

 import { } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js"


 import {fadeInOutUpdate, PointsResults,UserEmail, UserFirstName, VisualStyles} from "./quiz.js";
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
    appId: "1:531679309237:web:3e3b9b716c9da8edc5fdfc"
  };

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);

 const db = getDatabase();



 // DOM References

let el_LeaderboardChart = document.querySelector('#leaderboard-chart');

let el_LeaderboardTop1 = document.querySelector('.leaderboard-chart .winner-one .bar');
let el_LeaderboardTop2 = document.querySelector('.leaderboard-chart .winner-two .bar');
let el_LeaderboardTop3 = document.querySelector('.leaderboard-chart .winner-three .bar');

let el_LeaderboardList = document.getElementById('leaderboard-list');

let el_PersonalBestContainer = document.querySelector('.personal-best-container');
let el_PersonalBest = document.querySelector('#personal-best');

// Logic Variables


let PersonalBest;


function Create_el_Highscore(amount){
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
  // Reads the entire collection object: console.log(data);


    // Copy data into temporary object to sort by highscore
    let tempData = {};
    tempData = data;
    // sort by highscore
    const sorted = Object.values(tempData).sort((a, b) => b.Points - a.Points);
    //console.log(sorted);

    tempData = sorted;
    //console.log(tempData);





      // Clear the Leaderboard List
      el_LeaderboardList.innerHTML = "";

      //Update Leaderboard Chart (top 3)
      setTimeout(function(){
        VisualStyles.Visible(el_LeaderboardChart);
        el_LeaderboardTop1.classList.add('start-animation');
        el_LeaderboardTop2.classList.add('start-animation');
        el_LeaderboardTop3.classList.add('start-animation');

        UpdateLeaderboardChart(tempData);

      },400);



    // Initialize counter
    let tempIndex = 1;



    Object.keys(tempData).forEach((key) =>{

    //console.log(key, tempData[key])

        // Highlight the current active user in the leaderboard list
        let tempClass = "row";
        if(UserEmail.toLowerCase()==tempData[key].Email)
        tempClass = "row self";

        // Add leaderboard user elements
           el_LeaderboardList.innerHTML += `
            <div id="leaderboard-list-row-`+tempIndex+`" class="`+tempClass+` invisible">
                <div class="placing">`+tempIndex+`</div>
                <div class="thumbnail"><i style="color:`+tempData[key].Avatar+`" class="fa-solid fa-circle-user"></i></div>
                <div id="test-username" class="name">`+tempData[key].FirstName+`</div>
                <div class="points"><span id="test-points">`+tempData[key].Points+`</span><span class="pts">PTS</span></div>
            </div>
            `;


        // Get Personal Best from current array (if it matches email), and display it in the points screen

        console.log(tempData[key].Email+" with "+UserEmail.toLowerCase());

        if(tempData[key].Email==UserEmail.toLowerCase()){
            PersonalBest = tempData[key].Points;
            el_PersonalBest.textContent = PersonalBest;

            // fade in the personal best container for a smooth transition
            fadeInOutUpdate(el_PersonalBestContainer,'',500);

        }

        // Increase Index
        tempIndex++;

    });




    // Show all Rows by fading them in in order
        
        for(var i=1;i<=tempData.length;i++){
            let tempItem = document.getElementById('leaderboard-list-row-'+i);
            setTimeout(function(){tempItem.classList.remove('invisible')},150*i);
        }



  /*  setTimeout(function(){
        
        for(var i=1;i<=tempData.length;i++){
            document.getElementById('leaderboard-list-row-'+i).classList.remove('invisible')
        }
    },1000);*/



});







 // Create and Update Data to DB Logic

 function UpdateUserScore(){

    // If the current score is higher than the personal best score, then update automatically. If it's lower, then do nothing.

    if(PointsResults>PersonalBest){

        let ValidatedEmail = ValidateEmailFirebase(UserEmail);

        update(ref(db,ValidatedEmail),{
            Points: PointsResults,
        })
        .then(()=>{
            console.log("data updated successfully")
        }).catch((err)=>{
            console.log("error: "+err)
        })
    }
}

function CreateUserScore(){
    let ValidatedEmail = ValidateEmailFirebase(UserEmail);

    //console.log(ValidatedEmail+ "is the email before creating");

    set(ref(db,ValidatedEmail),{
        Email: UserEmail.toLowerCase(),
        FirstName: UserFirstName,
        Points: PointsResults,
        Avatar: AssignAvatar(),
    }).then(()=>{
        console.log("data created successfully")
    }).catch((err)=>{
        console.log("error: "+err)
    }) 
}

let AvatarColors = ['Teal','Pink','Blue','Violet'];

function AssignAvatar(){
    var RandomIndex = AvatarColors[Math.floor(Math.random()*AvatarColors.length)];
    return RandomIndex;
}

AssignAvatar();

// Check if the user exists. Update the score if it does exist, and Create if it doesn't.

const SubmitScoreDB = function SubmitScoreDB(){


    let ValidatedEmail = ValidateEmailFirebase(UserEmail);

    const userRef = ref(db,ValidatedEmail);

    get(userRef).then((snapshot) => {
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

}




// Update the Laderboard Chart. The passed array should be the sorted array

let el_Top1Username = document.getElementById('top-1-username');
let el_Top1Profile = document.getElementById('top-1-profile');
let el_Top1Points = document.getElementById('top-1-points');

let el_Top2Username = document.getElementById('top-2-username');
let el_Top2Profile = document.getElementById('top-2-profile');
let el_Top2Points = document.getElementById('top-2-points');

let el_Top3Username = document.getElementById('top-3-username');
let el_Top3Profile = document.getElementById('top-3-profile');
let el_Top3Points = document.getElementById('top-3-points');

function UpdateLeaderboardChart(arr){

    el_Top1Username.textContent = arr[0].FirstName;
    el_Top1Profile.style.color = arr[0].Avatar;
    el_Top1Points.textContent = arr[0].Points;

    el_Top2Username.textContent = arr[1].FirstName;
    el_Top2Profile.style.color = arr[1].Avatar;
    el_Top2Points.textContent = arr[1].Points;

    el_Top3Username.textContent = arr[2].FirstName;
    el_Top3Profile.style.color = arr[2].Avatar;
    el_Top3Points.textContent = arr[2].Points;

}



function ValidateEmailFirebase(TempEmail){
    let ValidatedEmail = TempEmail.replace('.',',').toLowerCase();
    return ValidatedEmail;
}



export {SubmitScoreDB};