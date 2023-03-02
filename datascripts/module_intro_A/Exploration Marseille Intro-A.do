use "/Users/guillaumedaudin/Documents/Recherche/Commerce International Français XVIIIe.xls/Balance du commerce/Retranscriptions_Commerce_France/Données Stata/bdd courante.dta", clear

keep if best_guess_region_prodxpart==1 & customs_region=="Marseille" & year==1789

collapse (sum) value, by (partner_grouping partner_simplification export_import)

format value %15.0fc

sort export_import value
list

collapse (sum) value, by (partner_grouping export_import)
drop partner_simplification
sort export_import value
list




*********************************