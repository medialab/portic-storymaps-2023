import csv
from pprint import pprint
from compute_data import build_data
from compute_variances import process_serie

def port_variances(port):
    print("Preparing data for", port)
    series = build_data(port)
    variances = {}
    for serie in series:
        variances[serie] = process_serie(port, serie)
    pprint(variances)
    return variances


if __name__ == "__main__":
    ports = ["Marseille", "Bordeaux", "Nantes", "Rouen", "La Rochelle", "Bayonne"]

    with open("variances_ports_produits.csv", "w") as f:
        writer = csv.writer(f)
        writer.writerow(["port", "serie", "partner_variance"])
        for port in ports:
            variances = port_variances(port)
            for serie in variances.keys():
                writer.writerow([port, serie, variances[serie]])
