import csv
import regress
import math
from collections import defaultdict

# stop years are excluded
wars = [range(1744, 1749), range(1756, 1764), range(1776, 1784), range(1793,1802)]
min_year= "1726"

def war_reg(data, memory):
    reg_data = defaultdict(str)
    for war_index in range(len(wars)):
        wars_years =  [year for i in range(0, war_index) for year in wars[i]]
        
        # memory all peace years before the war
        # no memory all peace years before the war and after the previous war
        no_wars_years = [y for y in range(int(min_year) if memory or war_index == 0 else wars[war_index -1][-1], wars[war_index][0]) if y not in wars_years]
        
        no_wars_data = {year: int(value) for year,value in data.items() if int(year) in no_wars_years }
        if len(no_wars_data) >0:
            (score, slope, y0) = regress.regress('carriere', {'carriere':no_wars_data}, "-".join([str(y) for y in wars[war_index]]))
            for year in wars[war_index]:
                reg_data[str(year)] = math.exp(slope*year+y0)
    return reg_data
            
years = set()
with open("entrees_navigo_marseille.csv", "r") as f, open("../module_3B/mileage_total_moyen.csv", 'r') as mileage_f, open("../module_3B/tonnages_totaux.csv", "r") as tonnage_f:
    carriere = defaultdict(str)
    navigo = defaultdict(lambda:defaultdict(str))
    for row in csv.DictReader(f):
        years.add(row['annee'])
        if row['nb_carriere'] != '':
            carriere[row['annee']] = int(row['nb_carriere'])
        if row['nb_navigo'] != '':
            navigo['entrées'][row['annee']] = int(row['nb_navigo'])
    for row in csv.DictReader(mileage_f):
        if row['mileage_total'] != '':
            navigo["mileage_total"][row['annee']]= int(row['mileage_total'])
    for row in csv.DictReader(tonnage_f):
        if row['tonnage'] != '':
            navigo["tonnage"][row['annee']]= int(row['tonnage'])
        
    years = sorted(list(years)) 
    # carriere
    reg_memory = war_reg(carriere, True)
    reg_no_memory = war_reg(carriere, False)

    # navigo
    war_years = [str(y) for ys in wars for y in ys]
    reg_navigo = defaultdict(lambda:defaultdict(str))
    slope_navigo = defaultdict(lambda:defaultdict(str))

    (score, slope, y0) = regress.regress("carriere", {"carriere": carriere},"")
    slope_carriere = slope
    average_loss_navigo={}
    for variable, data in navigo.items():
        data_peace_navigo = {year:int(value) for year,value in navigo[variable].items() if year not in war_years}
        print(variable, data_peace_navigo)
        (score, slope, y0) = regress.regress("navigo tonnage", {"navigo tonnage": data_peace_navigo},"")
        for year in years:
            reg_navigo[variable][year] = math.exp(slope*int(year)+y0)
            slope_navigo[variable][year] = slope
  
        navigo_loss_rates = [(navigo[variable][year] - reg_navigo[variable][year])/reg_navigo[variable][year] for year in war_years if navigo[variable][year] != '']
        average_loss_navigo[variable] = 0
        if len(navigo_loss_rates)>0:
            average_loss_navigo[variable] = sum(navigo_loss_rates)/len(navigo_loss_rates)
            print("average loss navigo", average_loss_navigo[variable])
    
    carriere_loss_rates = [(carriere[year] - reg_memory[year])/reg_memory[year] for year in war_years if carriere[year] != '']
    if len(carriere_loss_rates)>0:
        average_loss_carriere_mem = sum(carriere_loss_rates)/len(carriere_loss_rates)
        print("average loss carriere mem", average_loss_carriere_mem )
    
    carriere_loss_rates_no_mem = [(carriere[year] - reg_no_memory[year])/reg_no_memory[year] for year in war_years if carriere[year] != '']
    if len(carriere_loss_rates_no_mem)>0:
        average_loss_carriere_no_mem = sum(carriere_loss_rates_no_mem)/len(carriere_loss_rates_no_mem)
        print("average loss carriere no mem", average_loss_carriere_no_mem )
        
    with open("war_navigo.csv", "w") as of:
        writer = csv.DictWriter(of, ["year", "source","entrées", "reg_mem", "reg_no_mem", "avg_loss_label", "avg_loss", "avg_loss_no_mem",  "avg_loss_no_mem_label", "slope"])

        writer.writeheader()
        for year in years:
            # print('carrière slope', slope_carriere);
            writer.writerow({
                "year": year,
                "source": "Carriere",
                "entrées" : carriere[year],
                "reg_mem": reg_memory[year],
                "reg_no_mem": reg_no_memory[year],
                "slope": slope_carriere,
                "avg_loss_label": f"Perte memoire{average_loss_carriere_mem*100:0.1f}%",
                "avg_loss_no_mem_label": f"Perte {average_loss_carriere_no_mem*100:0.1f}%",
                "avg_loss":average_loss_carriere_mem,
                "avg_loss_no_mem": average_loss_carriere_no_mem
            })
                
            for variable in ["entrées", "mileage_total", "tonnage"]:
                writer.writerow({
                    "year": year,
                    "source": f"Navigo {variable}",
                    "entrées" : navigo[variable][year],
                    "reg_mem": reg_navigo[variable][year],
                    "reg_no_mem": "",
                    "avg_loss_label": f"Perte memoire{average_loss_navigo[variable]*100:0.1f}%",
                    "avg_loss":average_loss_navigo[variable],
                    "avg_loss_no_mem": "",
                    "slope": slope_navigo[variable][year]
                })                

