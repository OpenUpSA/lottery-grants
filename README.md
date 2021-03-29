# Lottery grants

This repo provides data processing from source CSV files, and a website to explore Lottery grants.

## TODO

Document https://www.dropbox.com/sh/v51lkxz82szx2dq/AADeZ4G7zQKiNBpPoVFk2iPra?dl=0

### MVP

- [ ] Spaces not working in search. @Matt webflow spacebar event handling?
- [x] Remove all filters - implemented? Bug fixed.
- [x] Year should be e.g. 2019/2020 instead of 2019.
- [x] Add link to https://www.nlcsa.org.za/annual-reports. @Matt
- [ ] Update with latest webflow export: include treemap loading div. @Matt loading not showing at top after content added
- [x] Remove 'date' from selected data table? @Matt
- [ ] Avoid CSS `//` comments from webflow or post-process in webflow import. @Matt ?
- [x] Implement Netlify deployment
- [x] Get latest data
- [x] Do not include date for now, as we only have date for 2019-20. (old task: Include allocation date once available in data set)
- [x] CSV download - download entire selection based on filters (remove from clicked selection)
- [x] Benficiary CIPC info...? (leave out for now)
- [x] Update with latest webflow export: set count and amount details to new targets
- [x] Update with latest webflow export: change beneficiary search to show selected as pills instead of checkboxes
- [x] Update with latest webflow export: add table to selected data overlay
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

Commits to `main` are deployed to [lottery-grants.netlify.app](https://lottery-grants.netlify.app) by [Netlify](https://app.netlify.com/sites/lottery-grants).

Building of changes from `data/in` is including in the Netlify build, so this needs to be done manually and committed:

```bash
cd data
. activate.sh
python3 transform.py
```

This process should of course be improved once the data processing is finalised.
