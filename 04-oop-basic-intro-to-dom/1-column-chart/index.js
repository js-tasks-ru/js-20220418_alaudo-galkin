export default class ColumnChart {

  chartHeight = 50;
  locale = "en-us";

  constructor({ data, label, value, link, formatHeading = data => `${data}`} = {}) {

    // initialize the values 
    this.data = data;
    this.label = label;
    this.value = value ;
    this.link = link ;
    this.formatHeading = formatHeading;

    // prepare component
    this._prerender();
    this._renderChart();

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

    const chart = wrapper.getElementsByClassName("column-chart__chart")[0];

    this.element = wrapper.firstElementChild;
    this.chart = chart;
  }

  _renderChart() {
    // prepare for rendering
    const data = this.data;
    const chart = this.chart;
    chart.innerHTML = "";

    this.element.classList.remove("column-chart_loading");

    if (data && data.length) {
      const max = Math.max(...data);
      const factor = this.chartHeight / max;
      const bars = data.map(d => `<div style="--value: ${Math.floor(d * factor)}" data-tooltip="${(d * 100 / max).toFixed(0)}%"></div>`).join("");
      chart.innerHTML = bars;
    } else {
      this.element.classList.add("column-chart_loading");
    }
    
    this.chart = chart;
  }

  update(newData) {
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