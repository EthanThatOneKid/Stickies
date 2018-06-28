let EDITABLE_LIST, STICKIES, QUILL, userID;
let canClick = true, currentChoice = -1;
let pid = getUrlVariables().pid, panelTitle;
let user_role = "bandit";
let initialLoad = false;
let updateListener;

auth.onAuthStateChanged(user => {
  if (user) {
    if (!initialLoad) {
      (async () => {
        updateListener = db.doc("panels/" + pid).onSnapshot({
          includeMetadataChanges: true
        }, init);
      })();
    }
  } else {
    createErrorMessage(401);
  }
});

async function init() {
  await loadStickiesFromDatabase();
  console.log(STICKIES.length);
  if (user_role == "shared") console.log("You have had this panel shared with you.");
  else if (user_role == "owner") console.log("You own this panel.");

  initList();

  if (!initialLoad) {
    initialLoad = true;
    QUILL = new Quill("#quill-txt-field", {
      theme: "snow",
      placeholder: "jot down a note",
      bounds: document.getElementById("quill-container")
    });
    QUILL.on("text-change", () => {
      let txt = QUILL.root.innerHTML;
      updateList(currentChoice, {
        "inner": txt
      });
    });
  }

  document.getElementById("create-container").style.display = "none";
}

function chooseSticky() {
  let cont = document.getElementById("create-container");
  cont.style.display = "block";
  if (user_role !== "owner") document.getElementById("del-sticky-btn").style.disply = "none";

  const sticky = STICKIES[currentChoice].copy();

  let stickyCont = document.getElementById("large-sticky-container");
  stickyCont.innerHTML = "";
  let stickyEl = sticky.createElement("large");
  stickyEl.style.margin = "auto";
  stickyCont.appendChild(stickyEl);
  let col = sticky.color;
  document.getElementById("create-color").value = col;

  QUILL.root.innerHTML = sticky.inner;

  document.body.removeEventListener("mouseup", chooseSticky, true);
  setTimeout(() => {
    document.body.addEventListener("click", reset, true);
  }, 100);
}

function delSticky() {
  if (user_role == "owner") {
    reset({passive: true});
    STICKIES.splice(currentChoice, 1);
    EDITABLE_LIST.el.childNodes[currentChoice].remove();
  }
}

function reset(evt) {
  if (evt.passive || !hasParentWith(evt.target, "#show-ui")) {
    document.getElementById("create-container").style.display = "none";
    document.body.removeEventListener("click", reset, true);
    saveStickiesToDatabase();
  }
}

function initList() {
  let cont = document.getElementById("media-container");
  cont.innerHTML = "";
  LIST_EL = document.createElement("ul");
  for (let i = 0; i < STICKIES.length; i++) {
    let li = document.createElement("li");
    li.style.display = "inline-block";
    li.appendChild(STICKIES[i].el);
    LIST_EL.appendChild(li);
  }
  cont.appendChild(LIST_EL);

  EDITABLE_LIST = Sortable.create(LIST_EL, {
    animation: 150,
    filter: '.js-remove',
    onFilter: (evt) => {
      evt.item.parentNode.removeChild(evt.item);
    },
    onChoose: (evt) => {
      currentChoice = evt.oldIndex;
      document.body.addEventListener("mouseup", chooseSticky, true);
    },
    onStart: (evt) => {
      // start drag
    },
    onEnd: (evt) => {
      let was = evt.oldIndex;
      let is = evt.newIndex;
      let moved = STICKIES[was];
      STICKIES.splice(was, 1);
      STICKIES.splice(is, 0, moved);
      saveStickiesToDatabase();
  	}
  });
}

