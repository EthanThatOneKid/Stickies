class Sticky {
  constructor(config) {
    this.inner = config.inner || "";
    this.color = config.color || "#fff";
    this.el = this.createElement();
  }
  createElement() {
    let div = document.createElement("div");
    div.style.backgroundColor = this.color;
    let p = document.createElement("p");
    p.innerHTML = this.inner;
    div.appendChild(p);
    return div;
  }
  data() {
    return {inner, color};
  }
}
