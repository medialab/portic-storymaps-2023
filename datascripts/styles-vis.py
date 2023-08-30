import csv
import requests
from datetime import datetime

# see 2023-04-07-styles de navigation.ipynb for details

output = "../public/data/styles_navigation_long_cours.csv"
output2 = "../public/data/styles_navigation_long_cours_ports.csv"

# On récupère l'estimation du tonnage par type de bateau
TONNAGE_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYdeIwpzaVpY_KS91cXiHxb309iYBS4JN_1_hW-_oyeysuwcIpC2VJ5fWeZJl4tA/pub?output=csv"
download = requests.get(TONNAGE_SPREADSHEET_URL)
tonnages_estimate = {"": 0}
for row in csv.DictReader(download.content.decode("utf-8").splitlines()):
    tonnages_estimate[row["ship_class"]] = int(row["tonnage_estime_en_tx"].replace("No data", "0") or 0)

flows_to_Marseille = []
rank_Marseille = {}
with open('../data/navigo_all_flows.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['destination_function'] == "O" \
        and row["source_suite"] == "la Santé registre de patentes de Marseille":
           # and row['toponyme_fr'] == 'Marseille' \
            flows_to_Marseille.append(row)
            rank_Marseille[row["source_doc_id"]] = row["travel_rank"]

ranks_smaller_than_Marseille = []
counter_uhgs_99999 = 0
with open('../data/navigo_all_flows.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row["source_suite"] == "la Santé registre de patentes de Marseille":
            if row["destination_uhgs_id"] == 'A9999997':
                counter_uhgs_99999 += 1
                continue
            if row["source_doc_id"] in rank_Marseille:
                max_rank = rank_Marseille[row["source_doc_id"]]
                if row["travel_rank"] <= max_rank:
                    ranks_smaller_than_Marseille.append(row)

# reconstitution des voyages
from collections import defaultdict
travels = defaultdict(lambda: {"total_miles": 0, "total_steps": 0, "keep": True, "rows": []})
null_distance = 0


province_to_class = {
    'Normandie': 'Ponant', 
    'Aunis': 'Ponant', 
    'Guyenne': 'Ponant', 
    'Languedoc': 'méditerranée occidentale', 
    'Provence': 'méditerranée occidentale', 
    'Flandre': 'Ponant', 
    'Picardie': 'Ponant', 
    'Corse': 'méditerranée occidentale', 
    'Bretagne': 'Ponant',
    'Roussillon': 'méditerranée occidentale'
}
state_to_class = {
    'Etats pontificaux': 'méditerranée occidentale', 
    'Hambourg': 'Ponant', 
    #"Etats-Unis d'Amérique": '', 
    'Monaco': 'méditerranée occidentale', 
    'Provinces-Unies': 'Ponant', 
    'Prusse': 'Ponant', 
    'Grande-Bretagne': 'Ponant', 
    'République romaine': 'méditerranée occidentale', 
    'Duché de Massa et Carrare': 'méditerranée occidentale', 
    'Royaume de Naples': 'méditerranée occidentale', 
    'Malte': 'méditerranée occidentale', 
    'République\xa0ligurienne': 'méditerranée occidentale', 
    'Pologne': 'Ponant', 
    'République de Gênes': 'méditerranée occidentale', 
    'Autriche': 'Ponant', 
    'République de Raguse': 'méditerranée occidentale', 
    'Toscane': 'méditerranée occidentale', 
    'Danemark': 'Ponant',
    'République de Venise': 'méditerranée occidentale', 
    'Maroc': 'méditerranée occidentale', 
    'Espagne': 'méditerranée occidentale', 
    'Empire ottoman': 'empire ottoman', 
    'Royaume de Piémont-Sardaigne': 'méditerranée occidentale', 
    'Suède': 'Ponant', 
    'Portugal': 'Ponant', 
    'Empire russe': 'Ponant', 
    # 'France', 
    'Brême': 'Ponant', 
    'République de Lucques': 'méditerranée occidentale'
}

for row in ranks_smaller_than_Marseille:
    doc_id = row["source_doc_id"]
    travel = travels[doc_id]
    distance = row["distance_dep_dest_miles"]
    if distance and distance != '0' and travel["keep"] and row["departure_out_date"]:
        travel["total_miles"] += int(distance)
        travel["total_steps"] += 1
        travel["rows"].append(dict(row))
        # premier du voyage
        if row["travel_rank"] == "1":
            travel["tonnage"] = tonnages_estimate[row["ship_class_standardized"]] if row["ship_class_standardized"] in tonnages_estimate else 0
            travel["departure_date"] = row["departure_out_date"]
            travel["departure"] = row["departure"]
            travel["departure_latitude"] = row["departure_latitude"]
            travel["departure_longitude"] = row["departure_longitude"]
            travel["departure_state"] = row["departure_state_1789_fr"]
            
            if row["departure_state_1789_fr"] == "France":
                if row["departure_province"] in province_to_class:
                    travel["departure_class"] = province_to_class[row["departure_province"]]
            else:
                if row["departure_state_1789_fr"] in state_to_class:
                    travel["departure_class"] = state_to_class[row["departure_state_1789_fr"]]
        if row["travel_rank"] == rank_Marseille[doc_id]:
            travel["arrival_date"] = row["indate_fixed"] 
            travel["pavillon"] = row["ship_flag_standardized_fr"]
            travel["classe_bateau"] = row["ship_class_standardized"]
            year = row["indate_fixed"][:4]
            travel["year"] = year if year[-1] == "9" else year[:3]+"9"
            travel["wartimes"] = "guerre" if year in ["1759", "1779", "1799"] else "paix"
    else:
        travel["keep"] = False

# suppression des voyages invalides
good_travels = {}
error_list = []

for k, v in travels.items():
    if v["keep"] and ('<' not in v['departure_date'] and '>' not in v['departure_date']):
        travel = v.copy()
        end_time = datetime.strptime(v["arrival_date"], "%Y-%m-%d")
        try:
            start_time = datetime.strptime(v["departure_date"][:10], "%Y=%m=%d")
        except ValueError as e:
            error_list.append(e)
            continue
        travel["duration"] = (end_time - start_time).days
        if travel["duration"] == 0:
            travel["duration"] = 1
        travel["speed"] = v["total_miles"] / travel["duration"]
        travel["decade"] = v["arrival_date"][:4]
        travel.pop("keep")
        good_travels[k] = travel

travels_list = list(good_travels.values())

travels_clean = [t for t in travels_list \
                    if "departure_class" in t \
                    and t["speed"] < 300
                   ]

travels_in_peace = [t for t in travels_clean if t["wartimes"] == "paix"]
travels_in_war = [t for t in travels_clean if t["wartimes"] == "guerre"]

ports = {}
for travel in travels_in_peace:
  port = travel['departure']
  latitude = travel['departure_latitude']
  longitude = travel['departure_longitude']
  category = travel['departure_class']
  if port not in ports:
      ports[port] = {
          "port": port,
          "latitude": latitude,
          "longitude": longitude,
          "category": category,
          "count": 0
      }
  ports[port]["count"] += 1


# pre-aggregate data
categories = {}
for travel in travels_in_peace:
    tonnage = travel["tonnage"]
    category = travel["departure_class"]
    steps = str(travel["total_steps"])
    if category not in categories:
        categories[category] = {'1': {},'2': {},'3': {},'4': {},'5': {},'6': {},'7': {},'8': {},'9': {}}
    if tonnage not in categories[category][steps]:
        categories[category][steps][tonnage] = 0
    categories[category][steps][tonnage] += 1

data = []
for category, steps in categories.items():
    for nb_steps, tonnages in steps.items():
        for tonnage, count in tonnages.items(): 
            data.append({
                "category": category,
                "nb_steps": nb_steps,
                "tonnage": tonnage,
                "count": count
            })
            
with open(output, 'w') as f2:
  w = csv.DictWriter(f2, fieldnames=data[0].keys())
  w.writeheader()
  w.writerows(data)

with open(output2, 'w') as f2:
  ports = list(ports.values())
  w = csv.DictWriter(f2, fieldnames=ports[0].keys())
  w.writeheader()
  w.writerows(ports)