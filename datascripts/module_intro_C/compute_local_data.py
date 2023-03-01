import csv, casanova
from collections import defaultdict, Counter
from itertools import groupby
import math
import numpy as np
from sklearn.linear_model import LinearRegression

import regress 


reader = casanova.reader("../../data/toflit18_all_flows.csv")


directions_fermes = ["Marseille", "Rouen", "Bordeaux", "Nantes", "Bayonne", "La Rochelle"]



year_col = reader.headers["year"]
dirferme_col = reader.headers["customs_region"]
source_col = reader.headers["best_guess_region_prodxpart"]
exchange_col = reader.headers["export_import"]
value_col = reader.headers["value"]
product_col = reader.headers["product_sitc_simplEN"]
partner_col = reader.headers["partner_grouping"]

croissances = defaultdict(Counter)
croissances_no_colonial = defaultdict(Counter)
croissances_imports = defaultdict(Counter)
croissances_imports_no_colonial = defaultdict(Counter)
croissances_exports = defaultdict(Counter)
croissances_exports_no_colonial = defaultdict(Counter)

years = set();

all_data= []
for row in reader:
    if row[year_col] != "1787" and row[year_col] >= "1740" and \
       row[dirferme_col] in directions_fermes and row[source_col] == "1" and \
       row[value_col] != '' and row[value_col] is not None and \
       row[partner_col] != 'France':
        all_data.append(row)

for ((year, dir_ferme), _rows) in groupby(all_data, key= lambda r: (r[year_col],r[dirferme_col])):
    rows = list(_rows)
    imports = [float(row[value_col]) for row in rows if row[exchange_col] == "Imports"]
    imports_value_no_colonial = sum([float(row[value_col]) for row in rows if row[exchange_col] == "Imports" and row[product_col] != "Plantation foodstuffs"])
    exports = [float(row[value_col]) for row in rows if row[exchange_col] == "Exports"]
    exports_value_no_colonial = sum([float(row[value_col]) for row in rows if row[exchange_col] == "Exports" and row[product_col] != "Plantation foodstuffs"])
    imports_value = sum(imports) if len(imports) > 0 else None
    exports_value = sum(exports) if len(exports) > 0 else None
    total = imports_value + exports_value if imports_value and exports_value else None
    total_no_colonial = imports_value_no_colonial + exports_value_no_colonial if len(imports) >0 and len(exports) > 0 else None
    years.add(year);
    

    if total is not None:
        croissances[dir_ferme][year] += total
        croissances_no_colonial[dir_ferme][year] += total_no_colonial
    if imports_value is not None:
        croissances_imports[dir_ferme][year] += imports_value
        croissances_imports_no_colonial[dir_ferme][year] += imports_value_no_colonial
    if exports_value is not None:
        croissances_exports[dir_ferme][year] += exports_value
        croissances_exports_no_colonial[dir_ferme][year] += exports_value_no_colonial

print(croissances)
with open("evolution_directions_fermes_local.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["year", "direction_ferme", "value", "kind"])
    for year in sorted(list(years)):
        for ferme in directions_fermes:
            if croissances[ferme][year] != 0:
                writer.writerow([year, ferme, croissances[ferme][year], "total"])
            if croissances_imports[ferme][year] != 0:  
                writer.writerow([year, ferme, croissances_imports[ferme][year], "imports"])
            if croissances_exports[ferme][year] != 0:  
                writer.writerow([year, ferme, croissances_exports[ferme][year], "exports"])
            if croissances_no_colonial[ferme][year] != 0: 
                writer.writerow([year, ferme, croissances_no_colonial[ferme][year], "total_no_colonial"])
            if croissances_imports_no_colonial[ferme][year] != 0:
                writer.writerow([year, ferme, croissances_imports_no_colonial[ferme][year], "imports_no_colonial"])
            if croissances_exports_no_colonial[ferme][year] != 0:
                writer.writerow([year, ferme, croissances_exports_no_colonial[ferme][year], "exports_no_colonial"])

with open("regressions_local.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["direction_ferme", "kind", "score", "intercept", "slope"])
    for f in directions_fermes:
        (score, slope, y0) = regress.regress(f, croissances, "total")
        writer.writerow([f, "total", score, y0, slope])
        (score, slope, y0) = regress.regress(f, croissances_imports, "imports")
        writer.writerow([f, "imports", score, y0, slope])
        (score, slope, y0) = regress.regress(f, croissances_exports, "exports")
        writer.writerow([f, "exports", score, y0, slope])
        (score, slope, y0) = regress.regress(f, croissances_no_colonial, "total_no_colonial")
        writer.writerow([f, "total_no_colonial", score, y0, slope])
        (score, slope, y0) = regress.regress(f, croissances_imports_no_colonial, "imports_no_colonial")
        writer.writerow([f, "imports_no_colonial", score, y0, slope])
        (score, slope, y0) = regress.regress(f, croissances_exports_no_colonial, "exports_no_colonial")
        writer.writerow([f, "exports_no_colonial", score, y0, slope])