async function loadStickiesFromDatabase() {
  STICKIES = [];
  if (!pid) createErrorMessage(404);
  const ref = await db.doc("panels/" + pid).get();
  if (ref.exists) {
    let data = ref.data();
    panelTitle = data.title;
    document.getElementById("page-title").innerHTML = panelTitle;
    let serializedStickies = data.stickies;
    let stickies_ = Object.values(JSON.parse(serializedStickies));
    for (let i = 0; i < stickies_.length; i++) {
      STICKIES.push(new Sticky(stickies_[i]));
    }
    if (auth) {
      if (data.owner == auth.currentUser.email) user_role = "owner";
      else if (new Set(data.shared).has(auth.currentUser.email)) user_role = "shared";
      document.getElementById("user-settings").innerHTML = auth.currentUser.email[0].toUpperCase();
      document.getElementById("status-container").innerHTML = `role: ${user_role}`;
    }
  } else {
    createErrorMessage(404);
    throw Error(`No data exists for ${pid}`);
  }
}

async function saveStickiesToDatabase() {
  console.log("saving");
  let stickiesBatch = [];
  for (let i = 0; i < STICKIES.length; i++)
    stickiesBatch.push(STICKIES[i].data());
  const serializedStickies = JSON.stringify(stickiesBatch);

  const ref = db.doc("panels/" + pid);
  return db.runTransaction(transaction => {
    return transaction.get(ref).then(doc => {
      if (doc.exists) {
        let data = doc.data();
        data.stickies = serializedStickies;
        transaction.update(ref, data);
        return data;
      } else {
        return Promise.reject;
      }
    })
  }).then(() => console.log(`updated ${pid} panel`)).catch(err => console.error(error));
}

function updateList(i, data) {
  if (data.inner)
    STICKIES[i].inner = data.inner;
  if (data.color)
    STICKIES[i].color = data.color;
  let stickyCont = document.getElementById("large-sticky-container");
  stickyCont.innerHTML = "";
  let sticky = STICKIES[i].createElement("large");
  sticky.style.margin = "auto";
  stickyCont.appendChild(sticky);

  EDITABLE_LIST.el.childNodes[i].innerHTML = "";
  EDITABLE_LIST.el.childNodes[i].appendChild(STICKIES[i].createElement());
}

function createBlankSticky() {
  let sticky = new Sticky({
    inner: rndMsg(),
    color: "#FAEE76"
  });
  STICKIES.push(sticky);

  let li = document.createElement("li");
  li.style.display = "inline-block";
  li.appendChild(sticky.el);
  EDITABLE_LIST.el.appendChild(li);

  currentChoice = STICKIES.length - 1;
  chooseSticky();
}

function getUrlVariables() {
  let query = window.location.search.substring(1);
  let vars = query.split('&'), result = {}, pair;
  for (let i = 0; i < vars.length; i++) {
    pair = vars[i].split('=');
    result[pair[0]] = pair[1];
  }
  return result;
}

function deletePanel() {
  Ply.dialog("confirm",
    (user_role == "owner") ? "Are you sure you want to delete this entire panel? (It will not be archived; it will be forever gone)" : "Are you sure you want to remove this panel from your shared list?"
  ).done(async ui => {
    if (user_role == "owner") {
      // remove doc from panels/pid
      await db.doc("panels/" + pid).delete()
        .then(() => console.log("Deleted " + pid))
        .catch((err) => console.error(err));

      // remove from owned[]
      const ref = db.doc("accounts/" + auth.currentUser.email);
      await db.runTransaction(transaction => {
        return transaction.get(ref).then(doc => {
          if (doc.exists) {
            let data = doc.data();
            let panelIndex = data.owned.indexOf(pid);
            if (panelIndex > -1) data.owned.splice(panelIndex, 1);
            transaction.update(ref, data);
            return data;
          } else {
            return Promise.reject;
          }
        })
      }).then(() => {
        // panel has been perma-deleted
        console.log(`deleted ${pid}`);
        window.location.href = "../";
      }).catch(err => {
        // panel fails to be deleted
        console.error(err);
      });
    } else if (user_role == "shared") {
      // remove from shared array
      const ref = db.doc("accounts/" + auth.currentUser.email);
      await db.runTransaction(transaction => {
        return transaction.get(ref).then(doc => {
          if (doc.exists) {
            let data = doc.data();
            let panelIndex = data.shared.indexOf(pid);
            if (panelIndex > -1) data.shared.splice(panelIndex, 1);
            transaction.update(ref, data);
            return data;
          } else {
            return Promise.reject;
          }
        })
      }).then(() => {
        // panel has been perma-deleted
        console.log(`removed ${pid} from shared list`);
      }).catch(err => {
        // panel fails to be deleted
        console.error(err);
      });
    }
  });
}

