import { SearchService } from './search-service';

export class Search {
  constructor($container, searchData, searchFields, keyField, callback) {
    this.$container = $container;
    this.callback = callback;
    this.searchService = new SearchService(searchData, searchFields, keyField);
    $container.find('.search-input')
      .on('input', (evt) => {
        const { value } = evt.target;
        this.searchService.search(value, this.callback);
      });
  }
}
