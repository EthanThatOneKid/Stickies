let EDITABLE_LIST, STICKIES, CURRENT_CREATION, userID;

let test = [
  {
    inner: "Hello, my name is Gregory.",
    color: "#ddd"
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
      createNew(evt.oldIndex);
    },
    onEnd: function (evt) {
  		// after being sorted
  	}
  });
}

function reset() {
  console.log("resetting");
  for (let editor of document.getElementsByClassName("ql-toolbar")) {
    editor.remove();
  }
  //darkenScreen();
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

function createNew(i) {
  document.getElementById("create-container").innerHTML = "";
  let inner = EDITABLE_LIST.el.childNodes[i].innerHTML;
  let quill = new Quill("#create-container", {theme: "snow"});
  quill.on("text-change", () => {
    // update firebase for current slot
    // .set("accounts/" + userID + "/current", quill.root.innerHTML)
  });
  // CREATE A SUBMIT BUTTON AND TETHER IT TO 'quill.root.innerHTML'
}

function darkenScreen(show) {
  let el = document.getElementById("mask") || false;
  let darken = show || false;
  /*
  if (el && !darken) {
    console.log("removing darkness");
    el.remove();
  } else if (el && darken) {
    console.log("remaining dark");
    return;
  } else */if (!el) {
    console.log(show);
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
    showContainer.appendChild(show);
    mask.appendChild(showContainer);
    div.appendChild(mask);
    document.getElementsByTagName("body")[0].appendChild(div);
  }
}
