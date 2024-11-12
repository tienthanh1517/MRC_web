import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, get, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js"; // Thêm set vào đây


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
const db = getDatabase(app);

const logoutButton = document.getElementById("logout-btn");
const usernameName = document.getElementById("username-name");
const waterLevelDisplay = document.getElementById("water-level-display");
const rainfallSpeedDisplay = document.getElementById("rainfall-speed-display");
const buzzerToggle = document.getElementById("buzzer-toggle");

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        const userRef = ref(db, "Users/UID_1"); 
        get(userRef).then((snapshot) => {
            if (snapshot.exists() && snapshot.val().UID === uid) {
                usernameName.textContent = snapshot.val().Name + " - Can Tho University Team";
            } else {
                usernameName.textContent = "Guest";
            }
        }).catch((error) => {
            console.error("Error fetching user data: ", error);
            usernameName.textContent = "Guest";
        });
    } else {
        usernameName.textContent = "Guest";
    }
});



logoutButton.addEventListener("click", function () {
    signOut(auth).then(() => {
        console.log("Successfully signed out.");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error signing out: ", error);
        alert("Failed to sign out. Please try again.");
    });
});

let tempWaterlevels_Data = [];
let tempLabels = [];
let tempRainfallData = [];
let tempRainfallLabels = [];
const MAX_DATA_POINTS = 50;
const updateInterval = 500;

const ctx = document.getElementById('Waterlevel_Chart').getContext('2d');
const Waterlevel_Chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Pressure',
            data: [],
            fill: 'start',
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4
        }]
    },
    options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Water Level Monitoring',
                font: { size: 20 },
                color: '#243642',
                padding: { top: 10, bottom: 10 }
            },
            legend: { display: false }
        },
        scales: {
            x: { grid: { display: true, color: 'rgba(200, 200, 200, 0.8)' } },
            y: {
                grid: { display: true, color: 'rgba(200, 200, 200, 0.8)' },
                title: {
                    display: true,
                    text: 'Water level (cm)',
                    color: '#243642',
                    font: { size: 16 }
                }
            }
        }
    }
});

const ctxRainfall = document.getElementById('Speed_RainfallChart').getContext('2d');
const Speed_RainfallChart = new Chart(ctxRainfall, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Rainfall Speed (p/m)',
            data: [],
            borderColor: 'rgb(255, 165, 0)',
            backgroundColor: 'rgba(255, 165, 0, 0.5)',
            tension: 0.4
        }]
    },
    options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Rainfall Speed Monitoring',
                font: { size: 20 },
                color: '#243642',
                padding: { top: 10, bottom: 10 }
            },
            legend: { display: false }
        },
        scales: {
            x: { grid: { display: true, color: 'rgba(200, 200, 200, 0.8)' } },
            y: {
                grid: { display: true, color: 'rgba(200, 200, 200, 0.8)' },
                title: {
                    display: true,
                    text: 'Rainfall Speed',
                    color: '#243642',
                    font: { size: 16 }
                }
            }
        }
    }
});

function updateWaterLevelChart() {
    get(ref(db, "Monitoring_01/streaming/data/json/Water_Level")).then((snapshot) => {
        const pressure = snapshot.val();
        const currentTime = new Date().toLocaleTimeString();
        waterLevelDisplay.textContent = `Water level: ${pressure} cm`;

        tempWaterlevels_Data.push(pressure);
        tempLabels.push(currentTime);

        if (tempWaterlevels_Data.length > MAX_DATA_POINTS) {
            tempWaterlevels_Data.shift();
            tempLabels.shift();
        }

        Waterlevel_Chart.data.labels = [...tempLabels];
        Waterlevel_Chart.data.datasets[0].data = [...tempWaterlevels_Data];
        Waterlevel_Chart.update();
    }).catch(error => console.error("Error fetching pressure data: ", error));
}


function updateRainfallChart() {
    get(ref(db, "Monitoring_01/streaming/data/json/Rainfall_Speed")).then((snapshot) => {
        const rainfallSpeed = snapshot.val();
        const currentTime = new Date().toLocaleTimeString();

        rainfallSpeedDisplay.textContent = `Rainfall speed: ${rainfallSpeed} p/m`;
        tempRainfallData.push(rainfallSpeed);
        tempRainfallLabels.push(currentTime);

        if (tempRainfallData.length > MAX_DATA_POINTS) {
            tempRainfallData.shift();
            tempRainfallLabels.shift();
        }

        Speed_RainfallChart.data.labels = [...tempRainfallLabels];
        Speed_RainfallChart.data.datasets[0].data = [...tempRainfallData];
        Speed_RainfallChart.update();
    }).catch(error => console.error("Error fetching rainfall data: ", error));
}


setInterval(() => {
    updateWaterLevelChart();
    updateRainfallChart();
}, updateInterval);


//------------------------------ toogle switch alarm ------------
const buzzerStateRef = ref(db, "Monitoring_01/streaming/control/buzzer_state");
const confirmationModal = document.getElementById("confirmation-modal");
const confirmYesButton = document.getElementById("confirm-yes");
const confirmCancelButton = document.getElementById("confirm-cancel");

buzzerToggle.addEventListener("change", () => {
  if (buzzerToggle.checked) {
    confirmationModal.style.display = "flex";
  } else {
    set(buzzerStateRef, 0)
      .then(() => console.log("Buzzer state updated: 0"))
      .catch(error => console.error("Error updating buzzer state:", error));
  }
});

confirmYesButton.addEventListener("click", () => {
  confirmationModal.style.display = "none";
  set(buzzerStateRef, 1)
    .then(() => console.log("Buzzer state updated: 1"))
    .catch(error => console.error("Error updating buzzer state:", error));
});

confirmCancelButton.addEventListener("click", () => {
  confirmationModal.style.display = "none";
  buzzerToggle.checked = false;
});
//--------------------------------------------------------------

const sdCardDisplay = document.getElementById("sd-card");
function updateFreeSpace() {
    get(ref(db, "Monitoring_01/streaming/data/SDcard_memorize/freeSpace")).then((snapshot) => {
        const freeSpace = snapshot.val();
        sdCardDisplay.innerHTML = `<i class="fa-solid fa-sd-card"></i> SD Card: ${freeSpace} MB`;
    }).catch(error => console.error("Error fetching free space data: ", error));
}
updateFreeSpace();
setInterval(updateFreeSpace, updateInterval); 
