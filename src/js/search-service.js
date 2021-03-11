import SearchApi, { INDEX_MODES } from 'js-worker-search';

export class SearchService {
  constructor(data, fields, keyField) {
    this.api = new SearchApi({
      indexMode: INDEX_MODES.PREFIXES,
    });
    this.fields = fields;
    this.index(data, keyField);
  }

  index(data, keyField) {
    const arr = data instanceof Array ? data : Object.keys(data).map((key) => ({
      ...data[key],
      key,
    }));
    arr.forEach((record) => {
      const fields = this.fields || Object.keys(record);
      const text = fields.map((field) => record[field]).join(' ');
      this.api.indexDocument(record[keyField], text);
    });
  }

  search(input, callback) {
    const promise = this.api.search(input);
    promise.then((results) => {
      callback(results.slice(0, 30));
    });
  }
}
