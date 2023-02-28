import csv, casanova
from collections import defaultdict, Counter
import math
import numpy as np
from sklearn.linear_model import LinearRegression

import regress 


reader = casanova.reader("../../data/toflit18_all_flows.csv")

years = ["1750", "1753", "1756", "1766", "1768", "1770", "1771", "1773", "1774", "1777", "1778", "1779", "1780"]

directions_fermes = ["Marseille", "Rouen", "Bordeaux", "Flandre", "Nantes", "Châlons", "Bayonne", "La Rochelle", "Lyon", "Montpellier", "Amiens", "Charleville", "Rennes", "Narbonne", "Saint-Quentin", "Langres", "Bourgogne", "Caen"]

exclude_sources = ["Local", "National toutes directions partenaires manquants"]


year_col = reader.headers["year"]
dirferme_col = reader.headers["customs_region"]
source_col = reader.headers["best_guess_national_region"]
exchange_col = reader.headers["export_import"]
value_col = reader.headers["value"]
sourcetype_col = reader.headers["source_type"]

croissances = defaultdict(Counter)
croissances_imports = defaultdict(Counter)
croissances_exports = defaultdict(Counter)

for row in reader:
    if row[year_col] in years and row[dirferme_col] in directions_fermes and row[source_col] == "1" and row[sourcetype_col] not in exclude_sources:
        croissances[row[dirferme_col]][row[year_col]] += float(row[value_col] or 0)
        if row[exchange_col] == "Imports":
            croissances_imports[row[dirferme_col]][row[year_col]] += float(row[value_col] or 0)
        elif row[exchange_col] == "Exports":
            croissances_exports[row[dirferme_col]][row[year_col]] += float(row[value_col] or 0)

with open("evolution_directions_fermes.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["year", "direction_ferme", "total", "imports", "exports"])
    for year in years:
        for ferme in directions_fermes:
            writer.writerow([year, ferme, croissances[ferme][year], croissances_imports[ferme][year], croissances_exports[ferme][year]])

with open("regressions.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["direction_ferme", "score_regression_total", "intercept_total", "slope_total", "score_regression_imports", "intercept_imports", "slope_imports", "score_regression_exports", "intercept_exports", "slope_exports"])
    for f in directions_fermes:
        (score_t, slope_t, y0_t) = regress.regress(f, croissances, "total")
        (score_i, slope_i, y0_i) = regress.regress(f, croissances_imports, "imports")
        (score_e, slope_e, y0_e) = regress.regress(f, croissances_exports, "exports")
        writer.writerow([f, score_t, y0_t, slope_t, score_i, y0_i, slope_i, score_e, y0_e, slope_e])

