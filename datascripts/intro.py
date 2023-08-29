import csv
import shutil
import os
import requests
import json
import sys
import os
from collections import Counter

import visvalingamwyatt as vw

geolocalizations = {
   # classification grouping
  "Inconnu": [-16.414, 43.87],
  "Afrique": [-15.414, 13.454],
  # "Allemagne": [10.4478, 51.1638],
  "Allemagne": [10.4478, 51.6],
  # "Amériques": [-66.379, 16.762],
  "Amériques": [-61.726, 16.150],
  "Angleterre": [-1.835, 52.829],
  "Asie": [76.64, -7.8],
  "Espagne": [-3.867, 40.33],
  "Flandre et autres états de l'Empereur": [4.2764, 50.8242],
  "France": [-0.483, 46.725],
  "Hollande": [4.9878, 52.2984],
  "Italie": [13.337, 41.87],
  "Levant et Barbarie": [28.597, 35.147],
  "Monde": [5.427, 40.271],
  "Nord": [18.479, 56.475],
  "Portugal": [-8.102, 38.139],
  "États-Unis d'Amérique": [-98.569, 37.545],

  # Italie
  # "Royaume de Piemont et Sardaigne": [7.6597227,40.056245],
  "Royaume de Piemont et Sardaigne": [9,38.5],
  "Gênes": [8.7260246,44.8],
  # "Gênes": [8.7260246,44.4471043],
  "États ecclésiastiques": [12.3711899,41.9102088],
  "Venise": [12.2225255,45.4046658],
  "Naples": [16,40.8],
  # "Naples": [13.9311827,40.8534471],
  "Milanais, Toscane et Lucques": [9.0953317, 46],

  # classification wars
  # "Îles": [0,0],
  # "Gênes": [0,0],
  # "Naples": [0,0],
  # "Inconnu": [-15.414, 44.87],
  # "Espagne et ses colonies": [0,0],
  # "Danemark et ses colonies": [0,0],
  # "Amérique et Inde": [0,0],
  # "Nord": [0,0],
  # "États-Unis d'Amérique et ses colonies": [-98.569, 37.545],
  # "États de l'Empereur": [0,0],
  # "???": [0,0],
  # "Villes hanséatiques": [0,0],
  # "Divers": [0,0],
  # "Suède et ses colonies": [0,0],
  # "Angleterre et ses colonies": [0,0],
  # "Prusse": [0,0],
  # "Royaume de Piemont et Sardaigne": [0,0],
  # "Colonies françaises": [0,0],
  # "Allemagne": [0,0],
  # "Milanais, Toscane et Lucques": [0,0],
  # "Portugal et ses colonies": [0,0],
  # "Hollande et ses colonies": [0,0],
  # "Venise": [0,0],
  # "Levant": [0,0],
  # "États ecclésiastiques": [0,0],

  #navigo specific
  # "République de Raguse": [14.6690884,36.9187451],
  "République de Raguse": [18.073, 42.645],
  "Duché de Massa et Carrare": [10.0272806,44],
  "Malte": [14.2135409,35.9426153],
  "Maroc": [-8.1521827,31.6703932]
}

directions_geolocs = {
  "Amiens": [2.2022809, 49.8987918],
  "Auch": [0.484152,43.6626547],
  "Bayonne": [-1.5022883,43.4844312],
  "Besançon": [5.9298594,47.2602913],
  "Bordeaux": [-0.6684127,44.8638098],
  "Caen": [-0.4134422,49.1846898],
  "Charleville": [4.6480131, 49.2],
  # "Charleville": [4.6480131, 49.7802714],
  "Châlons": [4.338868,48.9656081],
  # "Directions de terre": [],
  "Flandre": [2.260707, 50.016986],
  # "Flandre": [2.260707, 51.016986],
  # "France": [],
  "Grenoble": [5.6743405, 45.1842864],
  "La Rochelle": [-1.2176732,46.1621033],
  "Langres": [5.2951516,47.8597242],
  "Lorient": [-3.4214692,47.7494125],
  "Lyon": [4.7527295,45.7580409],
  "Marseille": [5.2158406,43.280477],
  "Montpellier": [3.8329698,43.6100709],
  "Nantes": [-1.642735,47.2383198],
  "Narbonne": [2.8688814,43.1494672],
  "Rouen": [1.0499721,49.4412841],
  "Saint-Malo": [-2.0890353,48.6463833],
  "Saint-Quentin": [3.2377845,49.847577],
  "Soisson": [3.302947,49.3765829],
  "Toulon": [5.8922396,43.1364193],
  "Valenciennes": [3.4729976,50.3620936]
}

