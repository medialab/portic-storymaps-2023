import sys
import csv
import casanova
from collections import defaultdict, Counter

exclude_partners = ["France"]

def build_data(port, preliminary_analysis=False, verbose=False):
    reader = casanova.reader("../../data/toflit18_all_flows.csv")

    dirferme_col = reader.headers["customs_region"]
    source_col = reader.headers["best_guess_region_prodxpart"]
    product_col = reader.headers["product_revolutionempire"]
    partner_col = reader.headers["partner_grouping"]
    year_col = reader.headers["year"]
    exchange_col = reader.headers["export_import"]
    value_col = reader.headers["value"]

    if preliminary_analysis:
        classif = {
            "Blé et autres grains comestibles": "blé",
            "Huile d'olive à manger": "huile",
            "Huiles diverses": "huile",
            "Huile d'olive pour fabrique": "huile"
        }
        partners = {
            "blé imports": defaultdict(Counter),
            "blé exports": defaultdict(Counter),
            "huile imports": defaultdict(Counter),
            "huile exports": defaultdict(Counter)
        }
    else:
        main_products = defaultdict(Counter)
        for row in reader:
            if row[dirferme_col] == port and row[source_col] == "1" and row[partner_col] not in exclude_partners:
                val = float(row[value_col] or 0)
                main_products[row[exchange_col].lower()][row[product_col]] += val

        best_products = defaultdict(list)
        partners = {}
        for typ in ["imports", "exports"]:
            best_products[typ] = sorted(main_products[typ].keys(), key=lambda x: -main_products[typ][x])[:10]
            if verbose:
                print("Biggest products for", port, typ)
                print(best_products[typ])
            for prod in best_products[typ]:
                partners[prod + " " + typ] = defaultdict(Counter)


    reader2 = casanova.reader("../../data/toflit18_all_flows.csv")
    for row in reader2:
        if row[dirferme_col] == port and row[source_col] == "1" and row[partner_col] not in exclude_partners:
            val = float(row[value_col] or 0)
            if preliminary_analysis:
                if row[product_col] in classif:
                    partners[classif[row[product_col]] + " " + row[exchange_col].lower()][row[partner_col]][row[year_col]] += val
            else:
                if row[product_col] in best_products[row[exchange_col]]:
                    partners[row[product_col] + " " + row[exchange_col].lower()][row[partner_col]][row[year_col]] += val


    with open("%s-partners.csv" % ("preliminary-analysis" if preliminary_analysis else port), "w") as f:
        writer = csv.writer(f)
        writer.writerow(["year", "partner", "value", "serie"])
        for serie in partners:
            for partner in partners[serie]:
                for year in partners[serie][partner]:
                    writer.writerow([year, partner, partners[serie][partner][year], serie])


if __name__ == "__main__":
    build_data("Marseille", preliminary_analysis=True)
