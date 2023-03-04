use "/Users/guillaumedaudin/Documents/Recherche/Commerce International Français XVIIIe.xls/Balance du commerce/Retranscriptions_Commerce_France/Données Stata/bdd courante.dta", clear

keep if best_guess_region_prodxpart==1

keep if customs_region=="Marseille"

collapse (sum) value, by(year export product_sitc)

egen comm_annuel=total(value), by(year export)

gen share = value/comm_annuel
drop value comm_annuel

replace share=. if share <.1

drop if product_sitc=="" | product_sitc=="???"
reshape wide share,i(year export_import) j(product_sitc) string

graph twoway line share* year if export_import=="Imports", title(Imports)





