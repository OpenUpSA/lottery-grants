"""Convert Anton's beneficiary xlsx spreadsheets to the cleaned CSV format
consumed by transform.py.

Each source sheet lists monthly NLDTF payments with section headers, subtotal
rows, repeated column headers and (occasionally) stray OCR/logo text. We keep
only true data rows, identified by a recipient name in column 1 and a numeric
amount in column 2 (excluding label rows like "RECIPIENT NAME" and "TOTAL").
Project codes appear in two formats (e.g. "M58567" and
"NLC-EC-CHA-24/25-10789"), both kept verbatim as the Project Number.

Output columns match the existing in/NLC-*.csv files:
    Date,Sector,Province,Project Number,Name,Amount
"""
import csv
import math
from pathlib import Path

import pandas as pd

data_path = Path(__file__).resolve().parents[1]

# (source file, sheet name, output filename)
JOBS = [
    (
        "2025 beneficiary list spreadsheet from Anton.xlsx",
        "2025 Beneficiaries",
        "NLC-2024-2025 - cleaned.csv",
    ),
    (
        "2026 Beneficiary spreadsheet from Anton.xlsx",
        "2026 Beneficiary List",
        "NLC-2025-2026 - cleaned.csv",
    ),
]

# Column-1 values that are not recipient names (headers / total rows).
NON_NAME_LABELS = {"recipient name", "total", "grand total"}


def is_blank(value):
    return value is None or (isinstance(value, float) and math.isnan(value))


def parse_amount(value):
    return float(str(value).replace(",", "").strip())


def parse_date(value):
    """Parse mixed date formats ('24 April 2024', '02-Aug-24') to ISO Z."""
    dt = pd.to_datetime(str(value).strip(), dayfirst=True)
    return dt.strftime("%Y-%m-%dT00:00:00Z")


def strip_prefix(name, project_no):
    """Names are usually prefixed with the project code, e.g.
    "M58567-Heritage Education" or "NLC-EC-CHA-24/25-10789 - Small Projects".
    Strip the code and any leading separator; leave unprefixed names as-is.
    """
    if project_no and name.upper().startswith(project_no.upper()):
        name = name[len(project_no):].lstrip()
        if name.startswith("-"):
            name = name[1:]
    return name.strip()


def convert(source, sheet, out_name):
    df = pd.read_excel(data_path / source, sheet_name=sheet, header=None)
    rows = []
    total = 0.0
    for _, row in df.iterrows():
        if is_blank(row[1]) or is_blank(row[2]):
            continue
        if str(row[1]).strip().lower() in NON_NAME_LABELS:
            continue
        try:
            amount = parse_amount(row[2])
        except ValueError:
            continue
        project_no = "" if is_blank(row[0]) else str(row[0]).strip()
        name = strip_prefix(str(row[1]).strip(), project_no)
        province = "UNSPECIFIED" if is_blank(row[3]) else str(row[3]).strip()
        date = "" if is_blank(row[4]) else parse_date(row[4])
        rows.append(
            {
                "Date": date,
                "Sector": "UNSPECIFIED",
                "Province": province,
                "Project Number": project_no,
                "Name": name,
                "Amount": amount,
            }
        )
        total += amount

    out_path = data_path / "in" / out_name
    with out_path.open("w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["Date", "Sector", "Province", "Project Number", "Name", "Amount"],
        )
        writer.writeheader()
        writer.writerows(rows)
    print(f"{source} -> {out_name}: {len(rows)} rows, total amount {total:,.2f}")


if __name__ == "__main__":
    for job in JOBS:
        convert(*job)
