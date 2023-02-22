echo "Download data : fetching latest toflit18 data"
curl -o data/toflit18_bdd.zip "https://raw.githubusercontent.com/medialab/toflit18_data/master/base/bdd%20courante.csv.zip"
unzip data/toflit18_bdd.zip -d "data"
rm -f data/toflit18_bdd.zip
mv "data/bdd courante.csv" "data/toflit18_all_flows.csv"
echo "Download data : fetching latest navigo pointcalls data"
curl -o data/navigo_all_pointcalls_1789.csv "data.portic.fr/api/pointcalls/?date=1789&format=csv"
curl -o data/navigo_all_pointcalls_1787.csv "data.portic.fr/api/pointcalls/?date=1787&format=csv"
echo "Download data : fetching latest navigo flows data"
curl -o data/navigo_all_flows_1789.csv "data.portic.fr/api/rawflows/?date=1789&format=csv"
curl -o data/navigo_all_flows_1787.csv "data.portic.fr/api/rawflows/?date=1787&format=csv"

cd datascripts
for f in *.py; do echo "execute python script $f"; python3 "$f"; done
# for f in *.js; do echo "execute node script $f"; node "$f"; done