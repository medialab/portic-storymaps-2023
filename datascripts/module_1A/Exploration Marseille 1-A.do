*Exploration Marseille 1-A
*Install svmat2 : https://www.statalist.org/forums/forum/general-stata-discussion/general/1442507-svmat2-command-unrecogonized

import excel "/Users/guillaumedaudin/Library/CloudStorage/GoogleDrive-gdaudin@mac.com/.shortcut-targets-by-id/17X9Ei9wQuVGsLpOzLzoXeJYzjb08MzF3/Datasprint PORTIC 2023 - dossier partagé/Sources/Data in Federico Schulze Volckart -- 2021 -- All_Markets_Wheat_with_balanced_samples_10.04.2018.xlsx", sheet("revised data") cellrange(B11:VM744) clear firstrow
rename Market year

keep year Abbeville-Voiron

drop if year < 1715 | year > 1815 
pwcorr Abbeville-Voiron
matrix A=r(C)
drop year-Voiron
svmat2 A, names(col) rnames(A_market)
order A_market

rename Abbeville-Voiron B_=

reshape long B_, i(A_market) j(B_market) string
rename B_ corr

export delimited using "/Users/guillaumedaudin/Documents/Recherche/2018 PORTIC Silvia/Datasprint Marseille/1-A--Blé.csv", replace

****************************

import excel "/Users/guillaumedaudin/Répertoires Git/Dialogue_62_072021/Bases_de_donnees_finales/Indices_villes/Correlation_indices/Correlation_matrix_ville.xlsx", sheet("Imports") firstrow clear

rename Nantes-Rennes B=
reshape long B, i(A) j(corr) string
export delimited using "/Users/guillaumedaudin/Documents/Recherche/2018 PORTIC Silvia/Datasprint Marseille/1-A--Ports.csv", replace






