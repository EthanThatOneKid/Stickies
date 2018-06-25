let EDITABLE_LIST, STICKIES, CURRENT_CREATION, QUILL, userID;
let canClick = true, currentChoice = -1;

let test = [
  {
    inner: "Hello, my name is Gregory.",
    color: "#bbb"
  },
  {
    inner: "Hello, my name is Ethan.",
    color: "#fff"
  }
];

window.onload = init;

async function init() {
  await loadStickiesFromDatabase();
  initList();

  QUILL = new Quill("#quill-txt-field", {theme: "snow"});
  QUILL.on("text-change", () => {
    let txt = QUILL.root.innerHTML;

    updateList(currentChoice, {
      "inner": txt
    });
    // update firebase for current slot
    // .set("accounts/" + userID + "/current", quill.root.innerHTML)
  });

  document.getElementById("create-container").style.display = "none";
}

function chooseSticky() {
  let cont = document.getElementById("create-container");
  cont.style.display = "block";

  let stickyCont = document.getElementById("large-sticky-container");
  stickyCont.innerHTML = "";
  let sticky = STICKIES[currentChoice].createElement("large");
  sticky.style.margin = "auto";
  stickyCont.appendChild(sticky);

  QUILL.root.innerHTML = STICKIES[currentChoice].inner;

  document.body.removeEventListener("mouseup", chooseSticky, true);
  setTimeout(() => {
    document.body.addEventListener("click", reset, true);
  }, 100);
}

function reset(evt) {
  if (!hasParentWith(evt.target, "#show-ui")) {
    document.getElementById("create-container").style.display = "none";
    document.body.removeEventListener("click", reset, true);
  }
}

function initList() {
  let cont = document.getElementById("media-container");
  cont.innerHTML = "";
  LIST_EL = document.createElement("ul");
  for (let i = 0; i < STICKIES.length; i++) {
    let sticky = new Sticky(test[i]);
    let li = document.createElement("li");
    li.style.display = "inline-block";
    li.appendChild(sticky.createElement());
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
  	}
  });
}

async function loadStickiesFromDatabase() {
  STICKIES = [];
  const ref = await test; // db.doc("accounts/" + user_id).get();
  if (ref) {//ref.exists) {
    const data = test; // ref.data();
    let stickies = test // Object.values(Object.parse(data.stickies));
    for (let i = 0; i < stickies.length; i++) {
      STICKIES.push(new Sticky(stickies[i]));
    }
    CURRENT_CREATION = data.curr;
  } else {
    throw Error("No data exists for ${userID}");
  }
}

async function authorizeVisit() {
  userID = "xxxxxxxxxxxxxxxxxxx";
}

function readSticky(i) {
  let div = document.getElementById("create-container");
  div.innerHTML = "";
  let sticky = STICKIES[i].createElement();
}

function darkenScreen(show) {
  let dark = (document.getElementById("mask")) ? true : false;
  if (!show) {
    if (dark)
      document.getElementById("mask").remove();
    return;
  }
  if (!dark) {
    let div = document.createElement("div");
    div.id = "mask";
    div.style.background = "white";
    // ***
    let mask = document.createElement("div");
    mask.style.position = "absolute";
    mask.style.top = 0, mask.style.bottom = 0, mask.style.left = 0, mask.style.right = 0;
    mask.style.background = "rgba(0, 0, 0, 0.8)";
    mask.style.zIndex = "99";
    // ***
    let showContainer = document.createElement("div");
    showContainer.style.position = "relative";
    showContainer.style.zIndex = "100";
    showContainer.style.margin = 0;
    showContainer.style.top = "50%";
    showContainer.style.left = "50%";
    showContainer.style.transform = "translate(-50%, -50%)";
    // ***
    show.style.margin = "auto";
    showContainer.appendChild(show);
    mask.appendChild(showContainer);
    div.appendChild(mask);
    document.getElementsByTagName("body")[0].appendChild(div);

    setTimeout(() => {
      document.body.addEventListener("click", reset, true);
    }, 100);
  }
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

// USEFUL FUNCTION FOR REUSE
// FINDS OUT IF THE EL GIVEN OR ANY PARENT ELS IS A CERTAIN CLASS OR ID
function hasParentWith(el, flags) {
  if (el.matches("#show-ui")) return true;
  else if (el.parentElement) return hasParentWith(el.parentElement, flags);
  else return false;
}
