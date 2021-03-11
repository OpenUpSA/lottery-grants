import $ from 'jquery';
import { d3 } from './d3';
import { FilterSelect } from './filter-select';
import { FilterSearchSelect } from './filter-search-select';
import { Search } from './search';
import { Treemaps } from './treemaps';
import { Overlay } from './overlay';

const legend = $('.legend__wrapper');

Promise.all([
  d3.json('data/lookup.json'),
  d3.json('data/year_Sector_Name-treemap.json'),
  d3.json('data/Name-no-ids.json'),
  d3.json('data/Province-no-ids.json'),
  d3.json('data/Sector-no-ids.json'),
]).then(([
  lookup,
  data,
  nameSummary,
  provinceSummary,
  sectorSummary,
]) => {
  const colors = {
    'Arts, culture and national heritage': legend.find('.legend-swatch--colour-1').css('background-color'),
    Charities: legend.find('.legend-swatch--colour-2').css('background-color'),
    Miscellaneous: legend.find('.legend-swatch--colour-3').css('background-color'),
    'Sports & recreation': legend.find('.legend-swatch--colour-4').css('background-color'),
    Unspecified: legend.find('.legend-swatch--colour-5').css('background-color'),
  };

  const fromYear = 2010;
  const years = data.children
    .reduce((obj, val) => ({
      ...obj, [val.year]: val.year >= fromYear,
    }), {});

  const provinces = provinceSummary
    .reduce((obj, val) => ({
      ...obj, [val.Province]: true,
    }), {});

  const sectors = sectorSummary
    .reduce((obj, val) => ({
      ...obj, [val.Sector]: true,
    }), {});

  const filters = {
    year: years,
    sector: sectors,
    Province: provinces,
  };

  const overlay = new Overlay('.beneficiary-info', lookup);

  const treemaps = new Treemaps('.data-vis', data, filters, colors, overlay);

  $('.clear-filters').on('click', () => treemaps.clearFilters());

  const filter = (name, values) => {
    treemaps.update(name, values);
  };

  const $yearFilter = $('#wf-form-Year-list');
  new FilterSelect($yearFilter, 'year', years, false, filter.bind(this));

  const $sectorFilter = $('#wf-form-Grant-categories-list');
  new FilterSelect($sectorFilter, 'Sector', sectors, true, filter.bind(this));

  const $provinceFilter = $('#wf-form-Province-list');
  new FilterSelect($provinceFilter, 'Province', provinces, true, filter.bind(this));

  const $beneficiaryFilter = $('#wf-form-Beneficiaries-list');
  const beneficiaryFilter = new FilterSearchSelect($beneficiaryFilter, 'Name', true, filter.bind(this));
  const $beneficiarySearch = $('#wf-form-Beneficiaries-search');
  new Search($beneficiarySearch, nameSummary, ['Name'], 'Name', beneficiaryFilter.search.bind(beneficiaryFilter));
}).catch((err) => {
    console.log(err);
});
