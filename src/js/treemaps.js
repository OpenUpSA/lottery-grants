import $ from 'jquery';
import { d3 } from './d3';
import { formatAmount } from './utils';

const LOADING_SELECTOR = '.vis-loading';
const COUNT_SELECTOR = '.current-info__showing';
const AMOUNT_SELECTOR = '.current-info__total-value';
const DOWNLOAD_ACTION_SELECTOR = '.download-selected';

const TREEMAP_ID = 'treemap1';

const $loadingEl = $(LOADING_SELECTOR);
const $count = $(COUNT_SELECTOR);
const $amount = $(AMOUNT_SELECTOR);

const maxWidth = window.innerWidth > 767
  ? (window.innerWidth - 300 - 48 * 2)
  : window.innerWidth - 16 * 2;
const height = (window.innerHeight / 8);

export class Treemaps {
  constructor($parent, data, lookup, filters, colors, overlay) {
    $parent.append(`<div id="${TREEMAP_ID}"></div>`);
    this._data = data;
    this._filteredData = data;
    this._lookup = lookup;
    this._filters = filters;
    this._colors = colors;
    this._overlay = overlay;
    this._grantsCount = 0;
    this._grantsAmount = 0;
    this._tooltip = d3.select('body').append('div').attr('class', 'toolTip')
      .style('z-index', 99)
      .style('display', 'none')
      .style('position', 'absolute')
      .style('width', 'auto')
      .style('height', 'auto')
      .style('color', '#333')
      .style('background-color', 'white')
      .style('box-shadow', '-8px 8px 10px 0px')
      .style('border-radius', '0.25rem')
      .style('padding', '0.5rem');
    $(DOWNLOAD_ACTION_SELECTOR).on('click', this.downloadFiltered.bind(this));
    this.update();
  }

  clearFilters() {
    Object.keys(this._filters).forEach((filter) => {
      Object.keys(this._filters[filter]).forEach((key) => {
        this._filters[filter][key] = true;
      });
    });
    this.update();
  }

  downloadFiltered() {
    const rows = [
      ['year', 'sector', 'name', 'id', 'province', 'amount'],
    ];
    this._filteredData.children.forEach((yearNode) => {
      yearNode.children.forEach((sectorNode) => {
        sectorNode.children.forEach((nameNode) => {
          nameNode.ids.forEach((id) => {
            const grant = this._lookup[id];
            if (grant.year !== yearNode.year) {
              alert(`Data issue - treemap year ${yearNode.year} and data year ${grant.year} different!`);
            }
            if (grant.Sector !== sectorNode.Sector) {
              alert(`Data issue - treemap sector ${sectorNode.Sector} and data sector ${grant.Sector} different!`);
            }
            if (grant.Name !== nameNode.Name) {
              alert(`Data issue - treemap name ${nameNode.Name} and data name ${grant.Name} different!`);
            }
            rows.push([
              grant.year, `"${grant.Sector}"`, `"${grant.Name}"`, id, grant.Province, grant.Amount,
            ]);
          });
        });
      });
    });
    const csvData = rows.map((row) => row.join(',')).join('\n');
    const csvBlob = new Blob([csvData], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    window.open(csvUrl);
  }

  update(filter, values) {
    $count.text('Loading...');
    $amount.text('Calculating...');
    $loadingEl.show();
    setTimeout(() => this._update(filter, values), 1);
  }

  _update(filter, values) {
    this._grantsCount = 0;
    this._grantsAmount = 0;
    if (filter) {
      this._filters[filter] = values;
    }

    this._filteredData = {
      children: this._data.children
        .filter((year) => this._filters.year[year.year] === true)
        .sort((a, b) => {
          if (a.year < b.year) return 1;
          if (a.year > b.year) return -1;
          return 0;
        })
        .map((year) => ({
          year: year.year,
          children: year.children
            .filter((sector) => this._filters.sector[sector.Sector] === true)
            .map((sector) => ({
              Sector: sector.Sector,
              children: sector.children
                .filter((name) => {
                  const beneficiary = name.Name;
                  const provinceAll = Object.keys(this._filters.Province)
                    .reduce((all, curr) => all && this._filters.Province[curr], true);
                  const grantIds = provinceAll ? name.ids : name.ids
                    .filter((id) => this._filters.Province[this._lookup[id].Province] === true);
                  const include = grantIds.length
                    && (!this._filters.Name || this._filters.Name[beneficiary] === true);
                  if (include) {
                    this._grantsCount += 1;
                    this._grantsAmount += name.Amount;
                  }
                  return include;
                }),
            })),
        })),
    };
    $count.text(this._grantsCount);
    $amount.text(formatAmount(this._grantsAmount));
    this.sums = {};
    this._filteredData.children.forEach((year) => {
      this.sums[year.year] = year.children
        .reduce((acc, sector) => acc + sector.children
          .reduce((subacc, entity) => subacc + entity.Amount, 0), 0);
    });
    const max = Object.keys(this.sums).reduce((acc, year) => Math.max(acc, this.sums[year]), 0);
    const yearDivs = d3.select(`#${TREEMAP_ID}`)
      .selectAll('div')
      .data(this._filteredData.children);
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

    this._filteredData.children.forEach((year) => {
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
        .style('fill', (d) => this._colors[d.parent.data.Sector])
        .on('mousemove', (evt, d) => {
          this._tooltip.style('left', `${evt.pageX + 10}px`);
          this._tooltip.style('top', `${evt.pageY}px`);
          this._tooltip.style('display', 'inline-block');
          this._tooltip.html(`${d.data.Name}<br>R${formatAmount(d.data.Amount)}`);
        })
        .on('mouseout', () => {
          this._tooltip.style('display', 'none');
        })
        .on('click', (evt, d) => {
          this._overlay.update(d.data.Name, d.data.ids);
        });
      charts.exit()
        .remove();
      $loadingEl.hide();
    });
  }
}
