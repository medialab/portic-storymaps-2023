from csv import DictReader
from csv import DictWriter
from collections import Counter
import requests

ports_to_compare = {'Dunkerque', 'Bordeaux', 'Marseille', 'Le Havre', 'Lorient', 'Nantes', 'Marennes', 'Saint Malo', 'Rouen', 'La Rochelle'}

years_to_compare = {'1749', '1769', '1787', '1789'}
flag_to_nationality = {
  # "France": "France",
  # "Péninsule italienne": "",
  # "Empire ottoman": "",
  # "Espagne": "Espagne",
  # "Grande-Bretagne": "Grande-Bretagne",
  # "Provinces-Unies": "Provinces-Unies",
  "Suède": "Suède", # not present in data but present in datasprint viz (?!)

  "Autriche": "Autriche", # not present in datasprint viz
  "Duché de Massa et Carrare": "Péninsule italienne (agrégée)",
  "Empire ottoman": "Empire ottoman",
  "Espagne": "Espagne",
  "Etats pontificaux": "Péninsule italienne (agrégée)",
  "France": "France",
  "Grande-Bretagne": "Grande-Bretagne",
  "Hambourg": "Hambourg", # not present in datasprint viz
  "Malte": "Malte", # not present in datasprint viz
  # Maroc
  "Monaco": "France", # not present in datasprint viz
  "Pologne": "Pologne", # not present in datasprint viz
  "Portugal": "Portugal", # not present in datasprint viz
  "Provinces-Unies": "Provinces-Unies",
  "Principauté de Lampédouse": "Péninsule italienne (agrégée)",
  "Principauté de Piombino": "Péninsule italienne (agrégée)",
  "Royaume de Naples": "Péninsule italienne (agrégée)",
  "Royaume de Piémont-Sardaigne": "Péninsule italienne (agrégée)",
  "République de Gênes": "Péninsule italienne (agrégée)",
  "République de Lucques": "Péninsule italienne (agrégée)",
  "République de Raguse": "Péninsule italienne (agrégée)",
  "République de Venise": "Péninsule italienne (agrégée)",
  "Toscane": "Péninsule italienne (agrégée)",
  # multi-Etat
  # zone maritime
}

# 1. get online csv data
def get_online_csv(url):
  results = []
  with requests.Session() as s:
      download = s.get(url)
      decoded_content = download.content.decode('utf-8')
      reader = DictReader(decoded_content.splitlines(), delimiter=',')
      for row in reader:
        results.append(dict(row))
  return results

TONNAGE_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTYdeIwpzaVpY_KS91cXiHxb309iYBS4JN_1_hW-_oyeysuwcIpC2VJ5fWeZJl4tA/pub?output=csv'

tonnage_data = get_online_csv(TONNAGE_SPREADSHEET_URL)

# 2. build a shipclass->tx dict
tonnage_estimates = {}
for l in tonnage_data:
    estimation = l['tonnage_estime_en_tx'] or 0
    if l['tonnage_estime_en_tx'] == 'No data':
        estimation = 0
    else :
        estimation = int(estimation)
    
    ship_class = l['ship_class']
    
    tonnage_estimates[ship_class] = estimation



pointcalls = []

ports_87_strangers = {}
nationalities_89_marseille = {}



for p in ports_to_compare:
  ports_87_strangers[p] = {
    "french": 0,
    "stranger": 0
  }

