import camelot
import pandas as pd

OUT_COLS = ['Date', 'Project', 'Name', 'Province', 'Sector', 'Amount']

SOURCE_PDF = 'source/NLDTF-Payments-2017-181.pdf'
TARGET_CSV = 'in/NLC-2017-2018 - imported_DIRTY.csv'

tables = camelot.read_pdf(SOURCE_PDF, pages='1-end')
all = pd.concat(map(lambda table: table.df, tables))
all.reset_index(inplace=True)
all.rename(columns={0: 'Date_Sector', 2: 'Project_Name', 4: 'Amount', 5: 'Province'}, inplace=True)

# Fix Province field that contains table headings
'''
108,02-Mar-18 SPORTS,,60479 60479-HOLPAN PRIMARY SCHOOL,,"100 000,00","Date
Sector
Project
Organisation
Amount
Province
FS"
'''
all.Province = all.Province.map(lambda x: x.split('\n')[-1])
print('\nCHECK: Provinces\n', all.Province.unique())

# Combine columns over which project beneficiary name are split
all.Project_Name = all.Project_Name + all[3]

# Extract project number
all[['Project']] = all.Project_Name.map(lambda x: x.split()[0])

# Check duplicate project number always same
print('\nCHECK: Rows where project in Project col is different to project in Name col (should be empty)\n', all[all.Project != all.Project_Name.map(lambda x: x.split()[0])])

# Extract beneficiary name
all[['Name']] = all.Project_Name.str.extract(r'.*[0-9]{5,6}\s*[0-9]{5,6}\s*-\s*(.*)')

# Combine columns over which date and sector are split
all.Date_Sector = all.Date_Sector + all[1]

# Extract date and sector
all[['Date']] = all.Date_Sector.map(lambda x: x.split()[0]).astype('datetime64')
all[['Sector']] = all.Date_Sector.map(lambda x: ''.join(x.split()[1:]))
print('\nCHECK: Sectors\n', all.Sector.unique())

# Filter out empty amounts
print('\nCHECK: Filtered out empty amounts\n', all[all.Amount == '-'][OUT_COLS])
all = all[all['Amount'] != '-']

# Parse amounts
all.Amount = all.Amount.map(lambda x: x.replace(' ', '').replace(',', '.')).astype('float64')

print('\n CHECK: First few rows\n', all[OUT_COLS].head())

all[OUT_COLS].to_csv(TARGET_CSV, index=False)
