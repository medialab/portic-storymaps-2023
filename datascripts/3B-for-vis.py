import shutil
input1 = "module_3B/tonnages_warstatus_levant_only.csv"
output1 = "../public/data/navigation_levant_guerre.csv"
shutil.copyfile(input1, output1)
input2 = "module_3B/tonnages_warstatus.csv"
output2 = "../public/data/navigation_guerre.csv"
shutil.copyfile(input2, output2)