class Panel {
  constructor(config) {
    this.title = config.title || config.pid || "";
    this.owner = config.owner || "";
    this.pid = config.pid || "";
    this.el = this.createElement();
  }
  createElement() {
    let div = document.createElement("div");
    div.style.border = "solid 1px black";
    div.style.borderRadius = "2vw";
    div.style.height = "10vw";
    div.style.width = "5vw";
    div.style.overflow = "hidden";
    div.onclick = () => location.href = `panel/?pid=${this.pid}`;
    div.innerHTML = this.title;
    return div;
  }
}
