#!/usr/bin/env python
# coding: utf-8

# L'objectif de ce notebook est de créer une méthode permettant de classer les pavillons des bateaux passés par Marseille pour tester diverses hypothèses portant sur les différentes logiques de navigation à l'œuvre.

# In[ ]:


import csv
import pandas as pd
import numpy as np
import pprint


# # La méthode

# In[ ]:


ughs_id_to_province = {}
provinces = set()
with open('../../data/navigo_all_pointcalls.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        uhgs_id = row['pointcall_uhgs_id']
        province = row['pointcall_province']
        #state = row['pointcall_state_1789_fr']
        if row['state_fr'] == 'France':
            ughs_id_to_province[uhgs_id] = province
            provinces.add(province)
        if row['homeport_state_1789_fr'] == 'France':
            ughs_id_to_province[row['homeport_uhgs_id']] = row['homeport_province']

LEVANT_PROVINCES = ['Corse', 'Languedoc',  'Roussillon', 'Provence']
#ITALIAN_FLAGS = [
#    'italien, indéterminé', 'carrarais', 'savoyard', 'vénitien', 'ragusois', 'génois', 'napolitain', 'toscan', 'romain'
#]

BIRTHPLACE_TO_PROVINCE = {
    '': 'Inconnu', 
    'Olioule': 'Provence', 
    'La Cadiere': 'Provence', 
    'Sejan [Sigean]': 'Languedoc', 
    'Roquebrune': 'Provence', 
    'Séjean': 'Provence',
    'Sejan': 'Provence', 
    'Ambon': 'Bretagne', 
    'Hieres': 'Province', 
    'Rivage [France, undetermined]': 'Inconnu', 
    'La Cadière': 'Provence', 
    'Istre': 'Provence', 
    'Cadiere': 'Provence', 
    'Aubagne': 'Provence', 
    'Seyreste': 'Provence', 
    'Solliés': 'Provence', 
    'Gruissand': 'Languedoc', 
    'Ceyreste': 'Provence', 
    'Valauris': 'Provence', 
    'Six fours': 'Provence', 
    'Gruissan': 'Provence', 
    'Mazargue': 'Provence', 
    'Roquemaure en Languedoc': 'Languedoc', 
    'Oullioulles': 'Provence', 
    'Six Fours': 'Provence', 
    'Hières': 'Provence', 
    'Mazargues': 'Provence', 
    'Sejean': 'Languedoc', 
    'Six Four': 'Provence', 
    'Roussillon': 'Roussillon', 
    'Istres': 'Provence', 
    'Gruisson': 'Languedoc', 
    'Serinan': 'Languedoc', 
    'Roquemaure': 'Languedoc', 
    'Sixfours': 'Provence'
}

FLAG_TO_GROUPING = {
    'italien, indéterminé': 'Italie', 
    'carrarais': 'Italie', 
    'savoyard': 'Italie', 
    'vénitien': 'Italie', 
    'ragusois': 'Italie', 
    'génois': 'Italie', 
    'napolitain': 'Italie', 
    'toscan': 'Italie', 
    'romain': 'Italie',
    
    'hollandais': 'Hollande', 
    'danois': 'Nord', 
    'ottoman': 'Levant et Barbarie', 
    'étasunien': 'États-Unis d\'Amérique', 
    'monégasque': 'France', 
    'britannique': 'Angleterre', 
    'suédois': 'Nord', 
    'français': 'France', 
    'maltais': 'Autre'
}
def aggregate_flag_for_flow(flow, ughs_id_to_province_map, isolate_levant=True):
    flag = row['ship_flag_standardized_fr']
    birthplace_uhgs_id = row['birthplace_uhgs_id']
    birthplace_city = row['birthplace']
    if flag == '':
        return 'Inconnu'
    if flag == 'français' and isolate_levant:
        province = ughs_id_to_province_map[birthplace_uhgs_id] if birthplace_uhgs_id in ughs_id_to_province_map else 'Inconnu'
        if province == 'Inconnu' and birthplace_city in BIRTHPLACE_TO_PROVINCE:
            province = BIRTHPLACE_TO_PROVINCE[birthplace_city]
        if province in LEVANT_PROVINCES:
            return 'France du Levant'
        else:
            return 'France du Ponant'
    elif flag in FLAG_TO_GROUPING:
        if flag == 'monégasque' and isolate_levant:
            return 'France du Levant'
        else:
            return FLAG_TO_GROUPING[flag]
    else:
        return 'Inconnu'


# # Test de la fonction

# In[ ]:

if __name__ == "__main__":
    stats = {}
    with open('../../data/navigo_all_flows.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row['destination_function'] == "O" \
            and row["source_suite"] == "la Santé registre de patentes de Marseille":
               # and row['toponyme_fr'] == 'Marseille' \
                flag_class = aggregate_flag_for_flow(row, ughs_id_to_province)
                if flag_class not in stats:
                    stats[flag_class] = 0
                stats[flag_class]+= 1
    # print(flags)
    for flag_class, nb in sorted(stats.items(), key=lambda c : c[1]):
        print(flag_class, str(nb))

