let hasInitiallyLoaded = false;
let panelCount = 0, maxPanels = 0;

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("user-settings").innerHTML = auth.currentUser.displayName[0];
    if (!hasInitiallyLoaded) {
      (async () => {
        await loadPanelCount();
        hasInitiallyLoaded = true;
      })();
    }
  } else {
    console.log("not signed in");
  }
});

async function loadPanelCount() {
  const ref = await db.doc("accounts/" + auth.currentUser.email).get();
  if (ref.exists) {
    const data = ref.data();
    panelCount = data.owned.length;
    maxPanels = data.maxPanels;
    document.getElementById("panel-count").innerHTML = `panels: ${panelCount}/${maxPanels}`;
  }
}
