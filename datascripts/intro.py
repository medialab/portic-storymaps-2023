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
  "Allemagne": [10.4478, 51.1638],
  "Amériques": [-66.379, 16.762],
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
  "Gênes": [8.7260246,44.4471043],
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
  "République de Raguse": [14.6690884,36.9187451],
  "Duché de Massa et Carrare": [10.0272806,44],
  "Malte": [14.2135409,35.9426153],
  "Maroc": [-8.1521827,31.6703932]
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


# toflit18 data
imports = Counter()
exports = Counter()
with open('../data/toflit18_all_flows.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
        partner = flow["partner_grouping"]
        if flow["year"] == "1789" \
          and flow["customs_region"] == "Marseille" \
          and flow["best_guess_region_prodxpart"] == "1" \
          and partner != "France" \
        :
            if partner == "Italie" or partner == "Allemagne":
               partner = flow["partner_wars"]
            if partner in ["Monde", "????", "[vide]"]:
               partner = "Inconnu"
            if flow["export_import"] == "Imports":
              imports[partner] += float(flow["value"] or 0)
            elif flow["export_import"] == "Exports":
              exports[partner] += float(flow["value"] or 0)

# navigo data
departures = {}
with open('../data/navigo_all_pointcalls.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        departure_year = row['outdate_fixed'].split('-')[0]
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
          if partner not in departures:
             departures[partner] = {
                "partner": partner,
                "tonnage": 0,
                "nb_ships": 0
             }
          departures[partner]["tonnage"] += tonnage
          departures[partner]["nb_ships"] += 1

for p in departures.keys():
   departures[p]["mean_tonnage"] = departures[p]["tonnage"] / departures[p]["nb_ships"]

print(departures["Levant et Barbarie"])

partners_names = set([k for k in imports.keys()] + [k for k in exports.keys()] + [k for k in departures.keys()])
# for p in partners_names:
#    print(p)
partners = {}
for p in partners_names:
  value = 0
  latitude = 0
  longitude = 0
  if p in exports:
    value += exports[p]
  if p in imports:
    value += imports[p]

  if p in geolocalizations:
    latitude = geolocalizations[p][0]
    longitude = geolocalizations[p][1]
  else:
     print("no geolocalization found for " + p)
  mean_tonnage = 0
  nb_ships = 0
  if p in departures:
     nb_ships = departures[p]["nb_ships"]
     mean_tonnage = departures[p]["mean_tonnage"]
  partners[p] = {
     "partner": p,
     "latitude": latitude,
     "longitude": longitude,
     "toflit_value": value,
     "navigo_mean_tonnage": mean_tonnage,
     "navigo_nb_ships": nb_ships
  }

partners = [p for p in partners.values()]

print('writing intro_data_world.csv')
with open('../public/data/intro_data_world.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=["partner", "latitude", "longitude", "toflit_value", "navigo_mean_tonnage", "navigo_nb_ships"])
    writer.writeheader()
    writer.writerows(partners)
    

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