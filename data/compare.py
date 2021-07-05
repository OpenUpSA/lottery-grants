import csv


def process(filename):
    obj = {}
    with open(filename) as file:
        reader = csv.DictReader(file)
        for row in reader:
            name = ' '.join(row['Name'].split()).replace('-', ' ')
            obj[name] = obj.setdefault(name, 0) + float(row['Amount'])
    return obj


old_name_amount = process('in/NLC-2017-2018 - cleaned.csv')
new_name_amount = process('in/NLC-2017-2018 - imported.csv')

old_set = set(old_name_amount)
new_set = set(new_name_amount)
not_in_old = new_set - old_set
not_in_new = old_set - new_set
in_both = old_set.intersection(new_set)

print('NOT IN NEW', len(not_in_new))
print('NOT IN OLD', len(not_in_old))
print('IN BOTH', len(in_both))