pointcalls = []
accepted_sources = [
    # 'G5',
    # 'Expéditions coloniales Marseille (1789)', 
    'Registre du petit cabotage (1786-1787)', 
    'la Santé registre de patentes de Marseille'
  ]
partners = set()
navigo_to_toflit = {
   "Duché de Massa et Carrare": "Duché de Massa et Carrare",
  "Quatre villes hanséatiques": "Nord",
  "Espagne": "Espagne",
  "République de Lucques": "Milanais, Toscane et Lucques",
  "Suède": "Nord",
  "Hollande": "Hollande",
  "Angleterre": "Angleterre",
  "République de Gênes": "Gênes",
  "Empire ottoman": "Levant et Barbarie",
  "Etats de l'Empereur": "Flandre et autres états de l'Empereur",
  "Malte": "Malte",
  "Russie": "Nord",
  "Royaume de Naples": "Naples",
  "Prusse": "Nord",
  "République de Raguse": "République de Raguse",
  "Etats pontificaux": "États ecclésiastiques",
  "Danemark": "Nord",
  "Maroc": "Maroc",
  "Toscane": "Milanais, Toscane et Lucques",
  "Duché de Courlande": "Nord",
  "Portugal": "Portugal",
  "Royaume de Piémont-Sardaigne": "Royaume de Piemont et Sardaigne",
  "République de Venise": "Venise",
  "Etats-Unis": "États-Unis d'Amérique",
  "Monaco": "Gênes",
  "Inconnu": "Inconnu"
}
# On récupère l'estimation du tonnage par type de bateau
TONNAGE_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYdeIwpzaVpY_KS91cXiHxb309iYBS4JN_1_hW-_oyeysuwcIpC2VJ5fWeZJl4tA/pub?output=csv"
download = requests.get(TONNAGE_SPREADSHEET_URL)
tonnages_estimate = {"": 0}
for row in csv.DictReader(download.content.decode("utf-8").splitlines()):
    tonnages_estimate[row["ship_class"]] = int(row["tonnage_estime_en_tx"].replace("No data", "0") or 0)

# On récupère le décompte des sources saisies pour avoir les données des compte-rendus
COMPTE_RENDUS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNAeIEFhB_RTm2xBgeuXl5oMtNIrGhWT6uCB2S9wEUblwDidRBwv9dp8D0S-YIPUyoASaG2p-NgfWD/pub?output=csv'
download = requests.get(COMPTE_RENDUS_URL)
compte_rendus_conges = {}
for row in csv.DictReader(download.content.decode("utf-8").splitlines()):
    if row["annee"] == "1787":
       compte_rendus_conges[row["toponyme_standard_fr"]] = row["nb_conges_cr"]
ports_names_compte_rendus_conges = set(compte_rendus_conges.keys())

