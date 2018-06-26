function login() {
  const em = document.getElementById("email-in").value;
  const pw = document.getElementById("pass-in").value;
  auth.signInWithEmailAndPassword(em, pw)
    .catch(e => document.getElementById("err-container").innerHTML = e.message);
}

function signup() {
  const em = document.getElementById("email-in").value;
  const pw = document.getElementById("pass-in").value;
  auth.createUserWithEmailAndPassword(em, pw)
    .then(() => {
      db.doc("accounts/" + auth.currentUser.uid).set({
        owned: [],
        shared: []
      });
    })
    .catch(e => document.getElementById("err-container").innerHTML = e.message);
}

function signout() {
  auth.signOut()
    .catch(e => document.getElementById("err-container").innerHTML = e.message);
}

function rndKey(len = 28) {
  let result = "";
  let possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  for (let i = 0; i < len; i++) {
    result += possible[Math.floor(Math.random() * possible.length)];
  }
  return result;
}

function changeDisplayName() {
  const dn = document.getElementById("dn-in").value;
  auth.currentUser.updateProfile({
    displayName: dn
  });
}
