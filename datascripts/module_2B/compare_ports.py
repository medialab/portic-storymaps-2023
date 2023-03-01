import csv
import sys
from pprint import pprint
from compute_data import build_data
from compute_variances import process_serie

def port_variances(port, nb_top_products=10):
    print("Preparing data for", port)
    series = build_data(port, nb_top_products=nb_top_products)
    variances = {}
    for serie in series:
        variances[serie] = process_serie(port, serie)
    pprint(variances)
    return variances


if __name__ == "__main__":
    ports = ["Marseille", "Bordeaux", "Nantes", "Rouen", "La Rochelle", "Bayonne"]
    if len(sys.argv) > 1:
        NB_TOP_PRODUCTS = sys.argv[1]
    else:
        NB_TOP_PRODUCTS = 10

    with open("variances_ports_produits.csv", "w") as f:
        writer = csv.writer(f)
        writer.writerow(["port", "serie", "partner_variance"])
        for port in ports:
            variances = port_variances(port, nb_top_products=NB_TOP_PRODUCTS)
            for serie in variances.keys():
                writer.writerow([port, serie, variances[serie]])
