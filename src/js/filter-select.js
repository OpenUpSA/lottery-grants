import { FilterSelectOption } from './filter-select-option';

export class FilterSelect {
  constructor($container, name, filter, ascending, callback) {
    this.$container = $container;
    this.name = name;
    this.filter = filter;
    this.ascending = ascending;
    this.callback = callback;
    this.selected = [];
    this.unselected = Object.keys(filter);
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
    this.unselectedChildren = this.unselected
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
      ));
  }

  search(keys) {
    this.unselected = keys.slice(0, 30);
    // subtract already selected ones?
    this.render();
  }

  applyFilter(value, include) {
    let includeAll = null;
    if (!this.selected.length && include) { // First filter select
      includeAll = false;
    } else if (this.selected.length === 1 && !include) { // Last filter deselect
      includeAll = true;
    }
    if (includeAll !== null) {
      Object.keys(this.filter).forEach((key) => {
        this.filter[key] = includeAll;
      });
    }
    if (!includeAll) {
      this.filter[value] = include;
    }
    this.selected = includeAll ? [] : Object.keys(this.filter).filter((key) => this.filter[key]);
    this.unselected = includeAll ? Object.keys(this.filter) : Object.keys(this.filter).filter((key) => !this.filter[key]);
    this.render(this.unselected);
    this.callback(this.name, this.filter);
  }
}
