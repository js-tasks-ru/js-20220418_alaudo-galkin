export default class ColumnChart {

  constructor(settings) {
    this.initialize();
    Object.assign(this, settings);
    this.render();

    return this;
  }

  initialize() {
    this.chartHeight = 50;
    this.locale = "en-us";
    this.formatHeading = data => `${data}`;
  }

  get formattedValue() {
    return this.value?.toLocaleString(this.locale);  
  }

  elem(tag, props, text)
  {
    let doc = document.createElement(tag);
    if (props) {
      for (let p in props) {
        doc.setAttribute(p, props[p]);
      }
      if (text) {
        doc.append(document.createTextNode(text));
      }
      return doc;
    }
  }


  render() {

    const wrapper = document.createElement('div');
    wrapper.className = "column-chart";
    wrapper.style = `--chart-height:${this.chartHeight}`;

    const title = this.elem('div', { "class" : "column-chart__title"}, `Total ${this.label}`);
    const link = this.elem('a', { "href" : `/${this.label}`, "class" : "column-chart__link"}, null);
    link.innerHTML = "View all";
    title.append(link);

    wrapper.append(title);

    const container = this.elem('div', { "class" : "column-chart__container"}, null);
    container.append(this.elem('div', { "data-element" : "header", "class" : "column-chart__header"}, this.formatHeading(this.formattedValue)));

    let chart = this.elem('div', { 'data-element': "body", "class": "column-chart__chart" }, null);

    this.updateChart(wrapper, chart, this.data);
    container.append(chart);

    wrapper.append(container);

    this.element = wrapper;
    this.chart = chart;
  }

  updateChart(wrapper, chart, data) {
    if (data && data.length) {
      let max = Math.max(...data);
      let factor = this.chartHeight / max;
      for (let d of data) {
        chart.append(this.elem('div', { "style": `--value: ${Math.floor(d * factor)}`, "data-tooltip": `${(d * 100 / max).toFixed(0)}%` }, null));
      }
    } else {
      wrapper.className += " column-chart_loading";
    }
    return chart;
  }

  update(newData) {
    this.data = newData;
    this.chart.innerHTML = "";
    this.updateChart(this.wrapper, this.chart, this.data);
  }

  destroy() {
    this.data = null;
  }

  remove () {
    this.element = null;
  }

}