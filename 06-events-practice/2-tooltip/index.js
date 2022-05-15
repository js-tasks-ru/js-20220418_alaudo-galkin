class Tooltip {

  constructor() {
    if (Tooltip?.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize () {
    document.addEventListener("pointerover", this._showTooltip);
    document.addEventListener("pointerout", this._hideTooltip);
  }

  _showTooltip(event) {
    if (event.target.dataset.tooltip) {
      Tooltip.instance.render(event.target.dataset.tooltip, event.target);
    }
  }

  _hideTooltip() {
    Tooltip?.instance?.element?.remove();
  }

  render(text, elem) {
    // remove previous one if existed
    if (Tooltip?.instance) {
      this._hideTooltip();
    }

    // render new tooltip
    let tip = document.createElement("div");
    tip.innerHTML = `<div class="tooltip">${text}</div>`;
    this.element = tip.firstChild;
    
    // add element to the document
    document.body.append(this.element);

    // position the tooltip over the element
    if (elem) {
      let coords = elem.getBoundingClientRect();
      let left = coords.left + (elem.offsetWidth - this.element.offsetWidth) / 2;
      let top = coords.top + (elem.offsetHeight - this.element.offsetHeight) / 2;

      this.element.style.left = `${left}px`;
      this.element.style.top = `${top}px`;
    }
  }
  

  destroy () {
    this._hideTooltip();
    document.removeEventListener("pointerover", this._showTooltip);
    document.removeEventListener("pointerout", this._hideTooltip);
  }
}


export default Tooltip;
