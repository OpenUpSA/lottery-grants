import $ from 'jquery';
import { d3 } from './d3';
import { formatAmount } from './utils';

export class Overlay {
  constructor(containerSelector, data) {
    this.$container = $(containerSelector);
    this.data = data;
  }

  update(name, anount, ids) {
    this.$container.find('.heading').text(name);
    const data = ids.map((id) => this.data[id]);
    const count = ids.length;
    const amount = data.reduce((total, current) => total + Number(current.Amount), 0);
    $('.beneficiary-info__wrapper').text(`Amount: ${formatAmount(amount)}\nCount: ${count}`);
    const divs = d3.select('.beneficiary-chart')
      .selectAll('div')
      .data(data);
    divs.enter()
      .append('div')
      .merge(divs)
      .text((d) => `Amount: ${formatAmount(d.Amount)} | Project number: ${d['Project Number']}`);
    divs.exit()
      .remove();
  }
}
