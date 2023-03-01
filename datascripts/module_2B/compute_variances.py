import sys
import casanova
from collections import defaultdict, Counter
from statistics import NormalDist
from pprint import pprint

def process_serie(port, serie, verbose=False):

    reader = casanova.reader("%s-partners.csv" % port)

    year_col = reader.headers["year"]
    partner_col = reader.headers["partner"]
    value_col = reader.headers["value"]
    serie_col = reader.headers["serie"]

    partners = defaultdict(Counter)
    years = set()
    totals = defaultdict(float)
    ratios = defaultdict(Counter)
    for row in reader:
        if row[serie_col] == serie:
            year = row[year_col]
            years.add(year)
            partners[row[partner_col]][year] = float(row[value_col])
            totals[year] += float(row[value_col])
    for year in years:
        if not totals[year]: continue
        for partner in partners:
            if not year in partners[partner]:
                partners[partner][year] = 0.0
            ratios[partner][year] = partners[partner][year] / totals[year]
    variances = {}
    dispersions = {}
    for partner in partners:
        dist = NormalDist.from_samples(ratios[partner].values())
        variances[partner] = dist.variance
    mean_variance = NormalDist.from_samples(variances.values()).mean

    if verbose:
        print(serie, mean_variance)

    return mean_variance

if __name__ == "__main__":
    port = sys.argv[1]
    for prod in ["huile", "blé"]:
        for typ in ["imports", "exports"]:
            process_serie(port, prod + " " + typ, verbose=True)
