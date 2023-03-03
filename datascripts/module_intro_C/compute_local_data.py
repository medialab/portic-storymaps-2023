import csv, casanova
from collections import defaultdict, Counter
from itertools import groupby
import math
import numpy as np
from sklearn.linear_model import LinearRegression

import regress 


reader = casanova.reader("../../data/toflit18_all_flows.csv")


directions_fermes = ["Marseille", "Rouen", "Bordeaux", "Nantes", "Bayonne", "La Rochelle"]
# stop years are excluded
         
wars = [
    range(1744, 1749), #succession Autriche
    range(1756, 1764), # guerre de sepr ans
    range(1776, 1784) # guerre d'indépendance de l'amérique du nord
]


year_col = reader.headers["year"]
dirferme_col = reader.headers["customs_region"]
source_col = reader.headers["best_guess_region_prodxpart"]
exchange_col = reader.headers["export_import"]
value_col = reader.headers["value"]
product_col = reader.headers["product_sitc_simplEN"]
partner_col = reader.headers["partner_grouping"]

# totaux
croissances = defaultdict(Counter)
croissances_no_colonial_product = defaultdict(Counter)
croissances_no_colonial_trade = defaultdict(Counter)
# imports
croissances_imports = defaultdict(Counter)
croissances_imports_no_colonial_product = defaultdict(Counter)
croissances_imports_no_colonial_trade = defaultdict(Counter)
# exports
croissances_exports = defaultdict(Counter)
croissances_exports_no_colonial_product = defaultdict(Counter)
croissances_exports_no_colonial_trade = defaultdict(Counter)

# partenaires coloniaux
colonial_grouping_partners = set(["Outre-mers", "Afrique", "Amériques", "Asie"])
min_year = "1716"

years = set();

all_data= []
for row in reader:
    # filtrage des données
    # ommission de 1787 (données incomplètes)
    # sélection des directions des fermes et de la source best guess
    # ommission des années < 1740 pour Marseille (données incomplètes)
    # ommission des flux à valeur null
    # ommission du partenaire France car commerce connu qu'en 1789 
    if row[year_col] != "1787" and \
       row[dirferme_col] in directions_fermes and row[source_col] == "1" and \
       (row[dirferme_col] != "Marseille" or row[year_col] >= "1740") and \
       row[value_col] != '' and row[value_col] is not None and \
       row[partner_col] != 'France':
        all_data.append(row)

for ((year, dir_ferme), _rows) in groupby(all_data, key= lambda r: (r[year_col],r[dirferme_col])):
    rows = list(_rows)

    # calcul des séries en trois versions : tout, tout sauf produits coloniaux, tout sauf produits coloniaux et partenaires colonies
    imports = [float(row[value_col]) for row in rows if row[exchange_col] == "Imports"]
    imports_value_no_colonial_product = sum([float(row[value_col]) for row in rows if row[exchange_col] == "Imports" and row[product_col] != "Plantation foodstuffs"])
    imports_value_no_colonial_trade = sum([float(row[value_col]) for row in rows if row[exchange_col] == "Imports" and row[product_col] != "Plantation foodstuffs" and row[partner_col] not in colonial_grouping_partners])
   
    exports = [float(row[value_col]) for row in rows if row[exchange_col] == "Exports"]
    exports_value_no_colonial_product = sum([float(row[value_col]) for row in rows if row[exchange_col] == "Exports" and row[product_col] != "Plantation foodstuffs"])
    exports_value_no_colonial_trade = sum([float(row[value_col]) for row in rows if row[exchange_col] == "Imports" and row[product_col] != "Plantation foodstuffs" and row[partner_col] not in colonial_grouping_partners])

    # on ne crée pas de zéro si valeus manquantes
    imports_value = sum(imports) if len(imports) > 0 else None
    exports_value = sum(exports) if len(exports) > 0 else None
    total = imports_value + exports_value if imports_value and exports_value else None
    total_no_colonial_product = imports_value_no_colonial_product + exports_value_no_colonial_product if len(imports) >0 and len(exports) > 0 else None
    total_no_colonial_trade = imports_value_no_colonial_trade + exports_value_no_colonial_trade if len(imports) >0 and len(exports) > 0 else None

    years.add(year);
    
    # aggrégation des données par ferme par année
    if total is not None:
        croissances[dir_ferme][year] += total
        croissances_no_colonial_product[dir_ferme][year] += total_no_colonial_product
        croissances_no_colonial_trade[dir_ferme][year] += total_no_colonial_trade
    if imports_value is not None:
        croissances_imports[dir_ferme][year] += imports_value
        croissances_imports_no_colonial_product[dir_ferme][year] += imports_value_no_colonial_product
        croissances_imports_no_colonial_trade[dir_ferme][year] += imports_value_no_colonial_trade
    if exports_value is not None:
        croissances_exports[dir_ferme][year] += exports_value
        croissances_exports_no_colonial_product[dir_ferme][year] += exports_value_no_colonial_product
        croissances_exports_no_colonial_trade[dir_ferme][year] += exports_value_no_colonial_trade

