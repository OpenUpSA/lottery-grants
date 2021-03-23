import { SearchService } from './search-service';

export class Search {
  constructor($parent, searchData, searchFields, keyField, callback) {
    const searchService = new SearchService(searchData, searchFields, keyField);
    $parent.find('.search-input')
      .on('input', (evt) => {
        const { value } = evt.target;
        searchService.search(value, callback);
      });
  }
}
