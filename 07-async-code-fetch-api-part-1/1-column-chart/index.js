import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

    chartHeight = 50;
    locale = "en-us";
  
    constructor({ url, range, data, label, value, link, formatHeading = data => `${data}`} = {}) {
  
      // initialize the values 
      this.data = data;
      this.label = label;
      this.value = value ;
      this.link = link ;
      this.url = url;
      this.formatHeading = formatHeading;
  
      // prepare component
      this._prerender();
      this._renderChart();

      if (!(data && data.length) && (url && range)) {
        setTimeout(() => this.load(range), 0);
      }
  
      return this;
    }
  
  
    get formattedValue() {
      return this.value?.toLocaleString(this.locale);  
    }
  
    _prerender() {
  
      // initialize top element
      const wrapper = document.createElement('div');
  
      wrapper.className = "column-chart";
      wrapper.style = `--chart-height:${this.chartHeight}`;
  
      wrapper.innerHTML = `
      <div class="column-chart" style="--chart-height:${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : ""}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.formatHeading(this.formattedValue)}
          </div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
      `;
  
      const chart = wrapper.querySelector("[data-element='body']");
      const header = wrapper.querySelector("[data-element='header']");
  
      this.element = wrapper.firstElementChild;

      this.subElements = {};
      this.subElements.header = header;
      this.subElements.body = chart;
    }
  
    _renderChart() {
      // prepare for rendering
      const data = this.data;
      const chart = this.subElements.body;
      const header = this.subElements.header;
      chart.innerHTML = "";
  
      if (data && Object.entries(data).length) {
        this.element.classList.remove("column-chart_loading");
        const dataarray = Object.entries(data);
        const valuesX = dataarray.map(v => v[0]);
        const valuesY = dataarray.map(v => v[1]);
        const max = Math.max(...valuesY);
        const factor = this.chartHeight / max;
        const bars = dataarray.map(d => `<div style="--value: ${Math.floor(d[1] * factor)}" data-tooltip="<div><small>${new Date(Date.parse(d[0])).toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric"})}</small></div><strong>${d[1]}</strong>"></div>`).join("");
        
        // compute new total
        this.value = valuesY.reduce( (a,b) => a + b);
        chart.innerHTML = bars;
        header.textContent = this.formatHeading(this.formattedValue);

      } else {
        this.element.classList.add("column-chart_loading");
      }
      
      this.chart = chart;
    }

    async update(from, to) {
      return await this.load({ from: from, to: to});
    }

    async load(range) {
      this.range = range;
      // show loading indicator
      this.element.classList.add("column-chart_loading");
      // invalidate current data
      this.data = undefined;
      this.value = undefined;

      // transform range into URL parameters
      let requestUrl = Object
        .entries(range)
        .reduce(
          (URL, [param, value]) => 
          { 
            URL.searchParams.set(param, value.toISOString());
            return URL;
          },
          new URL(this.url, BACKEND_URL));

      // fetch data from server
      let data = await fetchJson(requestUrl);
      this.show(data);
      return data;
    }
  
    show(newData) {
      this.data = newData;
      this._renderChart();
    }
  
    destroy() {
      this.data = null;
      this.remove();
    }
  
    remove() {
      this.element?.remove();
      this.element = null;
    }
  
}
