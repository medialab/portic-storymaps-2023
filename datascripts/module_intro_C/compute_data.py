import csv, casanova
from collections import defaultdict, Counter
import math
import numpy as np
from sklearn.linear_model import LinearRegression


reader = casanova.reader("../../data/toflit18_all_flows.csv")

years = ["1750", "1753", "1756", "1766", "1768", "1770", "1771", "1773", "1774", "1777", "1778", "1779", "1780"]

directions_fermes = ["Marseille", "Rouen", "Bordeaux", "Flandre", "Nantes", "Châlons", "Bayonne", "La Rochelle", "Lyon", "Montpellier", "Amiens", "Charleville", "Rennes", "Narbonne", "Saint-Quentin", "Langres", "Bourgogne", "Caen"]


year_col = reader.headers["year"]
dirferme_col = reader.headers["customs_region"]
source_col = reader.headers["best_guess_national_region"]
exchange_col = reader.headers["export_import"]
value_col = reader.headers["value"]

croissances = defaultdict(Counter)

for row in reader:
    if row[year_col] in years and row[dirferme_col] in directions_fermes and row[source_col] == "1":
        croissances[row[dirferme_col]][row[year_col]] += float(row[value_col] or 0)

with open("evolution_directions_fermes.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["year", "direction_ferme", "value"])
    for year in years:
        for ferme in directions_fermes:
            writer.writerow([year, ferme, croissances[ferme][year]])

def regress(region):
    print()
    print("Regression computation for", region)
    x_arr = []
    y_arr = []
    for key in sorted(croissances[region].keys()):
        x_arr.append(int(key))
        y_arr.append(math.log(croissances[region][key]))
    print(x_arr, y_arr)
    x = np.array(x_arr).reshape((-1, 1))
    y = np.array(y_arr)
    model = LinearRegression()
    model.fit(x, y)
    print("R²:", model.score(x, y))
    slope = model.coef_
    print("slope:", slope)
    return slope

[regress(r) for r in directions_fermes]
