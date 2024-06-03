use "/Users/guillaumedaudin/Documents/Recherche/Commerce International Français XVIIIe.xls/Balance du commerce/Retranscriptions_Commerce_France/Données Stata/bdd courante.dta", clear

keep if year==1789

keep if best_guess_region_prodxpart==1

keep if customs_region=="Marseille" | partner_simplification=="Marseille"

collapse (sum) value, by (export_import partner_simplification partner_grouping customs_region customs_office customs_office_source)

gen importateur="RdM" if partner_grouping !="France" & export_import=="Exports"
gen exportateur="RdM" if partner_grouping !="France" & export_import=="Imports"

replace importateur="Fr_hors_DirMar" if partner_grouping =="France" & export_import=="Exports" & partner_simplification !="Marseille"
replace exportateur="Fr_hors_DirMar" if partner_grouping =="France" & export_import=="Imports" & partner_simplification !="Marseille"

replace importateur="Fr_hors_DirMar" if customs_region !="Marseille" & export_import=="Imports" & partner_simplification =="Marseille"
replace exportateur="Fr_hors_DirMar" if customs_region !="Marseille" & export_import=="Exports" & partner_simplification =="Marseille"


replace importateur="DirMar_hors_Mar" if customs_region =="Marseille" ///
			& export_import=="Imports" & strmatch(customs_office_source,"*Marseille*")!=1
replace exportateur="DirMar_hors_Mar" if customs_region =="Marseille" ///
			& export_import=="Exports" & strmatch(customs_office_source,"*Marseille*")!=1
			
replace importateur="Marseille" if customs_office =="Marseille" & export_import=="Imports"
replace exportateur="Marseille" if customs_office =="Marseille" & export_import=="Exports"

replace importateur="Marseille" if partner_simplification =="Marseille" & export_import=="Exports"
replace exportateur="Marseille" if partner_simplification =="Marseille" & export_import=="Imports"

replace importateur="Marseille_conso" if strmatch(customs_office_source,"*Poids et Casse*")==1 ///
			& export_import=="Exports" & partner_simplification=="Marseille"
replace exportateur="Fr_hors_Mar" if strmatch(customs_office_source,"*Poids et Casse*")==1 ///
			& export_import=="Exports" & partner_simplification=="Marseille"

assert importateur!="" & exportateur!=""

collapse (sum) value, by(importateur exportateur)

gen value_en_Mlt=value/1000000
drop value
format value_en_Mlt %9.2fc

order exportateur importateur
sort exportateur
br
export delimited using "/Users/guillaumedaudin/Répertoires Git/portic-storymaps-2023/datascripts/module_1B/Pour fonctionnement du port franc simplifié Guillaume/liste.csv", replace
**Cela semble bon



reshape wide value_en_Mlt, i(exportateur) j(importateur) string
export delimited using "/Users/guillaumedaudin/Répertoires Git/portic-storymaps-2023/datascripts/module_1B/Pour fonctionnement du port franc simplifié Guillaume/tableau.csv", replace





