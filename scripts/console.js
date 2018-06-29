let ownedSortableList, sharedSortableList;
let ownedListEl, sharedListEl;
let ownedList, sharedList;
let hasInitiallyLoaded = false;
let panelCount = 0, maxPanels = 0;
let shareListener;


auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("user-settings").innerHTML = auth.currentUser.email[0].toUpperCase();
    if (!hasInitiallyLoaded) {

      shareListener = db.doc("accounts/" + auth.currentUser.email).onSnapshot({
        // Listen for document metadata changes
        includeMetadataChanges: true
      }, action);
    }
  } else {
    console.log("not signed in");
  }
});

async function action() {
  await loadPanelsFromDatabase();
  initMedia();
  hasInitiallyLoaded = true;
}

function initMedia() {
  ownedSortableList = Sortable.create(ownedListEl, {
    animation: 150,
    filter: '.js-remove',
    onFilter: (evt) => {
      evt.item.parentNode.removeChild(evt.item);
    }
  });
  sharedSortableList = Sortable.create(sharedListEl, {
    animation: 150,
    filter: '.js-remove',
    onFilter: (evt) => {
      evt.item.parentNode.removeChild(evt.item);
    }
  });
}

async function loadPanelsFromDatabase() {
  ownedList = sharedList = [];
  const ref = await db.doc("accounts/" + auth.currentUser.email).get();
  if (ref.exists) {
    const data = ref.data();
    panelCount = data.owned.length;
    maxPanels = data.maxPanels;
    const owned_ = data.owned;
    const shared_ = data.shared;

    console.log(owned_.length);

    ownedListEl = document.createElement("ul");
    sharedListEl = document.createElement("ul");

    let ownedPromises = sharedPromises = [];
    for (let i = 0; i < owned_.length; i++) {
      ownedPromises.push(new Promise(async (resolve, reject) => {
        let ownedRef = await db.doc("panels/" + owned_[i]).get();
        let gimmeLi = document.createElement("li");
        gimmeLi.style.display = "inline-block";
        gimmeLi.appendChild(new Panel({
          title: ownedRef.data().title,
          owner: ownedRef.data().owner,
          pid: owned_[i]
        }).el);
        ownedListEl.appendChild(gimmeLi);
        resolve();
      }));
    }
    for (let i = 0; i < shared_.length; i++) {
      sharedPromises.push(new Promise(async (resolve, reject) => {
        let sharedRef = await db.doc("panels/" + shared_[i]).get();
        let gimmeLi = document.createElement("li");
        gimmeLi.style.display = "inline-block";
        gimmeLi.appendChild(new Panel({
          title: sharedRef.data().title,
          owner: sharedRef.data().owner,
          pid: shared_[i]
        }).el);
        sharedListEl.appendChild(gimmeLi);
        resolve();
      }));
    }

    await Promise.all(ownedPromises);
    await Promise.all(sharedPromises);

    let noneP = document.createElement("p");
    noneP.innerHTML = "none";
    ownedListEl.style.margin = 0;
    sharedListEl.style.margin = 0;
    ownedListEl.style.padding = 0;
    sharedListEl.style.padding = 0;

    let ownedCont = document.getElementById("owned-panels");
    let sharedCont = document.getElementById("shared-panels");
    ownedCont.innerHTML =  sharedCont.innerHTML = "";
    if (owned_.length > 0) ownedCont.appendChild(ownedListEl);
    else ownedCont.appendChild(noneP);
    if (shared_.length > 0) sharedCont.appendChild(sharedListEl);
    else sharedCont.appendChild(noneP);
    ownedCont.className = ownedCont.className.replace(/\bloader\b/g, "");
    sharedCont.className = sharedCont.className.replace(/\bloader\b/g, "");
    document.getElementById("panel-count").innerHTML = `panels: ${panelCount}/${maxPanels}`;
    if (panelCount >= maxPanels) document.getElementById("panel-count").style.color = "red";
  } else {
    throw Error(`Error showing data from ${auth.currentUser.email}`);
  }
}

function createNewPanel() {
  if (panelCount >= maxPanels) {
    Ply.dialog("confirm",
      "You have reached your maximum amount of panel real-estate. To solve this, delete an old one or purchase some new ones."
    );
    return;
  }
  Ply.dialog("prompt", {
    title: "Title Panel",
    form: {title: "title of panel"}
  }).done(async ui => {
    const key = rndKey();

    // create blank panel and render to screen
    await db.doc("panels/" + key).set({
      owner: auth.currentUser.email,
      title: ui.data.title,
      shared: [],
      stickies: JSON.stringify([])
    });

    const panelRef = await db.doc("panels/" + key).get();
    let gimmeLi = document.createElement("li");
    gimmeLi.style.display = "inline-block";
    gimmeLi.appendChild(new Panel({
      title: panelRef.data().title,
      owner: panelRef.data().owner,
      pid: key
    }).el);
    ownedSortableList.el.appendChild(gimmeLi);

    panelCount++;
    document.getElementById("panel-count").innerHTML = `panels: ${panelCount}/${maxPanels}`;
    if (panelCount >= maxPanels) document.getElementById("panel-count").style.color = "red";

    const ref = db.doc("accounts/" + auth.currentUser.email);
    db.runTransaction(transaction => {
      return transaction.get(ref).then(doc => {
        if (doc.exists) {
          let data = doc.data();
          data.owned.push(key);
          transaction.update(ref, data);
          return data;
        } else {
          return Promise.reject;
        }
      })
    }).then(() => console.log(`pushed ${key} to owned array`)).catch(err => console.error(error));
  });
}
