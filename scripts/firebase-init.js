const app = firebase.initializeApp({
  apiKey: "AIzaSyDKTgfM6QXtFhUdtpc40ZUb4etNfuwDPzc",
  authDomain: "ethans-stickies.firebaseapp.com",
  databaseURL: "https://ethans-stickies.firebaseio.com",
  projectId: "ethans-stickies",
  storageBucket: "ethans-stickies.appspot.com",
  messagingSenderId: "714831940211"
});

const db = firebase.firestore(app);
const auth = firebase.auth();
