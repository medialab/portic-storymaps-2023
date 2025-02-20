import csv
import requests

navigo_output = "../public/data/navigation_depuis_levant.csv"


# 1. get online csv data
def get_online_csv(url):
  results = []
  with requests.Session() as s:
      download = s.get(url)
      decoded_content = download.content.decode('utf-8')
      reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
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

accepted_years = {1749, 1759, 1769, 1779, 1787, 1789, 1799}
ports = {}
with open('../data/navigo_all_flows.csv', newline='', encoding='utf8') as csvfile:
  reader = csv.DictReader(csvfile)
  for flow in reader:
    if flow["departure_state_1789_fr"] == "Empire ottoman" \
      and (flow["source_suite"] == "Registre du petit cabotage (1786-1787)" \
             or flow["source_suite"] == "la Santé registre de patentes de Marseille") \
      :
      port = flow["departure_fr"]
      port_fr = flow["departure_fr"]
      port_en = flow["departure_en"]
      tonnage = flow["tonnage"]
      ship_class = flow["ship_class_standardized"]
      year = int(flow["outdate_fixed"].split('-')[0])
      if year not in accepted_years:
        continue
      if ship_class in tonnage_estimates:
        tonnage = tonnage_estimates[ship_class]
      if port not in ports:
        ports[port] = {
          "port": port,
          "port_fr": port_fr,
          "port_en": port_en,
          "latitude": flow["departure_latitude"],
          "longitude": flow["departure_longitude"],
          "tonnage": 0,
          "count": 0
        }
      ports[port]["tonnage"] += int(tonnage or 0)
      ports[port]["count"] += 1
data = list(ports.values())
with open(navigo_output, 'w') as f2:
  w = csv.DictWriter(f2, fieldnames=data[0].keys())
  w.writeheader()
  w.writerows(data)

toflit_output = "../public/data/evolution-exports-levant.csv"

grouping_to_groups = {
  "Italie": "Italie & Espagne",
  "Espagne": "Italie & Espagne",
  "Levant et Barbarie": "Levant & Barbarie",
  "Angleterre": "Angleterre & Amérique du Nord",
  # "Amériques": "Angleterre & Amérique du Nord",
  "États-Unis d'Amérique": "Angleterre & Amérique du Nord",
  "Afrique": "Colonies françaises",
  "Amériques": "Colonies françaises",
  "Nord": "Nord, Hollande & Flandres",
  "Hollande": "Nord, Hollande & Flandres",
  "Flandre et autres états de l'Empereur": "Nord, Hollande & Flandres",
  # "": "Colonies françaises"
}
groups = set(grouping_to_groups.values())

years = {}
with open('../data/toflit18_all_flows.csv', 'r') as f1:
    r = csv.DictReader(f1)
    for flow in r:
      partner = flow["partner_grouping"]
      value = float(flow["value"] or 0)
      year = flow["year"]
      if    flow["best_guess_region_prodxpart"] == "1" \
        and flow['customs_region'] == 'Marseille' \
        and year != "1787":
        if year not in years:
          years[year] = {
            "total": 0,
            "year": year,
          }
        # register import value per group
        if flow["export_import"] == "Imports":
          # pas pris pour colonies françaises : Ports et pays de France à l'instar de l'étranger, Îles françaises
          if flow["partner_simplification"] in ["Guinée et Sénégal", "Îles françaises de l'Amérique"]:
            group = "Colonies françaises"
          elif partner in grouping_to_groups:
            group = grouping_to_groups[partner]
          if group not in years[year]:
            years[year][group] = 0
          years[year][group] += value
          # register total trade for marseille
          years[year]["total"] += value
data = []

for year in years.keys():
  for group in groups:
    if group in years[year]:
      value = int(years[year][group])
      data.append({"year": year, "group": group, "value": value})
  data.append({"year": year, "group": "total", "value": years[year]["total"]})

with open(toflit_output, 'w') as f2:
  w = csv.DictWriter(f2, fieldnames=data[0].keys())
  w.writeheader()
  w.writerows(data)