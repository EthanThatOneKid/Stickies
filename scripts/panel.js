class Panel {
  constructor(config) {
    this.title = config.title || config.pid || "";
    this.owner = config.owner || "";
    this.pid = config.pid || "";
    this.el = this.createElement();
  }
  createElement() {
    let a = document.createElement("a");
    a.href = `panel/?pid=${this.pid}`;

    let div = document.createElement("div");
    div.style.border = "solid 1px black";
    div.style.height = "200px";
    div.style.width = "200px";
    div.style.margin = "20px";
    div.style.overflow = "hidden";

    let title = document.createElement("h1");
    title.innerHTML = this.title;

    let owner = document.createElement("small");
    owner.innerHTML = `owner: ${this.owner}`;

    div.appendChild(title);
    div.appendChild(owner);
    a.appendChild(div);
    return a;
  }
}
