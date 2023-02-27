from csv import DictReader, DictWriter

def build_data_file(input_path, output_path, row_filter_fn):
  objects = []
  totalcount = 0
  print("Build subset file " + output_path.split('/')[-1])
  with open(input_path, newline='') as inputfile:
      reader = DictReader(inputfile)
      for row in reader:
          totalcount += 1
          if row_filter_fn(row) is True:
              objects.append(row)
  print(str(len(objects)) + " objects filtered out of " + str(totalcount))
  with open(output_path, 'w', newline='') as outputfile:
      fieldnames = objects[0].keys()
      writer = DictWriter(outputfile, fieldnames=fieldnames)
      writer.writeheader()
      writer.writerows(objects)
  print("done")

TOFLIT18_INPUT_PATH = '../data/toflit18_all_flows.csv'
TOFLIT18_OUTPUT_PATH = '../data/toflit18_marseille_flows.csv'
TOFLIT18_1789_OUTPUT_PATH = '../data/toflit18_marseille_1789_flows.csv'

POINTCALLS_INPUT_PATH = '../data/navigo_all_pointcalls.csv'
POINTCALLS_OUTPUT_PATH = '../data/navigo_marseille_pointcalls.csv'
POINTCALLS_1789_OUTPUT_PATH = '../data/navigo_marseille_1789_pointcalls.csv'

FLOWS_INPUT_PATH = '../data/navigo_all_flows.csv'
FLOWS_OUTPUT_PATH = '../data/navigo_marseille_flows.csv'
FLOWS_1789_OUTPUT_PATH = '../data/navigo_marseille_1789_flows.csv'

TRAVELS_INPUT_PATH = '../data/navigo_all_travels.csv'
TRAVELS_OUTPUT_PATH = '../data/navigo_marseille_travels.csv'
TRAVELS_1789_OUTPUT_PATH = '../data/navigo_marseille_1789_travels.csv'

"""
Navigo pointcalls
"""

build_data_file(
    POINTCALLS_INPUT_PATH, 
    POINTCALLS_OUTPUT_PATH, 
    lambda pointcall : pointcall['toponyme_fr'] == 'Marseille'
)

build_data_file(
    POINTCALLS_INPUT_PATH, 
    POINTCALLS_1789_OUTPUT_PATH, 
    lambda pointcall : pointcall['toponyme_fr'] == 'Marseille' and pointcall['date_fixed'].split('-')[0] == '1789'
)

"""
Navigo flows
"""

build_data_file(
    FLOWS_INPUT_PATH, 
    FLOWS_OUTPUT_PATH, 
    lambda flow : flow['departure_fr'] == 'Marseille' or flow['destination_fr'] == 'Marseille'
)

build_data_file(
    FLOWS_INPUT_PATH, 
    FLOWS_1789_OUTPUT_PATH, 
    lambda flow : (flow['indate_fixed'].split('-')[0] == '1789' or flow['outdate_fixed'].split('-')[0] == '1789') and (flow['departure_fr'] == 'Marseille' or flow['destination_fr'] == 'Marseille')
)



"""
Navigo travels (explicit + implicit flows)
"""

build_data_file(
    TRAVELS_INPUT_PATH, 
    TRAVELS_OUTPUT_PATH, 
    lambda travel : travel['departure_fr'] == 'Marseille' or travel['destination_fr'] == 'Marseille'
)

build_data_file(
    TRAVELS_INPUT_PATH, 
    TRAVELS_1789_OUTPUT_PATH, 
    lambda travel :  (travel['indate_fixed'].split('-')[0] == '1789' or travel['outdate_fixed'].split('-')[0] == '1789') and (travel['departure_fr'] == 'Marseille' or travel['destination_fr'] == 'Marseille')
)

"""
TOFLIT18 flows
"""

build_data_file(
    TOFLIT18_INPUT_PATH, 
    TOFLIT18_OUTPUT_PATH, 
    lambda flow : flow['partner_simplification'] == 'Marseille' or flow['customs_region'] == 'Marseille'
)

build_data_file(
    TOFLIT18_INPUT_PATH, 
    TOFLIT18_1789_OUTPUT_PATH, 
    lambda flow : flow["year"] == "1789" and flow['partner_simplification'] == 'Marseille' or flow['customs_region'] == 'Marseille'
)