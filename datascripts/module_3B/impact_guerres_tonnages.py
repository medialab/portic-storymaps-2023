import csv
import requests
import casanova
from collections import defaultdict, Counter


# Read and filter pointcalls
reader = casanova.reader("../../data/navigo_all_pointcalls.csv")

# On ne conserve que la Santé, pas le petit cabotage
source_col = reader.headers["source_suite"]
filter_source = "la Santé registre de patentes de Marseille"

# On veut toutes les années des guerres
date_col = reader.headers["date_fixed"]
filter_years = ["1749", "1759", "1769", "1779", "1787", "1789", "1799"]

# Pour sommer le tonnage des différents bateaux, on ne garde qu'un pointcall par trajet complet en gardant le seul pointcall de la première étape
rank_col = reader.headers["pointcall_rank_dedieu"]
filter_rank = "1.0"

shipclass_col = reader.headers["ship_class_standardized"]


flag_col = reader.headers["ship_flag_standardized_fr"]
sourcedoc_col = reader.headers["source_doc_id"]


# On récupère l'estimation du tonnage par type de bateau
TONNAGE_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYdeIwpzaVpY_KS91cXiHxb309iYBS4JN_1_hW-_oyeysuwcIpC2VJ5fWeZJl4tA/pub?output=csv"
download = requests.get(TONNAGE_SPREADSHEET_URL)
tonnages_estimate = {"": 0}
for row in csv.DictReader(download.content.decode("utf-8").splitlines()):
    tonnages_estimate[row["ship_class"]] = int(row["tonnage_estime_en_tx"].replace("No data", "0") or 0)


# On somme le tonnage total estimé pour chaque année
tonnages_year = Counter()
tonnages_year_pavillon = defaultdict(Counter)
ships_year_pavillon = {year: defaultdict(set) for year in filter_years}
pavillons = set()
for row in reader:
    year = row[date_col][:4]
    if row[source_col] == filter_source and \
       year in filter_years and \
       row[rank_col] == filter_rank:
        # WARNING: Galère missing in tonnages
        tonnage = tonnages_estimate.get(row[shipclass_col], 0)
        tonnages_year[year] += tonnage
        pavillon = row[flag_col] or "inconnu"
        pavillons.add(pavillon)
        tonnages_year_pavillon[year][pavillon] += tonnage
        ships_year_pavillon[year][pavillon].add(row[sourcedoc_col])


from pprint import pprint
pprint(tonnages_year)
with open("tonnages_totaux.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["annee", "tonnage"])
    for year in filter_years:
        writer.writerow([year, tonnages_year[year]])
with open("tonnages_pavillons.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["annee", "tonnage", "pavillon"])
    for year in filter_years:
        for pavillon in pavillons:
            writer.writerow([year, tonnages_year_pavillon[year][pavillon], pavillon])
with open("ships_pavillons.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["annee", "nb_ships", "pavillon"])
    for year in filter_years:
        for pavillon in pavillons:
            writer.writerow([year, len(ships_year_pavillon[year][pavillon]), pavillon])

pavillons_agreg = ["français", "génois", "hollandais", "britannique", "napolitain", "espagnol", "danois", "suédois", "savoyard", "autres"]
for year in filter_years:
    for pavillon in pavillons:
        if pavillon not in pavillons_agreg:
            tonnages_year_pavillon[year]["autres"] += tonnages_year_pavillon[year][pavillon]
            ships_year_pavillon[year]["autres"] |= ships_year_pavillon[year][pavillon]
with open("tonnages_pavillons_agregate.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["annee"] + pavillons_agreg)
    for year in filter_years:
        writer.writerow([year] + [tonnages_year_pavillon[year][pavillon] for pavillon in pavillons_agreg])
with open("ships_pavillons_agregate.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["annee"] + pavillons_agreg)
    for year in filter_years:
        writer.writerow([year] + [len(ships_year_pavillon[year][pavillon]) for pavillon in pavillons_agreg])



# War & Peace https://docs.google.com/spreadsheets/d/e/2PACX-1vRxr78qK0zubFIDR7w38JqWOkqD-P6uqZi-pXChSLwYxesUGJwZnxCx-0sYIKKxwr3SJvb5P5HVGW1o/pub?output=csv