flags = set()
# with open('../data/navigo_all_pointcalls.csv', newline='') as csvfile:
#     reader = DictReader(csvfile)
#     for row in reader:
#         indate_year = row['indate_fixed'].split('-')[0]
#         p = row['pointcall']
#         tonnage = float(row['tonnage'] or 0)
#         flag = row['flag'] or 'unknown'
#         ship_class = row['ship_class_standardized']
#         if indate_year == '1787' and p in ports_to_compare:
#           if flag == 'French':
#             ports_87_strangers[p]['french'] += tonnage
#           else:
#             ports_87_strangers[p]['stranger'] += tonnage
#         if indate_year == '1789' and p == 'Marseille' and flag != 'French':
#           if ship_class in tonnage_estimates:
#             tonnage = tonnage_estimates[ship_class]
#           if flag not in nationalities_89_marseille:
#             nationalities_89_marseille[flag] = 0
#           nationalities_89_marseille[flag] += tonnage
with open('../data/navigo_all_flows.csv', newline='') as csvfile:
    reader = DictReader(csvfile)
    for row in reader:
        year = row["indate_fixed"][:4]
        p = row["destination"] if year == "1789" else row["departure"] # row["destination"] if row["destination"] == "Marseille" else row['departure']
        tonnage = float(row['tonnage'] or 0)
        flag = row['flag'] or 'unknown'
        
        ship_class = row['ship_class_standardized']
        if ship_class in tonnage_estimates:
            tonnage = tonnage_estimates[ship_class]

        # for ports comparison
        if year == '1787' and p in ports_to_compare:
          if flag == 'French':
            ports_87_strangers[p]['french'] += tonnage
          else:
            ports_87_strangers[p]['stranger'] += tonnage
        # for Marseille detail
        if year == '1789' and p == 'Marseille' and flag != 'French':
          if flag not in nationalities_89_marseille:
            nationalities_89_marseille[flag] = 0
          nationalities_89_marseille[flag] += tonnage

ports_87_strangers_arr = []
for port, values in ports_87_strangers.items():
  french = values["french"]
  stranger = values["stranger"]
  share_of_strangers = stranger / (french + stranger)
  ports_87_strangers_arr.append({
    "port": port,
    "share_of_strangers": share_of_strangers
  })

nationalities_89_marseille = [{"flag": flag, "tonnage": tonnage} for flag, tonnage in nationalities_89_marseille.items()]

with open("../public/data/share_of_strangers_marseille_1789.csv", "w") as f:
      fieldnames = nationalities_89_marseille[0].keys()
      writer = DictWriter(f, fieldnames=fieldnames)
      writer.writeheader()
      writer.writerows(nationalities_89_marseille)

with open("../public/data/share_of_strangers_1787_french_ports.csv", "w") as f:
      fieldnames = ports_87_strangers_arr[0].keys()
      writer = DictWriter(f, fieldnames=fieldnames)
      writer.writeheader()
      writer.writerows(ports_87_strangers_arr)



# part des français dans les provenances de voyages arrivés à Marseille
french_shares = {}
departure_states = set()
for year in years_to_compare:
  french_shares[year] = {}
with open('../data/navigo_all_flows.csv', newline='') as csvfile:
    reader = DictReader(csvfile)
    for row in reader:
        indate_year = row['indate_fixed'].split('-')[0]
        departure_state = row['departure_state_1789_fr']
        tonnage = float(row['tonnage'] or 0)
        flag = row['flag'] or 'unknown'
        flag_field = "tonnage_french" if flag == "French" else "tonnage_not_french"
        ship_class = row['ship_class_standardized']
        if tonnage == 0:
          if ship_class in tonnage_estimates:
            tonnage = tonnage_estimates[ship_class]
        if indate_year in years_to_compare and row["destination"] == "Marseille":
          departure_states.add(departure_state)
          if departure_state not in french_shares[year]:
            french_shares[year][departure_state] = {
              "tonnage_french": 0,
              "tonnage_not_french": 0
            }
          french_shares[year][departure_state][flag_field] += tonnage

french_shares_arr = []
for year in years_to_compare:
  for state in french_shares[year].keys():
    tonnage_french = french_shares[year][departure_state]["tonnage_french"]
    tonnage_not_french = french_shares[year][departure_state]["tonnage_not_french"]
    french_shares_arr.append({
      "year": year,
      "state": state,
      "tonnage_french": tonnage_french,
      "share_of_french": tonnage_french / (tonnage_french + tonnage_not_french),
    })

with open("../public/data/compare_french_ships_to_marseille_accross_time.csv", "w") as f:
      fieldnames = french_shares_arr[0].keys()
      writer = DictWriter(f, fieldnames=fieldnames)
      writer.writeheader()
      writer.writerows(french_shares_arr)