echo "Download data : fetching latest toflit18 data"
curl -o data/toflit18_bdd.zip "https://raw.githubusercontent.com/medialab/toflit18_data/master/base/bdd%20courante.csv.zip"
unzip data/toflit18_bdd.zip -d "data"
rm -f data/toflit18_bdd.zip
mv "data/bdd courante.csv" "data/toflit18_all_flows.csv"
echo "Download data : fetching latest navigo pointcalls data"

echo "Download data : fetching latest navigo pointcalls, flows and travels data"
curl -o data/navigo_all_pointcalls.csv "http://sandbox.robindemourat.com/portic-datasprint-2023-data/navigo_all_pointcalls.csv"
curl -o data/navigo_all_flows.csv "http://sandbox.robindemourat.com/portic-datasprint-2023-data/navigo_all_flows.csv"
curl -o data/navigo_all_travels.csv "http://sandbox.robindemourat.com/portic-datasprint-2023-data/navigo_all_travels.csv"

# API-based methods (not needed anymore)
# curl -o data/navigo_all_pointcalls.csv "data.portic.fr/api/pointcalls/?&format=csv"
# curl -o data/navigo_all_pointcalls_1789.csv "data.portic.fr/api/pointcalls/?date=1789&format=csv"
# curl -o data/navigo_all_pointcalls_1787.csv "data.portic.fr/api/pointcalls/?date=1787&format=csv"
echo "Download data : fetching latest navigo sources data"
# curl -o data/navigo_all_flows.csv "data.portic.fr/api/rawflows/?format=csv"
# curl -o data/navigo_all_flows_1789.csv "data.portic.fr/api/rawflows/?date=1789&format=csv"
# curl -o data/navigo_all_flows_1787.csv "data.portic.fr/api/rawflows/?date=1787&format=csv"
curl -o data/navigo_sources_by_source_and_year_and_place.csv "data.portic.fr/api/sources/?format=csv"

./datascripts.sh
cd datascripts  
python fetch_content.py