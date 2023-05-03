import csv, casanova
from collections import defaultdict, Counter
from itertools import groupby
import math
import numpy as np

import regress 


reader = casanova.reader("../data/toflit18_all_flows.csv")



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
national_source_col = reader.headers["best_guess_national_partner"]
exchange_col = reader.headers["export_import"]
value_col = reader.headers["value"]
product_col = reader.headers["product_sitc_simplEN"]
partner_col = reader.headers["partner_grouping"]

# partenaires coloniaux
colonial_grouping_partners = set(["Outre-mers", "Afrique", "Amériques", "Asie"])
min_year = "1740"

kinds = ["total", "imports", "exports", "total_no_colonial_product", "total_no_colonial_trade", "imports_no_colonial_product", "exports_no_colonial_product", "imports_no_colonial_trade", "exports_no_colonial_trade"]

# main data
croissances = {kind:defaultdict(Counter) for kind in kinds}


years = set();

all_data = []
national_data = []
for row in reader:
    # filtrage des données
    # ommission de 1787 (données incomplètes)
    # sélection des directions des fermes et de la source best guess
    # ommission des années < 1740 pour Marseille (données incomplètes)
    # ommission des flux à valeur null
    # ommission du partenaire France car commerce connu qu'en 1789 
    if row[year_col] != "1787" and \
       row[dirferme_col] in directions_fermes and row[source_col] == "1" and \
       (row[year_col] >= "1740") and row[year_col] <= "1790" and \
       row[value_col] != '' and row[value_col] is not None and \
       row[partner_col] != 'France':
        all_data.append(row)
    if row[year_col] != "1787" and \
       row[national_source_col] == "1" and \
       row[year_col] >= "1740" and row[year_col] <= "1790" and \
       row[value_col] != '' and row[value_col] is not None and \
       row[partner_col] != 'France':
        national_data.append({'year':row[year_col], 'value': row[value_col], 'kind': row[exchange_col]})
        # TODO: export national data

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
        croissances["total"][dir_ferme][year] += total
        croissances["total_no_colonial_product"][dir_ferme][year] += total_no_colonial_product
        croissances["total_no_colonial_trade"][dir_ferme][year] += total_no_colonial_trade
    if imports_value is not None:
        croissances['imports'][dir_ferme][year] += imports_value
        croissances['imports_no_colonial_product'][dir_ferme][year] += imports_value_no_colonial_product
        croissances['imports_no_colonial_trade'][dir_ferme][year] += imports_value_no_colonial_trade
    if exports_value is not None:
        croissances['exports'][dir_ferme][year] += exports_value
        croissances['exports_no_colonial_product'][dir_ferme][year] += exports_value_no_colonial_product
        croissances['exports_no_colonial_trade'][dir_ferme][year] += exports_value_no_colonial_trade

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

peace_reg_data = {"memory":defaultdict(dict), "no_memory":defaultdict(dict)}

tradeDynamics = []
with open("../public/data/evolution_directions_fermes_local.csv", "w") as f:
    fieldnames = ["year", "direction_ferme", "value", "kind", "peace_reg_memory", "peace_reg"]
    writer = csv.DictWriter(f, fieldnames)
    writer.writeheader()
    
    for ferme in directions_fermes:
        for kind,data in croissances.items():
            # war regressions
            # with memory
            memory_war_regs = war_reg(ferme, data, kind, True)
            # loss rates are average relative difference between expected trade and measured one on war period 
            loss_rates = [(data[ferme][year] - prediction)/prediction for year, prediction in memory_war_regs.items() if data[ferme][year] != 0]
            peace_reg_data["memory"][ferme][kind]= memory_war_regs
            if len(loss_rates)>0:
                average_loss_memory[ferme][kind] = sum(loss_rates)/len(loss_rates)
                
            # no memory
            no_memory_war_regs = war_reg(ferme, data, kind, False)
            peace_reg_data["no_memory"][ferme][kind]= no_memory_war_regs
            loss_rates = [(data[ferme][year] - prediction)/prediction for year, prediction in no_memory_war_regs.items() if data[ferme][year] != 0]
            if len(loss_rates)>0:
                average_loss_no_memory[ferme][kind] = sum(loss_rates)/len(loss_rates)
            tradeDynamics = tradeDynamics + [dict(zip(
                fieldnames,
                [year, ferme, data[ferme][str(year)] if data[ferme][str(year)] != 0 else '', kind, memory_war_regs[str(year)],no_memory_war_regs[str(year)]])) for year in range(int(min_year), 1790)]
            
            writer.writerows(tradeDynamics)



