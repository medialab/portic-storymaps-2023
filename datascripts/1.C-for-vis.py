from collections import Counter
import requests
from itertools import groupby
import csv
from pprint import pprint

toflit_output_path = "../public/data/origins_for_marseille_exports.csv"
navigo_output_path = "../public/data/navigation_frlevant_to_marseille.csv"


def get_online_csv(url):
  results = []
  with requests.Session() as s:
      download = s.get(url)
      decoded_content = download.content.decode('utf-8')
      reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
      for row in reader:
        results.append(dict(row))
  return results


arriere_pays = ["Corse", "Provence", "Languedoc", "Roussillon"]

pointcalls_observations_Marseille = []
with open('../data/navigo_all_pointcalls.csv', newline='', encoding='utf8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['date_fixed'].split('-')[0] == '1789' \
        and row['pointcall_function'] == "O" \
        and (row["source_suite"] == "Registre du petit cabotage (1786-1787)" \
             or row["source_suite"] == "la Santé registre de patentes de Marseille") \
        and row['net_route_marker'] != "Q":
           # and row['toponyme_fr'] == 'Marseille' \
            pointcalls_observations_Marseille.append(row)
pointcalls_before_Marseille = []
with open('../data/navigo_all_pointcalls.csv', newline='', encoding='utf8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['date_fixed'].split('-')[0] == '1789' \
        and (row["source_suite"] == "Registre du petit cabotage (1786-1787)" \
             or row["source_suite"] == "la Santé registre de patentes de Marseille") \
        and row['net_route_marker'] != "Q":
           # and row['toponyme_fr'] == 'Marseille' \
            pointcalls_before_Marseille.append(row)

# possible todo if we want to simplify number of port objects : join corse and roussillon
# toponyme_counter_corse = Counter([point["toponyme_fr"] for point in pointcalls_before_Marseille if point["pointcall_province"] == "Corse"])
# toponyme_counter_roussillon = Counter([point["toponyme_fr"] for point in pointcalls_before_Marseille if point["pointcall_province"] == "Roussillon"])

rank_Marseille = {}
for row in pointcalls_observations_Marseille:
    rank_Marseille[row["source_doc_id"]] = row["pointcall_rank_dedieu"]
ranks_smaller_than_Marseille = []
for row in pointcalls_before_Marseille:
    if row["source_doc_id"] in rank_Marseille:
        max_rank = rank_Marseille[row["source_doc_id"]]
        if row["pointcall_rank_dedieu"] < max_rank:
            ranks_smaller_than_Marseille.append(row)

departures = {}
for p in ranks_smaller_than_Marseille:
  port = p["toponyme_fr"]
  id = p["pointcall_uhgs_id"]
  province = p["pointcall_province"]
  if province in arriere_pays:
    if id not in departures:
      departures[id] = {
        "count_to_marseille": 0,
        "latitude": p["latitude"],
        "longitude": p["longitude"],
        "province": province,
        "port": port
      }
    departures[id]["count_to_marseille"] += 1
#sorties_g5 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNAeIEFhB_RTm2xBgeuXl5oMtNIrGhWT6uCB2S9wEUblwDidRBwv9dp8D0S-YIPUyoASaG2p-NgfWD/pub?output=csv'
#1er mars : Mise à jour du fichier avec ajaccio : 110 sorties en 1789 qui sortiront de Corse
sorties_g5 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS1YPWol3pcsjiTlDPVPW9ZVpWeu2wcIoobEM_c-MKk9YfeIMvmanCCoPEFjPA0xUPJEnQ9hM4AAgwI/pub?output=csv'
sorties_g5 = get_online_csv(sorties_g5)

g5_map = {}
for p in sorties_g5:
  if p["annee"] == "1789":
    id = p["uhgs_id"]
    port = p["toponyme_standard_fr"]
    count = p["nb_conges_cr"]
    g5_map[id] = {
      "port": port,
      "count": count
    }

for id in departures.keys():
  if id in g5_map:
    count_total = g5_map[id]["count"]
    departures[id]["count_total"] = count_total
    departures[id]["ratio_to_marseille"] = int(departures[id]["count_to_marseille"]) / int(count_total)

with open(navigo_output_path, 'w') as f2:
  data = [val for val in departures.values()]
  print(data)
  w = csv.DictWriter(f2, fieldnames=data[0])
  w.writeheader()
  w.writerows(data)

#========================================================================
#========================================================================
#========================================================================
#========================================================================
#========================================================================

with open('../data/toflit18_all_flows.csv', 'r') as f1:
    r = csv.DictReader(f1)
    local = Counter({})
    national = Counter({})
    for row in r:
      origin = row['origin_province'] or 'inconnue'
      value = float(row['value'] or 0)
      if  row['year'] == "1789" and \
          row['export_import'] == 'Exports':
          if row['best_guess_region_prodxpart'] == '1' and \
             row['partner_simplification'] == "Marseille" and \
             row['customs_region'] != 'Marseille' \
            :
            local.update({origin: value})
          if row['best_guess_region_prodxpart'] == '1' \
            :
            national.update({origin: value})
    data = [{"origin": origin, "value": value, "scope": "Marseille"} for origin, value in local.items()] + [{"origin": origin, "value": value, "scope": "France"} for origin, value in national.items()]
    with open(toflit_output_path, 'w') as f2:
      w = csv.DictWriter(f2, fieldnames=['origin', 'value', 'scope'])
      w.writeheader()
      w.writerows(data)