# toflit18 data : count international trade (by partner) and local (directions de fermes)
international_trade = Counter()
local_trade = Counter()
with open('../data/toflit18_all_flows.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
        partner = flow["partner_grouping"]
        reporter = flow["customs_region"]
        if flow["year"] == "1789" \
          and flow["customs_region"] == "Marseille" \
          and flow["best_guess_region_prodxpart"] == "1" \
          and partner != "France" \
        :
            if partner == "Italie" or partner == "Allemagne":
               partner = flow["partner_wars"]
            if partner in ["Monde", "????", "[vide]"]:
               partner = "Inconnu"
            international_trade[partner] += float(flow["value"] or 0)
        if flow["year"] == "1789" \
          and flow["best_guess_region_prodxpart"] == "1" \
          and partner != "France" \
          and reporter not in ["France", "Directions de terre"] \
        :
            local_trade[reporter] += float(flow["value"] or 0)

# navigo data
international_departures = {}
local_departures = {}
directions_for_compte_rendu = {}
ports_without_ferme = set()
brits = set()
with open('../data/navigo_all_pointcalls.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        departure_year = row['outdate_fixed'].split('-')[0]
        # international 1789 Marseille
        if row["source_suite"] in accepted_sources \
          and departure_year == "1789"\
          and int(float(row["pointcall_rank_dedieu"])) == 1 \
          and row["state_fr"] != "France" \
        :
          partner = row["partner_balance_1789"]
          if partner == "":
             if row["state_fr"] != "":
              partner = row["state_fr"]
             else:
                partner = "Inconnu"
          if partner in navigo_to_toflit:
             partner = navigo_to_toflit[partner]
          else:
             print("partner can't be aligned : ", partner)
          
          tonnage = "" # row["tonnage"]
          if tonnage == "":
             ship_class = row["ship_class_standardized"]
             if ship_class in tonnages_estimate:
                tonnage = tonnages_estimate[ship_class]
          tonnage = int(tonnage or 0)
          # remove peche
          if partner == "Angleterre" and "terreneuve" in row["pointcall"].lower() or "terre neuve" in row["pointcall"].lower():
             continue
          if partner not in international_departures:
             international_departures[partner] = {
                "partner": partner,
                "tonnage": 0,
                "nb_ships": 0
             }
          international_departures[partner]["tonnage"] += tonnage
          international_departures[partner]["nb_ships"] += 1
        # local all 1787
        if departure_year == "1787"\
          and row["state_fr"] == "France" \
          and row["pointcall_action"] == "Out" \
        :
          locality = row["toponyme_fr"]
          # locality = row["ferme_direction"]
          # if locality == "Lille":
          #    locality = "Flandre"
          # if locality == "":
          #    ports_without_ferme.add(row["toponyme_fr"])
          #    continue
          tonnage = row["tonnage"]
          tonnage = int(float(tonnage or 0))
          if locality not in local_departures:
             local_departures[locality] = {
                "partner": partner,
                "tonnage": 0,
                "nb_ships": 0,
                "nb_ships_cr": 0,
                "latitude": row["latitude"],
                "longitude": row["longitude"]
             }
          local_departures[locality]["tonnage"] += tonnage
          local_departures[locality]["nb_ships"] += 1
          if row["toponyme_fr"] in ports_names_compte_rendus_conges:
            directions_for_compte_rendu[row["toponyme_fr"]] = locality
for p in international_departures.keys():
   international_departures[p]["mean_tonnage"] = international_departures[p]["tonnage"] / international_departures[p]["nb_ships"]
for p in local_departures.keys():
   local_departures[p]["mean_tonnage"] = local_departures[p]["tonnage"] / local_departures[p]["nb_ships"]

# fixing number of congés with compte rendus data
for port, cr_conges in compte_rendus_conges.items():
  if port in local_departures:
     local_departures[port]["nb_ships_cr"] = int(cr_conges or 0)
  #  if port in directions_for_compte_rendu:
  #     direction = directions_for_compte_rendu[port]
  #     if "nb_ships_cr" not in local_departures[direction]:
  #       local_departures[direction]["nb_ships_cr"] = 0
  #     local_departures[direction]["nb_ships_cr"] += int(cr_conges or 0)

# print('ports without ferme : ', ports_without_ferme)

localities_names = set([k for k in local_trade.keys()] + [k for k in local_departures.keys()])
partners_names = set([k for k in international_trade.keys()] + [k for k in international_departures.keys()])

partners = {}
for p in partners_names:
  value = international_trade[p]
  latitude = 0
  longitude = 0

  if p in geolocalizations:
    latitude = geolocalizations[p][0]
    longitude = geolocalizations[p][1]
  elif p in local_departures:
     latitude = local_departures[p]["longitude"]
     longitude = local_departures[p]["latitude"]
  else:
     print("no geolocalization found for " + p)
  mean_tonnage = 0
  nb_ships = 0
  if p in international_departures:
     nb_ships = international_departures[p]["nb_ships"]
     mean_tonnage = international_departures[p]["mean_tonnage"]
  partners[p] = {
     "partner": p,
     "latitude": latitude,
     "longitude": longitude,
     "toflit_value": value,
     "navigo_mean_tonnage": mean_tonnage,
     "navigo_nb_ships": nb_ships,
     "scope": "world"
  }

localities = {}
for p in localities_names:
  value = local_trade[p] if p in local_trade else 0
  latitude = 0
  longitude = 0
  if p in directions_geolocs:
    latitude = directions_geolocs[p][0]
    longitude = directions_geolocs[p][1]
  elif p in local_departures:
     latitude = local_departures[p]["longitude"]
     longitude = local_departures[p]["latitude"]
  else:
     print("no geolocalization found for " + p)
  mean_tonnage = 0
  nb_ships = 0
  nb_ships_cr = 0
  if p in local_departures:
     nb_ships = local_departures[p]["nb_ships"]
     nb_ships_cr = local_departures[p]["nb_ships_cr"]
     mean_tonnage = local_departures[p]["mean_tonnage"]
  partners[p] = {
     "partner": p,
     "latitude": latitude,
     "longitude": longitude,
     "toflit_value": value,
     "navigo_mean_tonnage": mean_tonnage,
     "navigo_nb_ships": nb_ships_cr,
     "scope": "france",   
     "navigo_nb_ships_pointcalls": nb_ships
  }
   
partners = [p for p in partners.values()]
localities = [p for p in localities.values()]

print('writing intro_data_world.csv')
with open('../public/data/intro_data_world.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=["partner", "latitude", "longitude", "toflit_value", "navigo_mean_tonnage", "navigo_nb_ships", "scope", "navigo_nb_ships_pointcalls"])
    writer.writeheader()
    writer.writerows(partners)
    writer.writerows(localities)
    

# input_path = "./resources/intro_map.geojson"
# output_path = "../public/data/map_backgrounds/intro_map.geojson"
# output_folder_path = "../public/data/map_backgrounds"
# print('copying intro map')
# if not os.path.exists(output_folder_path):
#    os.makedirs(output_folder_path)
# shutil.copyfile(input_path, output_path)

GEOJSON_URL = 'https://raw.githubusercontent.com/medialab/portic-storymaps-2021/main/public/data/map_backgrounds/map_cartoweb_world_1789_29juillet2021_mixte4326_geojson_UTF8.geojson'
GEOJSON_FOLDER_PATH = '../public/data/map_backgrounds/'
GEOJSON_FILE_NAME = 'intro_map.geojson'
KEEP_POINTS_RATIO = 0.001 # raised ratio = more points = more size
# KEEP_POINTS_RATIO = 0.2 # raised ratio = more points = more size

NO_SIMPLIFY_LIST = {
    # 'Poitou',
    # 'Aunis',
    # 'Saintonge',
    # 'Bretagne',
    # 'Anjou',
    # 'Saumurois',
    # 'Angoumois',
  # 'Normandie', 
  # 'Grande-Bretagne', 
  # 'Picardie', 
  # 'Bretagne'
}

with requests.Session() as s:
    print('Get .geojson file')
    download = s.get(GEOJSON_URL)
    decoded_content = download.content.decode('utf-8')
    json_content = json.loads(decoded_content)
    features = json_content['features']
    print('Simplify features')
    for i, feature in enumerate(features):
        # if feature['properties']['dominant'] not in ACCEPTED_LIST:
        #     del json_content['features'][i]
        if feature['properties']['shortname'] in NO_SIMPLIFY_LIST:
            continue
        feature_simplify = vw.simplify_feature(feature, threshold=KEEP_POINTS_RATIO)
        coordinates_simplify = feature_simplify['geometry']['coordinates']
        json_content['features'][i]['geometry']['coordinates'] = coordinates_simplify
        # sys.stdout.write("\rSimplify %i" % i) ; sys.stdout.flush() # consol print
    if not os.path.exists(GEOJSON_FOLDER_PATH):
      os.mkdir(GEOJSON_FOLDER_PATH)
    with open(GEOJSON_FOLDER_PATH + GEOJSON_FILE_NAME, "w") as geojson_file:
        geojson_file_content = json.dumps(json_content)
        geojson_file.write(geojson_file_content)