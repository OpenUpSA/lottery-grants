# Lottery grants data processing

`data/name-resolution.json` is used to collapse variants of a beneficiary's name to a single value. To change resolution to a new name after a code change in `transform.py`, remove all references to that name from that JSON file, and rerun `transform.py`.
