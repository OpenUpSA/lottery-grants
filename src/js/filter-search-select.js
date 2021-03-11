import { FilterSelectOption } from './filter-select-option';

export class FilterSearchSelect {
  constructor($container, name, ascending, callback) {
    this.$container = $container;
    this.name = name;
    this.filter = null;
    this.ascending = ascending;
    this.callback = callback;
    this.selected = [];
    this.render();
  }

  render() {
    this.$container.empty();
    const factor = this.ascending ? 1 : -1;
    this.selectedChildren = this.selected
      .map((value) => new FilterSelectOption(
        this.$container,
        value,
        true,
        this.applyFilter.bind(this),
      ));
    this.unselectedChildren = this.unselected ? this.unselected
      .filter((value) => !(this.selected.includes(value)))
      .sort((a, b) => {
        if (a > b) return factor;
        if (a < b) return factor * -1;
        return 0;
      })
      .map((value) => new FilterSelectOption(
        this.$container,
        value,
        this.selected.length ? this.filter[value] : null,
        this.applyFilter.bind(this),
      )) : [];
  }

  search(keys) {
    this.unselected = keys.slice(0, 30);
    // subtract already selected ones?
    this.render();
  }

  applyFilter(value, include) {
    this.filter = this.filter || {};
    this.filter[value] = include;
    this.selected = Object.keys(this.filter).filter((key) => this.filter[key]);
    this.filter = this.selected.length ? this.selected
      .reduce((obj, val) => ({
        ...obj, [val]: true,
      }), {}) : null;
    this.render();
    this.callback(this.name, this.filter);
  }
}