reg_data = defaultdict(dict)
with open("../public/data/regressions_local.csv", "w") as f:
    fieldnames = ["direction_ferme", "kind", "score", "intercept", "slope", "avg_loss_mem", "avg_loss_no_mem"]
    writer = csv.DictWriter(f, fieldnames)
    writer.writeheader()
    for f in directions_fermes:
        for kind in kinds:

            (score, slope, y0) = regress.regress(f, croissances[kind], kind)
            dataLine = dict(zip(
                fieldnames,
                [f, kind, score, y0, slope, average_loss_memory[f][kind],average_loss_no_memory[f][kind]]
            ))
            writer.writerow(dataLine)
            reg_data[f][kind] = dataLine



directions_order = ["Marseille", "Bordeaux", "Rouen", "Nantes",  "La Rochelle", "Bayonne"]

# FRANCE TRADE

absolute_trade = defaultdict(dict)
sortKey = lambda r : r['year']
for year, _d in groupby(sorted(national_data, key=sortKey), key=sortKey):
    byKind = lambda f: f['kind']
    nb_available_kind = 0 
    total = 0
    for kind, _f in groupby(sorted(_d, key=byKind), key=byKind):
        nb_available_kind += 1
        kind_value = sum([float(f['value']) for f in _f])
        absolute_trade[year][kind.lower()] = kind_value
        total += kind_value
    if nb_available_kind == 2:
        # compute total flow by suming exports and imports onlye if both are available
        absolute_trade[year]['total'] = total


with open("../public/data/tradeDynamics_reference_france_trade.csv", "w") as f:
    output = csv.DictWriter(f, ['year', 'value', 'kind', 'reg', 'slope'])
    output.writeheader()
    _france_data_for_reg = defaultdict(dict)
    min_year = 9999
    max_year = 0
    for year, kind_value in absolute_trade.items():
        min_year = min(int(year), min_year)
        max_year = max(int(year), max_year)
        for kind, value in kind_value.items():
            _france_data_for_reg[kind][year] = value 
    # regression on France trade
    _france_reg = {}
    for kind, france_reg_data in _france_data_for_reg.items():
        (score, slope, y0) = regress.regress('france', {'france':france_reg_data}, kind)
        _france_reg[kind] = {'slope': slope, 'intercept':y0}
    for _year in range(min_year, max_year+1):
        year = str(_year)
        for kind in ["total", "exports", "imports"]:
            output.writerow({ 'year':year, 'kind': kind, 'value': absolute_trade[year][kind] if year in absolute_trade and kind in absolute_trade[year] else '', 
                                'reg': math.exp(_france_reg[kind]['slope']*float(year)+_france_reg[kind]['intercept']),
                                'slope': f'{_france_reg[kind]["slope"]*100:0.1f}' })


with open("../public/data/tradeDynamics.csv", "w") as f:
    output = csv.DictWriter(f, ['year', 'direction_ferme'] + 
                                [var for kind in kinds for var in [
                                    f"{kind}_value", 
                                    f"{kind}_relative", 
                                    f"{kind}_slope", 
                                    f"{kind}_reg", 
                                    f"{kind}_relative",
                                    f'{kind}_peace_reg_memory',
                                    f'{kind}_peace_reg_no_memory',
                                    f'{kind}_avg_war_loss_memory',
                                    f'{kind}_avg_war_loss_no_memory',
                                    ]]
                            )
    output.writeheader()
    for year in years:
        for direction in directions_fermes:   
            output.writerow({
                "year": year,
                "direction_ferme": direction,
                # trade values
                **{f'{kind}_value':croissances[kind][direction][year] if croissances[kind][direction][year] != 0 else '' for kind in kinds },
                # relative tade values
                **{f'{kind}_relative': croissances[kind][direction][year]/absolute_trade[str(year)][kind] if str(year) in absolute_trade and kind in absolute_trade[str(year)] else '' for kind in kinds },
                # slopes and reg points
                **{f'{kind}_slope': f'{float(reg_data[direction][kind]["slope"])*100:0.1f}' for kind in kinds },
                **{f'{kind}_reg': math.exp(float(reg_data[direction][kind]["slope"])*float(year)+float(reg_data[direction][kind]['intercept'])) for kind in kinds },
                # slopes and reg points war regs
                **{f'{kind}_peace_reg_memory': peace_reg_data['memory'][direction][kind][year] for kind in kinds },
                **{f'{kind}_peace_reg_no_memory': peace_reg_data['no_memory'][direction][kind][year] for kind in kinds },

                **{f'{kind}_avg_war_loss_memory': f"{float(reg_data[direction][kind]['avg_loss_mem'])*100:0.1f}%" for kind in kinds},
                **{f'{kind}_avg_war_loss_no_memory': f"{float(reg_data[direction][kind]['avg_loss_no_mem'])*100:0.1f}%" for kind in kinds},
                
                })
            