def war_reg(f, data, label, memory):
    # régression sur les périodes de guerre
    reg_data = defaultdict(str)
    for war_index in range(len(wars)):
        # all precedent wars years 
        wars_years =  [year for i in range(0, war_index) for year in wars[i]]
        
        # memory all peace years before the war
        # no memory all peace years before the war and after the previous war
        no_wars_years = [y for y in range(int(min_year) if memory or war_index == 0 else wars[war_index -1][-1], wars[war_index][0]) if y not in wars_years]
        
        no_wars_data = {year: value for year,value in data[f].items() if int(year) in no_wars_years }
        if len(no_wars_data) >0:
            (score, slope, y0) = regress.regress(f, {f:no_wars_data}, "-".join([str(y) for y in wars[war_index]]))
            for year in wars[war_index]:
                reg_data[str(year)] = math.exp(slope*year+y0)

    return reg_data


average_loss_memory = defaultdict(dict)
average_loss_no_memory = defaultdict(dict)
with open("evolution_directions_fermes_local.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["year", "direction_ferme", "value", "kind", "peace_reg_memory", "peace_reg"])
    
    for ferme in directions_fermes:
        for data,label in [(croissances, 'total'), (croissances_imports, 'imports'), (croissances_exports, "exports"), (croissances_no_colonial_product, "total_no_colonial_product"), (croissances_no_colonial_trade, "total_no_colonial_trade"), (croissances_imports_no_colonial_product, "imports_no_colonial_product"), (croissances_exports_no_colonial_product, "exports_no_colonial_product"), (croissances_imports_no_colonial_trade, 'imports_no_colonial_trade' ), (croissances_exports_no_colonial_trade, 'exports_no_colonial_trade')]:
            # war regressions
            # with memory
            memory_war_regs = war_reg(ferme, data, label, True)
            # loss rates are average relative difference between expected trade and measured one on war period 
            loss_rates = [(data[ferme][year] - prediction)/prediction for year, prediction in memory_war_regs.items() if data[ferme][year] != 0]
            if len(loss_rates)>0:
                average_loss_memory[ferme][label] = sum(loss_rates)/len(loss_rates)
                print("average loss memory", ferme, label,  average_loss_memory[ferme][label] )
            # no memory
            no_memory_war_regs = war_reg(ferme, data, label, False)
            loss_rates = [(data[ferme][year] - prediction)/prediction for year, prediction in no_memory_war_regs.items() if data[ferme][year] != 0]
            if len(loss_rates)>0:
                average_loss_no_memory[ferme][label] = sum(loss_rates)/len(loss_rates)
                print("average loss no memory", ferme, label, average_loss_no_memory[ferme][label] )
            
            writer.writerows([[year, ferme, data[ferme][str(year)] if data[ferme][str(year)] != 0 else '', label, memory_war_regs[str(year)],no_memory_war_regs[str(year)]] for year in range(int(min_year), 1790)])



with open("regressions_local.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["direction_ferme", "kind", "score", "intercept", "slope", "avg_loss_mem", "avg_loss_no_mem"])
    for f in directions_fermes:
        (score, slope, y0) = regress.regress(f, croissances, "total")
        writer.writerow([f, "total", score, y0, slope, average_loss_memory[f]["total"],average_loss_no_memory[f]["total"]])
        (score, slope, y0) = regress.regress(f, croissances_imports, "imports")
        writer.writerow([f, "imports", score, y0, slope, average_loss_memory[f]["imports"],average_loss_no_memory[f]["imports"]])
        (score, slope, y0) = regress.regress(f, croissances_exports, "exports")
        writer.writerow([f, "exports", score, y0, slope, average_loss_memory[f]["exports"],average_loss_no_memory[f]["exports"]])
        (score, slope, y0) = regress.regress(f, croissances_no_colonial_product, "total_no_colonial_product")
        writer.writerow([f, "total_no_colonial_product", score, y0, slope, average_loss_memory[f]["total_no_colonial_product"],average_loss_no_memory[f]["total_no_colonial_product"]])
        (score, slope, y0) = regress.regress(f, croissances_no_colonial_trade, "total_no_colonial_trade")
        writer.writerow([f, "total_no_colonial_trade", score, y0, slope, average_loss_memory[f]["total_no_colonial_trade"],average_loss_no_memory[f]["total_no_colonial_trade"]])
        (score, slope, y0) = regress.regress(f, croissances_imports_no_colonial_product, "imports_no_colonial_product")
        writer.writerow([f, "imports_no_colonial_product", score, y0, slope, average_loss_memory[f]["imports_no_colonial_product"],average_loss_no_memory[f]["imports_no_colonial_product"]])
        (score, slope, y0) = regress.regress(f, croissances_exports_no_colonial_product, "exports_no_colonial_product")
        writer.writerow([f, "exports_no_colonial_product", score, y0, slope, average_loss_memory[f]["exports_no_colonial_product"],average_loss_no_memory[f]["exports_no_colonial_product"]])
        (score, slope, y0) = regress.regress(f, croissances_imports_no_colonial_trade, "imports_no_colonial_trade")
        writer.writerow([f, "imports_no_colonial_trade", score, y0, slope, average_loss_memory[f]["imports_no_colonial_trade"],average_loss_no_memory[f]["imports_no_colonial_trade"]])
        (score, slope, y0) = regress.regress(f, croissances_exports_no_colonial_trade, "exports_no_colonial_trade")
        writer.writerow([f, "exports_no_colonial_trade", score, y0, slope, average_loss_memory[f]["exports_no_colonial_trade"],average_loss_no_memory[f]["exports_no_colonial_trade"]])



