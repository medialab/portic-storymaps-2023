import csv
import requests
import casanova
from collections import defaultdict, Counter


# Read and filter flows
reader = casanova.reader("../../data/navigo_all_flows.csv")

# On ne conserve que la Santé, pas le petit cabotage
source_col = reader.headers["source_suite"]
filter_source = "la Santé registre de patentes de Marseille"

# On veut toutes les années des guerres
date_col = reader.headers["indate_fixed"]
filter_years = ["1749", "1759", "1769", "1779", "1787", "1789", "1799"]

# On veut compter en plus des totaux le cas particulier du pavillon français
flag_col = reader.headers["ship_flag_id"]
filter_flag = "A0167415"


stagelength_col = reader.headers["distance_dep_dest_miles"]
sourcedoc_col = reader.headers["source_doc_id"]


# On somme le mileage total parcouru pour chaque année
mileage_year_tot = Counter()
mileage_year_tot_FR = Counter()
ships_year = defaultdict(set)
ships_year_FR = defaultdict(set)
for row in reader:
    year = row[date_col][:4]
    if row[source_col] == filter_source and \
       year in filter_years:
        mileage_year_tot[year] += int(row[stagelength_col] or 0)
        ships_year[year].add(row[sourcedoc_col])
        if row[flag_col] == filter_flag:
            mileage_year_tot_FR[year] += int(row[stagelength_col] or 0)
            ships_year_FR[year].add(row[sourcedoc_col])


from pprint import pprint
pprint(mileage_year_tot)
pprint([{year: len(vals)} for year, vals in ships_year.items()])

# On calcule la moyenne par bateau pour chaque année et on écrit le csv
with open("mileage_total_moyen.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["annee", "mileage_total", "mileage_moyen", "mileage_total_FR", "mileage_moyen_FR"])
    for year in filter_years:
        writer.writerow([
            year,
            mileage_year_tot[year],
            mileage_year_tot[year]/len(ships_year[year]),
            mileage_year_tot_FR[year],
            mileage_year_tot_FR[year]/len(ships_year_FR[year]),
        ])
