// Initialize Firebase with your config
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

// Reference to Firebase Firestore
var db = firebase.firestore();

// Get the user's display name and photo URL from Google authentication
var user = firebase.auth().currentUser;
var displayName = user.displayName;
var photoURL = user.photoURL;

// Reference to the chat messages collection in Firestore
var messagesRef = db.collection("messages");

// Function to display messages in the chat UI
function displayMessage(text, sender, timestamp) {
  var chatMessages = document.getElementById("chat-messages");
  var messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (sender === displayName) {
    messageDiv.classList.add("sent-message");
  } else {
    messageDiv.classList.add("received-message");
  }
  var messageContent = `
    <img src="${photoURL}" alt="Avatar" class="avatar">
    <div>
      <span class="sender">${sender}</span>
      <p class="text">${text}</p>
      <span class="timestamp">${timestamp}</span>
    </div>
  `;
  messageDiv.innerHTML = messageContent;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a new message
function sendMessage() {
  var messageInput = document.getElementById("message-input");
  var messageText = messageInput.value.trim();
  if (messageText !== "") {
    var timestamp = new Date().toLocaleString();
    messagesRef.add({
      text: messageText,
      sender: displayName,
      timestamp: timestamp,
      photoURL: photoURL
    });
    messageInput.value = "";
  }
}

// Function to sign out the user
function signOut() {
  firebase.auth().signOut().then(function () {
    // Redirect to index.html on successful logout
    window.location.href = "index.html";
  }).catch(function (error) {
    console.error("Sign-out error:", error);
  });
}

// Function to listen for new messages and display them
function listenForMessages() {
  messagesRef.orderBy("timestamp").onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      if (change.type === "added") {
        var message = change.doc.data();
        displayMessage(message.text, message.sender, message.timestamp);
      }
    });
  });
}

// Check if the user is logged in, and redirect to index.html if not
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    displayName = user.displayName;
    photoURL = user.photoURL;
    listenForMessages();
  } else {
    window.location.href = "index.html";
  }
});
