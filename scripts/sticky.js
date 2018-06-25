class Sticky {
  constructor(config) {
    this.inner = config.inner || "";
    this.color = config.color || "#fff";
    this.el = this.createElement();
  }
  createElement(config = "small") {
    let div = document.createElement("div");
    div.style.backgroundColor = this.color;
    div.style.margin = "10px";
    if (config == "small") {
      div.style.width = "10vw";
      div.style.height = "10vw";
    } else if (config == "large") {
      div.style.width = "30vw";
      div.style.height = "30vw";
    }
    div.style.border = "1px solid black";
    div.style.overflow = "hidden";
    let innerText = document.createElement("div");
    innerText.innerHTML = this.inner;
    innerText.style.margin = 0, innerText.style.padding = 0;
    innerText.querySelectorAll("p, h1, h2, h3").forEach(el => {
      el.style.margin = 0;
      el.style.padding = 0;
    });

    div.appendChild(innerText);
    return div;
  }
  data() {
    return {inner, color};
  }
}
