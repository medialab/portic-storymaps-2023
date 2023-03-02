*Exploration Marseille 1-A
*Install svmat2 : https://www.statalist.org/forums/forum/general-stata-discussion/general/1442507-svmat2-command-unrecogonized

import excel "/Users/guillaumedaudin/Documents/Recherche/Articles Scannés/Federico Schulze Volckart -- 2021 -- Data -- All_Markets_Wheat_with_balanced_samples_10.04.2018.xlsx", sheet("revised data") cellrange(B11:VM744) clear firstrow
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

export delimited using "/Users/guillaumedaudin/Répertoires Git/portic-storymaps-2023/datascripts/module_1A/1-A--Blé.csv", replace

****************************

import excel "/Users/guillaumedaudin/Répertoires Git/Dialogue_62_072021/Bases_de_donnees_finales/Indices_villes/Correlation_indices/Correlation_matrix_ville.xlsx", sheet("Imports") firstrow clear

rename Nantes-Rennes corr=
reshape long corr, i(A) j(B) string
export delimited using "/Users/guillaumedaudin/Répertoires Git/portic-storymaps-2023/datascripts/module_1A/1-A--Ports.csv", replace


import excel "/Users/guillaumedaudin/Répertoires Git/Dialogue_62_072021/Bases_de_donnees_finales/Indices_villes/Correlation_indices/Correlation_matrix_ville1700_1760.xlsx", sheet("Imports") firstrow clear

rename Nantes-Rennes corr=
reshape long corr, i(A) j(B) string
export delimited using "/Users/guillaumedaudin/Répertoires Git/portic-storymaps-2023/datascripts/module_1A/1-A--Ports1700-1760.csv", replace

import excel "/Users/guillaumedaudin/Répertoires Git/Dialogue_62_072021/Bases_de_donnees_finales/Indices_villes/Correlation_indices/Correlation_matrix_ville1750_1900.xlsx", sheet("Imports") firstrow clear

rename Nantes-Rennes corr=
reshape long corr, i(A) j(B) string
export delimited using "/Users/guillaumedaudin/Répertoires Git/portic-storymaps-2023/datascripts/module_1A/1-A--Ports1750-1800.csv", replace

****************************

import excel "/Users/guillaumedaudin/Documents/Recherche/Articles Scannés/Data in Federico Schulze Volckart -- 2021 -- All_Markets_Wheat_with_balanced_samples_10.04.2018 modifié.xlsx", sheet("revised data") cellrange(B6:VM8) firstrow clear

mkmat Gmunden-Odessa, matrix(A)
matrix B=A'
svmat2 B, names(col) rnames(market)
rename r1 latitude
rename r2 longitude

export delimited using "/Users/guillaumedaudin/Répertoires Git/portic-storymaps-2023/datascripts/module_1A/1-A--coordonnées.csv", replace




