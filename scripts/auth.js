function login() {
  const em = document.getElementById("email-in").value;
  const pw = document.getElementById("pass-in").value;
  auth.signInWithEmailAndPassword(em, pw)
    .catch(e => {
      console.log(e);
    });
}

function signup() {
  const em = document.getElementById("email-in").value;
  const pw = document.getElementById("pass-in").value;
  auth.createUserWithEmailAndPassword(em, pw)
    .catch(e => {
    console.log(e);
    });
}

function changeDisplayName() {
  const dn = document.getElementById("dn-in").value;
  auth.currentUser.updateProfile({
    displayName: dn
  });
}

auth.onAuthStateChanged(user => {
  if (user) {
    console.log(user);
    document.getElementById("dn-in").style.display = "block";
  } else {
    console.log("user is not signed in");
  }
});
