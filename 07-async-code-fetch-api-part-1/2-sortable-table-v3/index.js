import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  defaultTemplate = (data = [], field) => {
    return `<div class="sortable-table__cell">${data[0]?.[field]}</div>`;
  };

  subElements = {};

  constructor(headersConfig, {
    data = [],
    sorted = {},
    url
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.url = url;

    this._render();

    if (sorted) {
      this.sort(sorted.id, sorted.order);
    }
  }

  _render() {
    this._renderHeader();
    this._renderBody();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="sortable-table"> </div>`;
    this.element = wrapper.firstChild;
    this.element.append(this.subElements.header);
    this.element.append(this.subElements.body);
  }

  _renderHeader() {
    const headerRow = this.headerConfig.map(config =>
      `<div class="sortable-table__cell" data-id="${config.id}" data-sortable="${config.sortable}">
        <span>${config.title}</span>
      </div>`
    ).join("");
    
    const headerContainer = document.createElement("div");
    headerContainer.innerHTML = `<div data-element="header" class="sortable-table__header sortable-table__row">${headerRow}</div>`;

    headerContainer.firstChild.addEventListener("pointerdown", (event) => this._sortOnClick(event));

    this.subElements.header = headerContainer.firstChild;

  }

  _renderBody() {
    const bodyRows = this.data.map(data => {
      const cols = this.headerConfig.map(config =>
        `${(config?.template) ? config.template([data]) : this.defaultTemplate([data], config.id)}`
      ).join("");

      return `<a href="/products/${data.id}" class="sortable-table__row"> ${cols} </a>`;
    }
    ).join("");

    const bodyContainer = document.createElement("div");
    bodyContainer.innerHTML = `<div data-element="body" class="sortable-table__body">${bodyRows}</div>`;
    this.subElements.body = bodyContainer.firstChild;
  }

  _sortOnClick(event) {
    event.preventDefault(); // disable text selection
    
    let headerColumn = event.target.closest("[data-id]");
    if (headerColumn && headerColumn.dataset?.sortable == "true") {
      this.sort(headerColumn.dataset.id, 
        (headerColumn.dataset?.order ?? "desc") == "desc" ? "asc" : "desc"
      );
    }
  }

  sortOnClient (id, order) {

  }

  sortOnServer (id, order) {

  }

  sort (field, sorting) {
    
    function sortStrings(arr, column = 0, param = 'asc') {
      return [...arr].sort((a, b) => (param == 'asc' ? 1 : -1) * a.children[column].textContent.localeCompare(b.children[column].textContent, ["ru", "en"], { caseFirst: "upper"}));
    }

    function sortNumbers(arr, column = 0, param = 'asc') {
      return [...arr].sort((a, b) => (param == 'asc' ? 1 : -1) * ((+a.children[column].textContent) > (+b.children[column].textContent) ? 1 : -1));
    }

    // check for proper field
    if (!this.headerConfig.some(config => config.id == field)) {
      throw new Error(`${field} does not belong to the table`);
    }
    // check for valid sorting types
    if (!(["asc", "desc"].includes(sorting))) {
      throw new Error(`${sorting} type is unknown`);
    }

    // get the header data
    const columnIndex = this.headerConfig.findIndex(config => config.id == field);
    const columnConfig = this.headerConfig[columnIndex];

    if (!columnConfig.sortable) {
      throw new Error(`Column ${field} is not sortable`);
    }

    // change header
    // remove data-order attribute
    this.subElements.header.querySelectorAll("[data-order]").forEach(elem => elem.removeAttribute("data-order"));
    this.subElements.header.querySelectorAll(".sortable-table__sort-arrow").forEach(elem => elem.remove());
    
    this.subElements.header.children[columnIndex].dataset.order = sorting;
    this.subElements.header.children[columnIndex].insertAdjacentHTML("beforeend", `<span data-element="arrow" class="sortable-table__sort-arrow"> <span class="sort-arrow"></span> </span>`);
    

    // sort values
    const sorted = ((columnConfig.sortType == 'string') ? sortStrings : sortNumbers) (this.subElements.body.children, columnIndex, sorting);
    sorted.forEach(node => this.subElements.body.append(node));     
  }

  remove () {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }

}

