import csv

output = "../public/data/evolution-exports-levant.csv"

grouping_to_groups = {
  "Italie": "Italie & Espagne",
  "Espagne": "Italie & Espagne",
  "Levant et Barbarie": "Levant & Barbarie",
  "Angleterre": "Angleterre & Amériques",
  "Amériques": "Angleterre & Amériques",
  "Nord": "Nord, Hollande & Flandres",
  "Hollande": "Nord, Hollande & Flandres",
  "Flandre et autres états de l'Empereur": "Nord, Hollande & Flandres"
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
        and flow['customs_region'] == 'Marseille':
        
        if year not in years:
          years[year] = {
            "total": 0,
            "year": year,
          }
        # register import value per group
        if flow["export_import"] == "Imports" and partner in grouping_to_groups:
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

with open(output, 'w') as f2:
  w = csv.DictWriter(f2, fieldnames=data[0].keys())
  w.writeheader()
  w.writerows(data)
