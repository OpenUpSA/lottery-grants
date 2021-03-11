import { descending } from 'd3-array';
import { json } from 'd3-fetch';
import { hierarchy, treemap } from 'd3-hierarchy';
import {
  data, enter, select, selectAll, style,
} from 'd3-selection';

export const d3 = {
  data,
  descending,
  enter,
  json,
  hierarchy,
  select,
  selectAll,
  style,
  treemap,
};
