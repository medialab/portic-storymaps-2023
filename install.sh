#!/bin/bash
mkdir public
mkdir public/data
mkdir public/data/test
touch public/data/test/.gitkeep
mkdir data
mkdir doc

set -e
echo "installing python dependencies"
pip install -U pip
pip install -e datalib
pip install -r requirements.txt
echo "ensuring notebook config is ok"
pip install --upgrade notebook jupyter jupyterlab # need jupyter_client >= 4.2 for sys-prefix below
# jupyter nbextension install --sys-prefix --py vega  # not needed in notebook >= 5.3
# jupyter nbextension enable --py --sys-prefix ipyleaflet  # can be skipped for notebook 5.3 and above

# jupyter nbextension install --py --sys-prefix keplergl # can be skipped for notebook 5.3 and above
# jupyter nbextension enable --py --sys-prefix keplergl # can be skipped for notebook 5.3 and above

echo "loading and preparing data"
sh retrieve_data.sh
echo "all done ! good datasprinting ;)"