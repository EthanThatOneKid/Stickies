const app = firebase.initializeApp({
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "ethans-stickies.firebaseapp.com",
  databaseURL: "https://ethans-stickies.firebaseio.com",
  projectId: "ethans-stickies",
  storageBucket: "ethans-stickies.appspot.com",
  messagingSenderId: "999999999999"
});

const db = firebase.firestore(app);
const auth = firebase.auth();
