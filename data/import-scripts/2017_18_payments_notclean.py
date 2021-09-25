import pandas as pd

OUT_COLS = ['Date', 'Project Number', 'Name', 'Province', 'Sector', 'Amount']
PROVINCES = ['EC', 'FS', 'GP', 'KZN', 'LP', 'MP', 'N', 'NC', 'NW', 'WC']

SOURCE = 'source/2017_18_payments_notclean.xlsx'
TARGET = 'in/2017-2018_payments_notclean.csv'

df = pd.read_excel(SOURCE, sheet_name='Sheet1', header=None)
df.columns = ['Date', 'Sector', 'Project Number', 'Project_Name', 'Amount', 'Province']

# Remove rows with invalid date
not_valid_date = df[~df.Date.str.match(r'.*[a-zA-Z]{3}-[0-9]{2}')]
df.drop(not_valid_date.index, inplace=True)
print('\n\nRows removed, because date invalid:\n', not_valid_date)

# Set partial dates with month and year only, so first day of month
partial_date = df[~df.Date.str.match(r'[0-9]{1,2}-[a-zA-Z]{3}-[0-9]{2}')]
print('\nPartial dates:\n', partial_date)
df.loc[partial_date.index, ['Date']] = partial_date.Date.map(lambda x: f'1{x}' if x[0] == '-' else f'1-{x}')
print('\nAdjusted partial dates:\n', df.loc[partial_date.index])

print('\nChanging sector CHARITIESF to CHARITIES\n:', df[df.Sector == 'CHARITIESF'])
df.Sector[df.Sector == 'CHARITIESF'] = 'CHARITIES'

print('\nChanging sector MISCHARITIES to MISC\n:', df[df.Sector == 'MISCHARITIES'])
df.Sector[df.Sector == 'MISCHARITIES'] = 'MISC'

print('\nChanging sector M to MISC\n:', df[df.Sector == 'M'])
df.Sector[df.Sector == 'M'] = 'MISC'

# Set Province to 'Unknown' if not valid province
not_valid_province = df[~df.Province.isin(PROVINCES)]
print('\n\nProvince set to "Unknown", because province invalid:\n', not_valid_province)
df.loc[not_valid_province.index, ['Province']] = 'Unknown'

# Extract project and name from combined Project_Name
df[['Project_Check']] = df.Project_Name.str.extract(r'([0-9\s]{5,7}).*')
df.Project_Check = df.Project_Check.map(lambda x: x.strip().replace(' ', ''))
df[['Name']] = df.Project_Name.str.extract(r'[0-9\s]{5,7}[\s-]*(.*)')

# Check duplicate project number always same
print('\nCHECK: Rows where project in Project col is different to project in Name col (should be empty)\n', df[df['Project Number'] != df.Project_Check])

df[OUT_COLS].to_csv(TARGET, index=False)
