let ownedSortableList, sharedSortableList;
let ownedListEl, sharedListEl;
let ownedList, sharedList;
let hasInitiallyLoaded = false;


auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("user-lnk").innerHTML = auth.currentUser.displayName;
    document.getElementById("success-msg").style.display = "block";
    document.getElementById("failure-msg").style.display = "none";
    if (!hasInitiallyLoaded) {
      (async () => {
        await loadPanelsFromDatabase();
        initMedia();
        hasInitiallyLoaded = true;
      })();
    }
  } else {
    document.getElementById("success-msg").style.display = "none";
    document.getElementById("failure-msg").style.display = "block";
  }
});

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
  const ref = await db.doc("accounts/" + auth.currentUser.uid).get();
  if (ref.exists) {
    const data = ref.data();
    const owned_ = data.owned;
    const shared_ = data.shared;
    // GET DATA FOR THE PANEL USING THE pid ***********************************************************************************

    ownedListEl = document.createElement("ul");
    sharedListEl = document.createElement("ul")
    for (let i = 0; i < owned_.length; i++) {
      let gimmeLi = document.createElement("li");
      gimmeLi.style.display = "inline-block";
      gimmeLi.appendChild(new Panel({pid: owned_[i]}).el);
      ownedListEl.appendChild(gimmeLi);
    }
    for (let i = 0; i < shared_.length; i++) {
      let gimmeLi = document.createElement("li");
      gimmeLi.style.display = "inline-block";
      gimmeLi.appendChild(new Panel({pid: shared_[i]}).el);
      sharedListEl.appendChild(gimmeLi);
    }
    document.getElementById("owned-panels").appendChild(ownedListEl);
    document.getElementById("shared-panels").appendChild(sharedListEl);
  } else {
    throw Error(`Error showing data from ${auth.currentUser.uid}`);
  }
}

function createNewPanel() {
  Ply.dialog("prompt", {
    title: "Title Panel",
    form: {title: "title of panel"}
  }).done(async ui => {
    const key = rndKey();

    // create blank panel and render to screen
    await db.doc("panels/" + key).set({
      owner: auth.currentUser.uid,
      title: ui.data.title,
      shared: [],
      stickies: JSON.stringify([])
    });
    let gimmeLi = document.createElement("li");
    gimmeLi.style.display = "inline-block";
    ownedList.push(new Panel({pid: key}));
    gimmeLi.appendChild(ownedList[ownedList.length - 1].el);
    ownedSortableList.el.appendChild(gimmeLi);

    const ref = db.doc("accounts/" + auth.currentUser.uid);
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
