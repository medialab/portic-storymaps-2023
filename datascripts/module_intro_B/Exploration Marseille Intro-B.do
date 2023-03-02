use "/Users/guillaumedaudin/Documents/Recherche/Commerce International Français XVIIIe.xls/Balance du commerce/Retranscriptions_Commerce_France/Données Stata/bdd courante.dta", clear

keep if best_guess_region_prodxpart==1 & partner_grouping!="France" & year==1789

collapse (sum) value, by (customs_region customs_office export_import)

format value %15.0fc

sort export_import value
list

collapse (sum) value, by (customs_region export_import)
drop customs_office
sort export_import value
list

*********************************

use "/Users/guillaumedaudin/Documents/Recherche/Commerce International Français XVIIIe.xls/Balance du commerce/Retranscriptions_Commerce_France/Données Stata/bdd courante.dta", clear

keep if best_guess_region_prodxpart==1 & partner_grouping!="France" & year==1789 & product_sitc_simplEN!="Plantation foodstuffs"

keep if 
collapse (sum) value, by (customs_region export_import)
drop customs_office
sort export_import value
format value %15.0fc
list

*********************************

use "/Users/guillaumedaudin/Documents/Recherche/Commerce International Français XVIIIe.xls/Balance du commerce/Retranscriptions_Commerce_France/Données Stata/bdd courante.dta", clear

keep if best_guess_region_prodxpart==1 & partner_grouping!="France" & year==1789 & partner_grouping!="Monde"

collapse (sum) value, by (customs_region export_import)
drop customs_office
sort export_import value
format value %15.0fc
list