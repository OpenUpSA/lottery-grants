import csv
import json
import re
from pathlib import Path
import pandas as pd

fields = ["Project Number", "Sector", "Province", "Name", "Amount"]

totals = [["Name"], ["Sector"], ["Province"], ["year", "Sector", "Name"]]

province_names = {
    "ec": "Eastern Cape",
    "freestate": "Free State",
    "gauteng": "Gauteng",
    "kzn": "Kwazulu-Natal",
    "limpopo": "Limpopo",
    "mpumalanga": "Mpumalanga",
    "national": "National",
    "nc": "Northern Cape",
    "nw": "North West",
    "wc": "Western Cape",
}

provinces = {
    "EC": "ec",
    "EASTERN CAPE": "ec",
    "Eastern Cape": "ec",
    "FREE STATE": "freestate",
    "Free State": "freestate",
    "FS": "freestate",
    "FREESTATE": "freestate",
    "GP": "gauteng",
    "GAUTENG": "gauteng",
    "Gauteng": "gauteng",
    "KZN": "kzn",
    "KWAZULU-NATAL": "kzn",
    "KwaZulu Natal": "kzn",
    "KWAZULU NATAL": "kzn",
    "KWA-ZULU NATAL": "kzn",
    "LP": "limpopo",
    "LIMPOPO": "limpopo",
    "Limpopo": "limpopo",
    "MP": "mpumalanga",
    "MPUMALANGA": "mpumalanga",
    "Mpumalanga": "mpumalanga",
    "NATIONAL": "national",
    "National Bodies": "national",
    "NATIONAL BODIES": "national",
    "NW": "nw",
    "NORTH WEST": "nw",
    "North West": "nw",
    "NC": "nc",
    "NORTHERN CAPE": "nc",
    "Northern Cape": "nc",
    "WC": "wc",
    "WESTERN CAPE": "wc",
    "Western Cape": "wc",
}

sector_names = {
    "UNSPECIFIED": "Unspecified",
    "arts": "Arts, culture and national heritage",
    "charities": "Charities",
    "miscellaneous": "Miscellaneous",
    "sports": "Sports & recreation",
}
sectors = {
    "": "UNSPECIFIED",
    "Arts": "arts",
    "Arts, Culture & National Heritage": "arts",
    "Arts, Culture and National Heritage": "arts",
    "ARTS, CULTURE AND NATIONAL HERITAGE": "arts",
    "ARTS, CULTURE AND NATIONAL HERITAGE CATEGORY": "arts",
    "ARTS, CULTURE & NATIONAL HERITAGE": "arts",
    "ARTS": "arts",
    "Charities": "charities",
    "CHARITIES": "charities",
    "CHARITIES CATEGORY": "charities",
    "Misc": "miscellaneous",
    "Miscellaneous Purposes": "miscellaneous",
    "MISCELLANEOUS PURPOSES": "miscellaneous",
    "MISCELLANEOUS": "miscellaneous",
    "Sports": "sports",
    "Sports & Recreation": "sports",
    "Sport & Recreation": "sports",
    "SPORTS": "sports",
    "SPORT": "sports",
    "SPORT & RECREATION": "sports",
    "SPORT AND RECREATION CATEGORY": "sports",
    "SPORT AND RECREATION": "sports",
    "SPORTS & RECREATION": "sports",
}

repo_path = Path(__file__).resolve().parents[1]
data_path = repo_path / "data"
in_base_path = data_path / "in"
in_base_paths = sorted(in_base_path.glob("*[!_DIRTY].csv"))
out_base_path = repo_path / "data/out"

lookup = {}
name_map = {}


def memo_names(name, field, value):
    name_map[name] = name_map.setdefault(name, {})
    current = name_map[name].setdefault(field, [])
    name_map[name][field] = list(set(current).union([value]))


def process_lookup():
    array = []
    out_lookup_path = out_base_path / "lookup.json"
    out_names_path = out_base_path / "names_memo.json"
    out_array_path = out_base_path / "array.json"
    id = 0
    for in_base_path in in_base_paths:
        match = re.match(r".*?([1-2][0|9][0-9][0-9]).*", str(in_base_path))
        year = match.group(1)
        print(f'\nProcessing "{str(in_base_path)}" as year {year}')
        with in_base_path.open() as file:
            reader = csv.DictReader(file)
            out_fields = list(set(fields) & set(reader.fieldnames))
            print(f" - matched fields: {out_fields}")
            print(f" - missing fields: {list(set(fields) - set(out_fields))}")
            for row in reader:
                out_obj = {"year": year}
                for field in out_fields:
                    value = row[field].replace("\n", " ")
                    if field == "Sector":
                        value = sector_names[sectors[value]]
                    elif field == "Province":
                        value = province_names[provinces[value]]
                        memo_names(row["Name"].replace("\n", " "), "Province", value)
                    out_obj[field] = value.strip()
                lookup[id] = out_obj
                array.append(out_obj)
                id += 1
    with out_lookup_path.open("w") as file:
        json.dump(lookup, file, indent=2)
    with out_array_path.open("w") as file:
        json.dump(array, file, indent=2)
    with out_names_path.open("w") as file:
        json.dump(name_map, file, indent=2)
    print(
        f"\n{len(lookup.keys())} rows processed - saved to {str(out_array_path)} and {str(out_array_path)}\n"
    )


def add_agg_layer(result, fields, index, row, i):
    if not isinstance(result, list):
        if index[i] not in result:
            result[index[i]] = {} if i < len(fields) - 2 else []
        add_agg_layer(result[index[i]], fields, index, row, i + 1)
    else:
        obj = {fields[i]: index[i], "Amount": row.Amount, "ids": row.ids}
        if "Name" in obj and obj["Name"] in name_map:
            obj["Province"] = name_map[obj["Name"]]["Province"]
        result.append(obj)


def process_treemap(name, input):
    levels = name.split("_")
    tm = treemap(input, levels, 0)
    out_path = out_base_path / f"{name}-treemap.json"
    with out_path.open("w") as out_file:
        json.dump(tm, out_file, indent=2)
    print(f"Treemap {str(out_path)} saved")


def treemap(input, levels, i, key=None):
    tm = {"children": []}
    if i > 0:
        tm[levels[i - 1]] = key
    if isinstance(input, dict):
        for key, data in input.items():
            tm["children"].append(treemap(data, levels, i + 1, key))
    else:
        for record in input:
            tm["children"].append(record)
    return tm


def process_totals(data):
    df = pd.DataFrame.from_dict(data, orient="index")
    df["Amount"] = pd.to_numeric(df["Amount"])
    df["ids"] = df.reset_index().index
    for fields in totals:
        grouped = df.groupby(fields).agg({"Amount": "sum", "ids": lambda x: x.tolist()})
        grouped = grouped.sort_values(by="Amount", ascending=False)
        result = [] if len(fields) == 1 else {}
        for row in grouped.itertuples():
            index = [row.Index] if isinstance(row.Index, str) else row.Index
            add_agg_layer(result, fields, index, row, 0)
        base_name = "_".join(fields)
        out_path = out_base_path / f"{base_name}.json"
        with out_path.open("w") as out_file:
            json.dump(result, out_file, indent=2)
        print(f"Aggregation {str(out_path)} saved")
        process_treemap(base_name, result)
        if isinstance(result, list):
            for record in result:
                del record["ids"]
            out_path = out_base_path / f"{base_name}-no-ids.json"
            with out_path.open("w") as out_file:
                json.dump(result, out_file, indent=2)


process_lookup()
in_files = process_totals(lookup)
