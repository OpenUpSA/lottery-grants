import $ from 'jquery';
import { FilterSelectOption } from './filter-select-option';
import { Pill } from './pill';

const PILL_CONTAINER_SELECTOR = '.filter-current-list';
const $pillContainer = $(PILL_CONTAINER_SELECTOR).empty().show();

export class FilterSearchSelect {
  constructor($parent, name, ascending, callback) {
    this._$parent = $parent;
    this._name = name;
    this._filter = null;
    this._ascending = ascending;
    this._callback = callback;
    this._selected = [];
    this.render();
  }

  render() {
    this._$parent.empty();
    const factor = this._ascending ? 1 : -1;
    $pillContainer.empty();
    this._selected
      .forEach((value) => {
        new FilterSelectOption(
          this._$parent,
          value,
          true,
          this.applyFilter.bind(this),
        );
        new Pill($pillContainer, value, this.applyFilter.bind(this));
      });
    this.unselectedChildren = this.unselected ? this.unselected
      .filter((value) => !(this._selected.includes(value)))
      .sort((a, b) => {
        if (a > b) return factor;
        if (a < b) return factor * -1;
        return 0;
      })
      .map((value) => new FilterSelectOption(
        this._$parent,
        value,
        this._selected.length ? this._filter[value] : null,
        this.applyFilter.bind(this),
      )) : [];
  }

  search(keys) {
    this.unselected = keys.slice(0, 30);
    // subtract already selected ones?
    this.render();
  }

  applyFilter(value, include) {
    this._filter = this._filter || {};
    this._filter[value] = include;
    this._selected = Object.keys(this._filter).filter((key) => this._filter[key]);
    this._filter = this._selected.length ? this._selected
      .reduce((obj, val) => ({
        ...obj, [val]: true,
      }), {}) : null;
    this.render();
    this._callback(this._name, this._filter);
  }
}
