export default class DoubleSlider {
  constructor(
    { min = 0, max = 100, formatValue = value => '$' + value,
      selected } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = {};
    this.selected.from = (selected?.from) ?? min;
    this.selected.to = (selected?.to) ?? max;
    this._prerender();
  }

  _computeStyle = (name, variable) => `${name}: ${Math.floor(variable * 100 / this.max)}%`;

  get left() { return this._computeStyle("left", this.selected.from);}
  get right() { return this._computeStyle("right", this.max - this.selected.to);}

  _prerender() {
    // render the HTML framework
    let sliderwrapper = document.createElement("div");
    sliderwrapper.innerHTML = 
    `<div class="range-slider">
      <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner">
            <span class="range-slider__progress" style="${this.left}; ${this.right}"></span>
            <span class="range-slider__thumb-left" data-bar="left" style="${this.left}"></span>
            <span class="range-slider__thumb-right" data-bar="right" style="${this.right}"></span>
        </div>
       <span data-element="to">${this.formatValue(this.selected.to)}</span>
     </div>`;


    
    // assign slider elements
    this.element = sliderwrapper.firstChild;
    this.fullBar = sliderwrapper.querySelector(".range-slider__inner");
    this.progressBar = sliderwrapper.querySelector(".range-slider__progress");
    this.leftThumb = sliderwrapper.querySelector(".range-slider__thumb-left");
    this.rightThumb = sliderwrapper.querySelector(".range-slider__thumb-right");
    this.leftBoundary = sliderwrapper.querySelector('span[data-element="from"]');
    this.rightBoundary = sliderwrapper.querySelector('span[data-element="to"]');
    
    // bind events
    this.leftThumb.onpointerdown = (event) => this._bindPointer(this, this.leftThumb, event);
    this.leftThumb.onpointermove = (event) => this._moveSlider(this, this.leftThumb, event);    
    this.leftThumb.onlostpointercapture = () => this._clearPointer(this, this.leftThumb, event);
    this.leftThumb.onpointerup = () => this._clearPointer(this, this.leftThumb, event);

    this.rightThumb.onpointerdown = (event) => this._bindPointer(this, this.rightThumb, event);
    this.rightThumb.onpointermove = (event) => this._moveSlider(this, this.rightThumb, event);
    this.rightThumb.onlostpointercapture = (event) => this._clearPointer(this, this.rightThumb, event);
    this.rightThumb.onpointerup = (event) => this._clearPointer(this, this.rightThumb, event);
  }

  _bindPointer(slider, elem, event) {
    event.preventDefault();
    if (event.pointerId == undefined) {
      // binding pointer is not possible, older browser or tests, defaulting to mouse events
      slider.shiftX = 0;  
      slider.legacyEventMode = true;
    } else {
      slider.shiftX = event.clientX - elem.getBoundingClientRect().left;
      elem.setPointerCapture(event.pointerId);
    }
    
  }

  _clearPointer(slider, elem, event) {
    slider.shiftX = null;
    slider.element.dispatchEvent(new CustomEvent("range-select", { bubbles: true, detals: this.selected}));
    if (slider.legacyEventMode) {
      slider.legacyEventMode = null;
    }
  }

  _moveSlider(slider, elem, event) {
    // only move slider if it was captured by click
    if (slider?.shiftX == undefined && slider.legacyEventMode == undefined) {
      return;
    }

    let newpos = (event.clientX - slider.shiftX) - slider.fullBar.getBoundingClientRect().left;
    if (newpos < 0) {
      newpos = 0;
    }
    if (newpos > slider.fullBar.offsetWidth) {
      newpos = slider.fullBar.offsetWidth;
    }
    let newval = Math.floor(slider.max * (newpos / slider.fullBar.offsetWidth));
    let oldvals = { from: slider.selected.from, to: slider.selected.to };

    switch (elem.dataset.bar) {
    case "left": slider.selected.from = Math.min(slider.selected.to, newval);
      break;
    case "right": slider.selected.to = Math.max(slider.selected.from, newval);
      break;
    }
    // only re-render if something changed
    if (oldvals.from != slider.selected.from || oldvals.to != slider.selected.to) {
      slider._render();
      console.log(oldvals, slider.selected);
    }

    // dealing with older mode
    if (slider.legacyEventMode) {
      slider.legacyEventMode = null;
      this._clearPointer(slider, elem, event);
    }
    
  }


  _render() {
    this.progressBar.style = `${this.left}; ${this.right}`;
    this.leftThumb.style = this.left;
    this.rightThumb.style = this.right;
    this.leftBoundary.textContent = this.formatValue(this.selected.from);
    this.rightBoundary.textContent = this.formatValue(this.selected.to);
  }

  destroy() {
    this?.element?.remove();
    this.element = null;
  }
}