function sharePanel() {
  Ply.dialog("prompt", {
    title: "Share this Panel",
    form: {email: "email of friend"}
  }).done(async ui => {
    const email = ui.data.email;

    // adding panel to friend's shared list
    const friendRef = db.doc("accounts/" + email);
    await db.runTransaction(transaction => {
      return transaction.get(friendRef).then(doc => {
        if (doc.exists) {
          let data = doc.data();
          data.shared.push(pid);
          data.shared = data.shared.filter((el, i, a) => i === a.indexOf(el));
          console.log(data);
          transaction.update(friendRef, data);
          return data;
        } else {
          return Promise.reject;
        }
      })
    }).then(() => {
      // panel has been shared
      console.log(`pushed panel to ${email}\'s shared array.`);
    }).catch(err => {
      // user does not exist
      console.error(err);
    });

    // adding friend's email to panel's shared list
    const panelRef = db.doc("panels/" + pid);
    await db.runTransaction(transaction => {
      return transaction.get(panelRef).then(doc => {
        if (doc.exists) {
          let data = doc.data();
          data.shared.push(email);
          transaction.update(panelRef, data);
          return data;
        } else {
          return Promise.reject;
        }
      })
    }).then(() => {
      // panel has been shared
      console.log(`pushed ${email} to shared array`);
    }).catch(err => {
      // user does not exist
      console.error(err);
    });
  });
}

function createErrorMessage(n) {
  const ERROR = {
    401: "You are unauthorized to view this panel",
    404: "This panel cannot be found."
  };
  document.getElementById("error-message-container").innerHTML = `${n}: ${ERROR[n]}`;
  document.getElementById("big-error-container").style.display = "block";
}

function renamePanel() {
  if (user_role == "owner") {
    Ply.dialog("prompt", {
      title: "Rename this Panel",
      form: {name: {label: "name this panel", value: panelTitle}}
    }).done(async ui => {
      panelTitle = ui.data.name;
      const panelRef = db.doc("panels/" + pid);
      await db.runTransaction(transaction => {
        return transaction.get(panelRef).then(doc => {
          if (doc.exists) {
            let data = doc.data();
            data.title = panelTitle;
            transaction.update(panelRef, data);
            return data;
          } else {
            return Promise.reject;
          }
        })
      }).then(() => {
        // panel has been shared
        document.getElementById("page-title").innerHTML = panelTitle;
        console.log(`renamed ${pid} to ${panelTitle}`);
      }).catch(err => {
        // user does not exist
        console.error(err);
      });
    });
  }
};

function organizeStickiesByColor() {
  STICKIES.sort((a, b) => {
    let colorA = new Color(a.color.split("#")[1]);
    let colorB = new Color(b.color.split("#")[1]);
    return colorA.hue - colorB.hue;
  });
  reset({passive: true});
}

function rndMsg() {
  let msgs = [
    "How are you enjoying Stickies?",
    "You are so cool!",
    "You\'re just amazing!",
    "Thank you for using Stickies!",
    "You are a GOAT; Greatest of all time!",
    "How\'s your day?",
    "I bet you're making all sorts of progress today!"
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// USEFUL FUNCTION FOR REUSE
// FINDS OUT IF THE EL GIVEN OR ANY PARENT ELS IS A CERTAIN CLASS OR ID
function hasParentWith(el, flags) {
  if (el.matches("#show-ui")) return true;
  else if (el.parentElement) return hasParentWith(el.parentElement, flags);
  else return false;
}
