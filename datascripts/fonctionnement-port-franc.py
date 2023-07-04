import shutil


input1 = 'module_1B/generated_from_gephi_project/_spatialized_toflit18-bureaux-network-with-mirrors.gexf'
output1 = '../public/data/fonctionnement-port-franc-complete.gexf'
shutil.copyfile(input1, output1)

input2 = 'module_1B/generated_from_gephi_project/_spatialized_toflit18-bureaux-network-simplified-mirrors.gexf'
output2 = '../public/data/fonctionnement-port-franc-simplified.gexf'
shutil.copyfile(input2, output2)

