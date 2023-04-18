import csv
import shutil
import os
import requests
import json
import sys
import os

import visvalingamwyatt as vw

print('writing intro_data_world.csv')
with open('../public/data/intro_data_world.csv', 'w') as writer:
    f = csv.DictWriter(writer, fieldnames=["test"])
    f.writeheader()
  

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