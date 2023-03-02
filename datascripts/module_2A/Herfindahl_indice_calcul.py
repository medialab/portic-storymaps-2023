import duckdb
import csv
from rich.progress import track


# ----------------------------------------------- #
#    FONCTION POUR CALCULER L'INDICE HERFINDAHL
def carre_du_marche(year, bureau_OR_direction, nom):
        # Filtrer les données selon l'année et le direction ou bureau
        relation = duckdb.sql(f"""
        FROM csv_data
        WHERE value IS NOT NULL
        AND export_import = 'Exports'
        AND best_guess_region_prodxpart = '1'
        AND year = '{year}'
        AND {bureau_OR_direction} = '{nom}'
        """)
        # Sommer toute valeur de produit exporté
        all_product_value = relation.sum('value').fetchone()[0]
        if not all_product_value:
                return None
        # Agréger les exports par type de produit et sommer la valeur pour chaque type
        aggreg = duckdb.sql(f"""
        SELECT {PRODUCT_CLASSIFICATION}, SUM(value) AS sum_value
        FROM relation
        GROUP BY {PRODUCT_CLASSIFICATION}
        """)
        # Calculer l'indice selon la formule : (sum_value/all_product_value)^2
        carre = duckdb.sql(f"""
        SELECT  {PRODUCT_CLASSIFICATION},
                sum_value, {all_product_value} AS total,
                power(sum_value/{all_product_value}, 2) AS carre_part_marche
        FROM aggreg
        """)
        return carre.sum('carre_part_marche').fetchone()[0]
# ----------------------------------------------- #


# STEP 1. --------------- LIRE LE DATASET ---------------
CSV = '../../data/toflit18_all_flows.csv'
PRODUCT_CLASSIFICATION = 'product_RE_aggregate'  # À CHANGER
# Lire le csv et l'envoyer comme une relation (une "table")
csv_data = duckdb.sql(f"""
SELECT  customs_region,
        customs_office,
        CAST(value AS FLOAT) as value,
        year,
        export_import,
        best_guess_region_prodxpart,
        {PRODUCT_CLASSIFICATION},
FROM read_csv_auto('{CSV}', ALL_VARCHAR=TRUE)
""")
year_select = duckdb.query('SELECT CAST(year AS INTEGER) FROM csv_data')
years = [tuple[0] for tuple in year_select.distinct().fetchall()]


# STEP 2. ----------- CALCULER L'INDICE PAR DIRECTION -----------
# Déclarer quelles directions à cibler
directions = ['Bordeaux', 'Marseille', 'Rouen', 'Nantes', 'La Rochelle', 'Bayonne']
# Préparer une liste vide dans laquelle se mettront les rows du writer
carre_du_marche_directions = []
# Boucler sur la liste de directions ciblées
for direction in directions:
    print(direction)
    # Lancer le calcul pour chaque année
    for year in track(years, description='Calculating indices...'):
        indice = carre_du_marche(
                year=year,
                bureau_OR_direction='customs_region',
                nom=direction)
        carre_du_marche_directions.append({
            'direction': direction,
            'year': year,
            'indice' : indice,
        })
# Sortir les résultats dans un writer pour les sauvegarder
with open(f'Herfindahl_direction_pour_{PRODUCT_CLASSIFICATION}.csv', 'w') as of:
    fieldnames = ['direction', 'year', 'indice']
    writer = csv.DictWriter(of, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(carre_du_marche_directions)


# STEP 3. ----------- CALCULER L'INDICE PAR BUREAU -----------
# Déclarer quelles bureaux à cibler et l'année concernée
bureaux = ['Bordeaux', 'Marseille', 'Rouen', 'Nantes', 'La Rochelle', 'Bayonne', 'Saint-Malo', 'Le Havre']
year = 1789
# Préparer une liste vide dans laquelle se mettront les rows du writer
carre_du_marche_bureaux = []
# Boucler sur la liste de bureaux ciblés
for bureau in track(bureaux):
    indice = carre_du_marche(
                year=year,
                bureau_OR_direction='customs_office',
                nom=bureau)
    # Lancer le calcul pour chaque année
    carre_du_marche_bureaux.append({
            'bureau': bureau,
            'year': year,
            'indice' : indice,
        })
# Sortir les résultats dans un writer pour les sauvegarder
with open(f'Herfindahl_bureau_pour_{PRODUCT_CLASSIFICATION}.csv', 'w') as of:
    fieldnames = ['bureau', 'year', 'indice']
    writer = csv.DictWriter(of, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(carre_du_marche_bureaux)
