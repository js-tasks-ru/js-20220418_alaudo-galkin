import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  defaultTemplate = (data) => {
    return `<div class="sortable-table__cell">${data}</div>`;
  };
  element;
  subElements = {};

  data = [];
  loading = false;
  offset = 0;
  pagesize = 20;
  loading = false; // to avoid multiple loads

  onSortClick = event => {
    event.preventDefault(); // disable text selection

    const headerColumn = event.target.closest("[data-id]");
    if (headerColumn && headerColumn.dataset?.sortable == "true") {
      const id = headerColumn.dataset.id;
      const order = (headerColumn.dataset?.order ?? "asc") == "desc" ? "asc" : "desc";
      if (this.isSortLocally) { // no URL provided, sort all locally
        this.sortOnClient(id, order);
      } else { // URL exists, lets sort on server
        this.sortOnServer(id, order);
      }
      this.updateHeader(id, order);
    }
  }

  onScrollLoad = async () => {
    const clientBottom = document.documentElement.getBoundingClientRect().bottom;
    const clientHeight = document.documentElement.clientHeight;
    // console.log(clientBottom, clientHeight, clientBottom - clientHeight);
    if (clientBottom - clientHeight < 100 && !this.loading && !this.isSortLocally) {
      this.loading = true;
      this.offset += this.pagesize; // reset the offset
      const {id, order} = this.sorted;
      this.data = await this._fetchData(id, order);
      this._renderBody();
      this.element.append(this.subElements.body);  
      this.loading = false;  
    }
  }

  constructor(headers, {
    data = [],
    sorted = {
      id : headers.find(header => header.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    url = ''
  } = {}) {
    // assign all fields and variables
    this.headerConfig = headers;
    this.url = url;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    // add scrolling event
    window.addEventListener("scroll", this.onScrollLoad);

    // create wrapper
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="sortable-table"> </div>`;
    
    this.element = wrapper.firstChild;
    // render the component
    this.render();
  }

  async render() {
    const {id, order } = this.sorted;

    this._renderHeader();

    this.data = await this._fetchData(id, order);

    this._renderBody();
 

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

    headerContainer.firstChild.addEventListener("pointerdown", this.onSortClick);

    this.subElements.header = headerContainer.firstChild;

  }

  _renderBody() {
    const bodyRows = this.data.map(data => {
      const cols = this.headerConfig.map(config =>
        `${(config?.template) ? config.template(data[config.id]) : this.defaultTemplate(data[config.id])}`
      ).join("");

      return `<a href="/products/${data.id}" class="sortable-table__row"> ${cols} </a>`;
    }
    ).join("");

    const bodyContainer = document.createElement("div");
    bodyContainer.innerHTML = `<div data-element="body" class="sortable-table__body">${bodyRows}</div>`;
    this.subElements.body = bodyContainer.firstChild;
  }

  sortOnClient (id, order) {
    this.sort(id, order);
  }

  async sortOnServer (id, order) {
    // create URL for data request
    this.offset = 0; // reset the offset
    this.data = await this._fetchData(id, order);
    this.subElements.body.remove();
    this._renderBody();
    this.element.append(this.subElements.body);
  }

  async _fetchData(id, order) {
    let url = this._constructUrl(id, order, this.offset, this.offset + this.pagesize);
    let data = await fetchJson(url.toString());
    return data;
  }

  _constructUrl(id, order, start, end) {
    let url = new URL(this.url, BACKEND_URL);
    url.searchParams.set("_sort", id);
    url.searchParams.set("_order", order);
    url.searchParams.set("_start", start);
    url.searchParams.set("_end", end);
    return url;
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

    // sort values
    const sorted = ((columnConfig.sortType == 'string') ? sortStrings : sortNumbers) (this.subElements.body.children, columnIndex, sorting);
    sorted.forEach(node => this.subElements.body.append(node));     
  }

  updateHeader(field, sorting) {

    const columnIndex = this.headerConfig.findIndex(config => config.id == field);
    this.subElements.header.querySelectorAll("[data-order]").forEach(elem => elem.removeAttribute("data-order"));
    this.subElements.header.querySelectorAll(".sortable-table__sort-arrow").forEach(elem => elem.remove());

    this.subElements.header.children[columnIndex].dataset.order = sorting;
    this.subElements.header.children[columnIndex].insertAdjacentHTML("beforeend", `<span data-element="arrow" class="sortable-table__sort-arrow"> <span class="sort-arrow"></span> </span>`);
    this.sorted.id = field;
    this.sorted.order = sorting;
  }

  remove () {
    window.removeEventListener("scroll", this.onScrollLoad);
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }

}

