// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyASwz28oiDM2u3UsAN7oaIrW-0DZOodIjg",
    authDomain: "myapp-6ebe3.firebaseapp.com",
    databaseURL: "https://myapp-6ebe3-default-rtdb.firebaseio.com",
    projectId: "myapp-6ebe3",
    storageBucket: "myapp-6ebe3.firebasestorage.app",
    messagingSenderId: "689405110508",
    appId: "1:689405110508:web:b90901040383a0d0ce9"
};

// initialize firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();


// SIGN UP
// get signup elements
const signupName = document.getElementById("name");
const signupDob = document.getElementById("dob");
const signupEmail = document.getElementById("email");
const signupPassword = document.getElementById("password");
const btnSignup = document.getElementById("btnSignup");

// click signup
btnSignup.addEventListener("click", (e) => {
    e.preventDefault();

    const name = signupName.value;
    const dob = signupDob.value;
    const email = signupEmail.value;
    const password = signupPassword.value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((cred) => {
            const userId = cred.user.uid;

            // save name and dob in database
            database.ref("users/" + userId).set({
                name: name,
                dob: dob
            });

            alert("Signup successful");

            // clear inputs
            signupName.value = "";
            signupDob.value = "";
            signupEmail.value = "";
            signupPassword.value = "";
        })
        .catch((error) => {
            alert(error.message);
        });
});


// LOGIN
// get login elements
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const btnLogin = document.getElementById("btnLogin");

// click login
btnLogin.addEventListener("click", (e) => {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((cred) => {
            checkBirthday(cred.user.uid); // check birthday and show message
            getQuote(); // always fetch a random quote

            // clear inputs
            loginEmail.value = "";
            loginPassword.value = "";
        })
        .catch((error) => {
            alert(error.message);
        });
});


// birthday check
const checkBirthday = (userId) => {
    database.ref("users/" + userId).once("value")
        .then((snapshot) => {
            const userData = snapshot.val();
            const name = userData.name;

            // Parse DOB as year, month, day only
            const dobParts = userData.dob.split("-"); // "YYYY-MM-DD"
            const dobMonth = parseInt(dobParts[1], 10) - 1; // month is 0-based
            const dobDay = parseInt(dobParts[2], 10);

            const today = new Date();
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // This year's birthday
            let birthdayThisYear = new Date(today.getFullYear(), dobMonth, dobDay);

            let daysLeft = Math.round((birthdayThisYear - todayOnly) / (1000 * 60 * 60 * 24));

            // If birthday already passed, calculate for next year
            if (daysLeft < 0) {
                const birthdayNextYear = new Date(today.getFullYear() + 1, dobMonth, dobDay);
                daysLeft = Math.round((birthdayNextYear - todayOnly) / (1000 * 60 * 60 * 24));
            }

            // Show message
            if (daysLeft === 0) {
                document.getElementById("message").innerText = "Happy Birthday " + name + "!";
            } else {
                document.getElementById("message").innerText =
                    daysLeft + " days left until your birthday, " + name;
            }
        });
};


// Random quote
const getQuote = () => {
    fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://zenquotes.io/api/random"))
    .then(res => res.json())
    .then(data => {
        const parsed = JSON.parse(data.contents); // because allorigins returns wrapped text
        document.getElementById("quote").innerText = `"${parsed[0].q}" — ${parsed[0].a}`;
    })

    /*fetch("https://api.quotable.io/random")
        .then(response => response.json()) // parse json
        .then(data => {
            // show quote
            document.getElementById("quote").innerText = `"${data.content}" — ${data.author}`;
        })
    */         
        .catch(error => {
            console.log("Could not fetch quote:", error);
            document.getElementById("quote").innerText = "Have a wonderful day!";
        });
       
};


// LOGOUT
const btnLogout = document.getElementById("btnLogout");
btnLogout.addEventListener("click", () => {
    auth.signOut().then(() => {
        document.getElementById("message").innerText = "";
        document.getElementById("quote").innerText = "";
        alert("Logged out");
    });
});
