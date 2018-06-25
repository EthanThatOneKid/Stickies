let EDITABLE_LIST, STICKIES, CURRENT_CREATION, QUILL, userID;

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
  LIST_EL = document.createElement("ul");
  for (let i = 0; i < STICKIES.length; i++) {
    let sticky = new Sticky(test[i]);
    let li = document.createElement("li");
    li.style.display = "inline-block";
    li.appendChild(sticky.createElement());
    LIST_EL.appendChild(li);
  }
  document.getElementById("media-container").appendChild(LIST_EL);

  EDITABLE_LIST = Sortable.create(LIST_EL, {
    animation: 150,
    filter: '.js-remove',
    onFilter: function(evt) {
      evt.item.parentNode.removeChild(evt.item);
    },
    onChoose: function(evt) {
      reset();
      darkenScreen(STICKIES[evt.oldIndex].el);
      document.getElementById("quill-container").style.display = "block";
    },
    onEnd: function(evt) {
      // after drag
  	}
  });

  QUILL = new Quill("#quill-txt-field", {theme: "snow"});
  QUILL.on("text-change", () => {
    // update firebase for current slot
    // .set("accounts/" + userID + "/current", quill.root.innerHTML)
  });
  document.getElementById("quill-container").style.display = "none";
}

function reset() {
  document.getElementById("quill-container").style.display = "none";
  darkenScreen(false);
  document.body.removeEventListener("mousedown", reset, true);
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
      document.body.addEventListener("mousedown", reset, true);
    }, 500);
  }
}
