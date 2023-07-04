from csv import DictReader, DictWriter
from collections import defaultdict
import math

directions_order = ["Marseille", "Bordeaux", "Rouen", "Nantes",  "La Rochelle", "Bayonne"]

data = []

with open("module_intro_C/evolution_directions_fermes_local.csv", "r") as data_f, open("module_intro_C/regressions_local.csv", "r") as reg_data_f:
    reg_data = defaultdict(dict)
    for f in list(DictReader(reg_data_f)):
        reg_data[f['direction_ferme']][f['kind']] = f
    for d in DictReader(data_f):
        slope = float(reg_data[d['direction_ferme']][d['kind']]['slope'])
        data.append({
            "year": d['year'],
            "data_type": "trade",
            "value": float(d['value']) if d['value']!='' else None, 
            "kind" : d['kind'],
            "slope" : f"{d['direction_ferme']} {'+' if slope>0 else ''}{slope*100:0.1f}%/an",
            "reg_point": math.exp(slope*float(d['year'])+float(reg_data[d['direction_ferme']][d['kind']]['intercept'])) ,
            "peace_reg_memory": float(d['peace_reg_memory']) if d['peace_reg_memory'] !='' else None,
            "peace_reg": float(d['peace_reg']) if d['peace_reg'] !='' else None,
            "direction_ferme": d['direction_ferme'],
            "column_order": directions_order.index(d['direction_ferme']),
            "avg_loss_mem": f"Perte memoire{float(reg_data[d['direction_ferme']][d['kind']]['avg_loss_mem'])*100:0.1f}%",
            "avg_loss_no_mem": f"Perte {float(reg_data[d['direction_ferme']][d['kind']]['avg_loss_no_mem'])*100:0.1f}%"
            })


with open('module_intro_C/war_navigo.csv', 'r') as f1:
  r = DictReader(f1)
  for year in r:
    data.append({
      "year": year["year"],
      "data_type": "navigation",
      "value": float(d['value']) if d['value']!='' else None, 
      # "kind" : ,
      # "slope" : ,
      # "reg_point": ,
      "peace_reg_memory": year["reg_mem"],
      "peace_reg": year["reg_no_mem"],
      # "direction_ferme": d['direction_ferme'],
      # "column_order": directions_order.index(d['direction_ferme']),
      "avg_loss_mem": year["avg_loss"],
      "avg_loss_no_mem": year["avg_loss_no_mem"],
    })


with open("../public/data/impact-guerre-sur-croissance.csv", 'w') as f2:
  w = DictWriter(f2, fieldnames=data[0].keys())
  w.writeheader()
  w.writerows(data)