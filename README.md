# Lottery grants

This repo provides data processing from source CSV files, and a website to explore Lottery grants.

## TODO

### MVP

- [ ] Implement Netlify deployment
- [ ] Add link to https://www.nlcsa.org.za/annual-reports. @Matt
- [x] Get latest data
- [x] Do not include date for now, as we only have date for 2019-20. (old task: Include allocation date once available in data set)
- [x] CSV download - download entire selection based on filters (remove from clicked selection)
- [x] Benficiary CIPC info...? (leave out for now)
- [ ] Update with latest webflow export: include treemap loading div. @Matt loading not showing at top after content added
- [x] Update with latest webflow export: set count and amount details to new targets
- [x] Update with latest webflow export: change beneficiary search to show selected as pills instead of checkboxes
- [x] Update with latest webflow export: add table to selected data overlay
- [ ] Remove 'date' from selected data table? @Matt
- [ ] Avoid CSS `//` comments from webflow or post-process in webflow import. @Matt ?
- [x] Correct handling of province filter

### Later

- [ ] Show all time top 10 beneficiaries by amount on website
- [ ] Change processing of input CSV data so that Netlify deployment can generate data?

## Development

Data processing is done using Python, website UX design in Webflow, and website dynamics using jQuery and D3.js.

### Generate data from CSV files

> NB: check funny rows e.g. ',Charities,Western Cape,Ikhwezilokusa Home for Mentally & Physically Disabled Children:: Meyerton' in `NLC-2003-2004 - cleaned`

A Python virtual environment may be used as follows (run commands from `data` directory):

- For first time setup, run `. install.sh`. This installs and activates a Python virtual environment.
- To activate the virtual environment, run `. activate.sh`.
- To deactivate virtual environment, run `deactivate`.

To generate data for the website, save CSV files to `/data/in/*{year}*.csv`, for example `/data/in/NLC-2001-2002 - cleaned.csv`, then:

```bash
cd data
python3 transform.py
```

### Import Webflow export

To update the website with a Webflow export, save the Webflow export to `/webflow-export.zip`, then run:

```bash
npm run webflow-import
```

## Deployment

For now, generate data from CSV files, then run build, then upload `dist` directory contents to a web server:

```bash
cd data
. activate.sh
python3 transform.py
cd ..
npm run build
```

This process should of course be improved once the data processing is finalised.
