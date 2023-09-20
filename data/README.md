# Lottery grants data processing

See `process.sh` for what should be run to generate outputs.

`data/name-resolution.json` is used to collapse variants of a beneficiary's name to a single value. Entries created in `data/name-resolution-tmp.json` during `transform.py` runs can be used as starting point for specifying hard-coded mappings / overrides in `data/name-resolution.json`.

## Debugging

If you get an error during `process.sh` like this:

```
Traceback (most recent call last):
  File "~/lottery-grants/data/transform.py", line 291, in <module>
    process_lookup()
  File "~/lottery-grants/data/transform.py", line 200, in process_lookup
    value = sector_names[sectors[value]]
KeyError: 'Miscellaneous'
``` 

then you need to add key/values in `transform.py` e.g. `MISCELLANEOUS` and `miscellaneous` and `Miscellaneous` are all different and need to be mapped exactly. It's best not to modify the existing ones as older data relies on those mappings. Rather add new mappings even if redundant.