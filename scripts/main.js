let EDITABLE_LIST, STICKIES, QUILL, userID;
let canClick = true, currentChoice = -1;
let pid = getUrlVariables().pid;
let user_role = "bandit";


window.onload = init;

async function init() {
  await loadStickiesFromDatabase();

  if (user_role == "bandit") console.log("YOU SHOULDN'T BE HERE! SHOO!");
  else if (user_role == "shared") console.log("You have had this panel shared with you.");
  else if (user_role == "owner") console.log("You own this panel.");

  initList();

  QUILL = new Quill("#quill-txt-field", {theme: "snow"});
  QUILL.on("text-change", () => {
    let txt = QUILL.root.innerHTML;
    updateList(currentChoice, {
      "inner": txt
    });
  });

  document.getElementById("create-container").style.display = "none";
}

function chooseSticky() {
  let cont = document.getElementById("create-container");
  cont.style.display = "block";

  const sticky = STICKIES[currentChoice];

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
      let off = (was > is) ? 1 : 0;
      let moved = STICKIES[was];
      STICKIES.splice(was, 1);
      STICKIES.splice(is - off, 0, moved);
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
    let serializedStickies = data.stickies;
    let stickies_ = Object.values(JSON.parse(serializedStickies));
    for (let i = 0; i < stickies_.length; i++) {
      STICKIES.push(new Sticky(stickies_[i]));
    }
    if (data.owner == auth.currentUser.uid) user_role = "owner";
    else if (new Set(data.shared).has(auth.currentUser.uid)) user_role = "shared";
  } else {
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

function createErrorMessage(n) {
  const ERROR = {
    404: "This panel cannot be found."
  };
  document.getElementById("error-message-container").innerHTML = `${n}: ${ERROR[n]}`;
  document.getElementById("big-error-container").style.display = "block";
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
