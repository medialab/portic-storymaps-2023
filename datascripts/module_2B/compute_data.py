import csv
import json
import casanova
from collections import defaultdict, Counter
from pprint import pprint

reader = casanova.reader("../../data/toflit18_all_flows.csv")

dirferme_col = reader.headers["customs_region"]
source_col = reader.headers["best_guess_region_prodxpart"]
product_col = reader.headers["product_revolutionempire"]
partner_col = reader.headers["partner_grouping"]
year_col = reader.headers["year"]
exchange_col = reader.headers["export_import"]
value_col = reader.headers["value"]

classif = {
    "Blé et autres grains comestibles": "blé",
    "Huile d'olive à manger": "huile",
    "Huiles diverses": "huile",
    "Huile d'olive pour fabrique": "huile"
}

partners = {
    "blé": {
        "imports": defaultdict(Counter),
        "exports": defaultdict(Counter)
    },
    "huile": {
        "imports": defaultdict(Counter),
        "exports": defaultdict(Counter)
    }
}

exclude_partners = ["France"]

for row in reader:
    if row[dirferme_col] == "Marseille" and row[source_col] == "1" and row[product_col] in classif and row[partner_col] not in exclude_partners:
        partners[classif[row[product_col]]][row[exchange_col].lower()][row[partner_col]][row[year_col]] += float(row[value_col] or 0)

for product in partners:
    for typ in partners[product]:
        with open("partners_%s_%s.json" % (typ, product), "w") as f:
            json.dump(partners[product][typ], f)
            pprint(partners)
        with open("partners_%s_%s.csv" % (typ, product), "w") as f:
            writer = csv.writer(f)
            writer.writerow(["year", "partner", typ])
            for partner in partners[product][typ]:
                for year in partners[product][typ][partner]:
                    writer.writerow([year, partner, partners[product][typ][partner][year]])
            pprint(partners[product][typ])

with open("partners.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["year", "partner", "value", "serie"])
    for product in partners:
        for typ in partners[product]:
                for partner in partners[product][typ]:
                    for year in partners[product][typ][partner]:
                        writer.writerow([year, partner, partners[product][typ][partner][year], typ + " " + product])
