
use "/Users/guillaumedaudin/Documents/Recherche/Commerce International Français XVIIIe.xls/Balance du commerce/Retranscriptions_Commerce_France/Données Stata/bdd courante.dta", clear
keep if best_guess_region_prodxpart==1 & customs_region=="Marseille" & year==1789

