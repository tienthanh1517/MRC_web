import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAElqBsGbU_vaW6x385HUmcBuZArpXnn-U",
    authDomain: "mrcteamiot.firebaseapp.com",
    databaseURL: "https://mrcteamiot-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mrcteamiot",
    storageBucket: "mrcteamiot.appspot.com",
    messagingSenderId: "441187782155",
    appId: "1:441187782155:web:1f8a6090a8fbe233b5c10e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginButton = document.getElementById("submit");
loginButton.addEventListener("click", function () {
    const email = document.querySelector(".input-box input[type='text']").value;
    const password = document.querySelector(".input-box input[type='password']").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Login successful");
            window.location.href = "mainscreen.html"; 
        })
        .catch((error) => {
            console.error("Login failed: ", error.message);
            alert("Login failed. Please check your email and password.");
        });
});
