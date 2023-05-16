cd datascripts; 
for f in *.py; 
do if [ "$f" != "fetch_content.py" ] && [ "$f" != "build_data_subsets_for_marseille.py" ]; 
then echo "execute python script $f";python "$f"; 
fi; 
done;
for f in *.mjs; 
do echo "execute node script $f"; node "$f"; 
done;