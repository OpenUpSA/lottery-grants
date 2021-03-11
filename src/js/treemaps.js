import $ from 'jquery';
import { d3 } from './d3';
import { formatAmount } from './utils';

const maxWidth = window.innerWidth > 767
  ? (window.innerWidth - 300 - 48 * 2)
  : window.innerWidth - 16 * 2;
const height = (window.innerHeight / 8);

export class Treemaps {
  constructor(containerSelector, data, filters, colors, overlay) {
    this.containerSelector = containerSelector;
    this.data = data;
    this.filters = filters;
    this.initialFilters = { ...filters };
    this.colors = colors;
    this.overlay = overlay;
    this.grantsCount = 0;
    this.grantsAmount = 0;
    this.tooltip = d3.select('body').append('div').attr('class', 'toolTip')
      .style('display', 'none')
      .style('position', 'absolute')
      .style('width', 'auto')
      .style('height', 'auto')
      .style('color', '#333')
      .style('background-color', 'white')
      .style('box-shadow', '-8px 8px 10px 0px')
      .style('border-radius', '0.25rem')
      .style('padding', '0.5rem');
    this.update();
  }

  clearFilters() {
    this.filters = { ...this.initialFilters };
    this.update();
  }

  update(filter, values) {
    this.grantsCount = 0;
    this.grantsAmount = 0;
    if (filter) {
      this.filters[filter] = values;
    }

    const data = {
      children: this.data.children
        .filter((year) => this.filters.year[year.year] === true)
        .sort((a, b) => {
          if (a.year < b.year) return 1;
          if (a.year > b.year) return -1;
          return 0;
        })
        .map((year) => ({
          year: year.year,
          children: year.children
            .filter((sector) => this.filters.sector[sector.Sector] === true)
            .map((sector) => ({
              Sector: sector.Sector,
              children: sector.children
                .filter((name) => {
                  const province = name.Province;
                  const beneficiary = name.Name;
                  // TODO: can be multiple provinces - how to filter?
                  const include = this.filters.Province[province] === true
                    && (!this.filters.Name || this.filters.Name[beneficiary] === true);
                  if (include) {
                    this.grantsCount += 1;
                    this.grantsAmount += name.Amount;
                  }
                  return include;
                }),
            })),
        })),
    };
    $('.current-info__selected').text(`Amount: ${formatAmount(this.grantsAmount)}\nCount: ${this.grantsCount}`);
    this.sums = {};
    data.children.forEach((year) => {
      this.sums[year.year] = year.children
        .reduce((acc, sector) => acc + sector.children
          .reduce((subacc, entity) => subacc + entity.Amount, 0), 0);
    });
    const max = Object.keys(this.sums).reduce((acc, year) => Math.max(acc, this.sums[year]), 0);
    const yearDivs = d3.select(this.containerSelector)
      .selectAll('div')
      .data(data.children);
    yearDivs.enter()
      .append('div')
      .merge(yearDivs)
      .attr('id', (d) => `year-${d.year}`)
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('margin-bottom', '1rem')
      .text((d) => d.year);
    yearDivs.exit()
      .remove();

    data.children.forEach((year) => {
      const width = (this.sums[year.year] / max) * maxWidth || 1;
      const root = d3.hierarchy(year).sum((d) => d.Amount);
      d3.treemap()
        .size([width, height])
        .padding(2)(root);
      d3.select(`#year-${year.year}`)
        .append('svg')
        .attr('id', `year-${year.year}-svg`)
        .attr('width', width || 0)
        .attr('height', height || 0);
      const charts = d3.select(`#year-${year.year}-svg`)
        .selectAll('rect')
        .data(root.leaves());
      charts.enter()
        .append('rect')
        .attr('x', (d) => d.x0)
        .attr('y', (d) => d.y0)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .style('fill', (d) => this.colors[d.parent.data.Sector])
        .on('mousemove', (evt, d) => {
          this.tooltip.style('left', `${evt.pageX + 10}px`);
          this.tooltip.style('top', `${evt.pageY}px`);
          this.tooltip.style('display', 'inline-block');
          this.tooltip.html(`${d.data.Name}<br>R${formatAmount(d.data.Amount)}`);
        })
        .on('mouseout', () => {
          this.tooltip.style('display', 'none');
        })
        .on('click', (evt, d) => {
          this.overlay.update(d.data.Name, d.data.Amount, d.data.ids);
        });
      charts.exit()
        .remove();
    });
  }
}
