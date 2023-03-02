use "/Users/guillaumedaudin/Documents/Recherche/Commerce International Français XVIIIe.xls/Balance du commerce/Retranscriptions_Commerce_France/Données Stata/bdd courante.dta", clear

tab customs_region, sort

tab year if customs_region=="Marseille"



tab year export_import if strmatch(partner_orthographic,"*Marseille*") & year==1789
tab customs_region export_import if strmatch(partner_orthographic,"*Marseille*") & year==1789

format value %10.0fc

preserve
keep if strmatch(partner_orthographic,"*Marseille*") & year==1789
collapse (sum) value, by(year export_import)
list

tab customs_office if customs_region=="Marseille" & year== 1789

preserve
keep if strmatch(partner_orthographic,"*Marseille*") & year==1789 & customs_region=="Marseille"
collapse (sum) value, by(year export_import)
list

preserve
keep if strmatch(partner_orthographic,"*Marseille*") & year==1789 & customs_office=="Marseille"
tab partner_orthographic customs_office


tab customs_office_source
tab customs_office_source if customs_office=="Marseille"
tab customs_office_source year if customs_office=="Marseille"
tab customs_office_source export_import if customs_office=="Marseille"
tab export_import customs_office_source if customs_office=="Marseille"
tab partner customs_office_source if customs_office=="Marseille" & year == 1789
tab partner_grouping customs_office_source if customs_office=="Marseille" & year == 1789
tab  customs_office_source partner_grouping if customs_office=="Marseille" & year == 1789
tab  customs_office_source partner_grouping if customs_office=="Marseille" & year == 1789 & export_import=="Exports"
tab  partner_grouping  customs_office_source if customs_office=="Marseille" & year == 1789 & export_import=="Exports"
list source product_orthographic if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & partner_grouping=="Monde"
list source product_orthographic if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & partner_grouping=="Afrique"
list source product_orthographic if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & partner_grouping=="Amériques"
tab source if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & customs_office_source=="Marseille"
tab source if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Casse*")==1
br source if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Casse*")==1 
br if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Casse*")==1 
tab source if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Occiden*")==1
br if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Casse*")==1 
tab source if partner_grouping=="France" & year==1789  & export_import=="Exports"
tab filepath if partner_grouping=="France" & year==1789  & export_import=="Exports"
tab filepath if partner_grouping=="France" & year==1789  & export_import=="Exports" & customs_office=="Marseille"
br filepath if partner_grouping=="France" & year==1789  & export_import=="Exports" & customs_office=="Marseille"
tab product_revolutionempire customs_office_source if partner_grouping=="France" & year==1789  & export_import=="Exports" & customs_office=="Marseille"tab customs_office_source
tab customs_office_source if customs_office=="Marseille"
tab customs_office_source year if customs_office=="Marseille"
tab customs_office_source export_import if customs_office=="Marseille"
tab export_import customs_office_source if customs_office=="Marseille"
tab partner customs_office_source if customs_office=="Marseille" & year == 1789
tab partner_grouping customs_office_source if customs_office=="Marseille" & year == 1789
tab  customs_office_source partner_grouping if customs_office=="Marseille" & year == 1789
tab  customs_office_source partner_grouping if customs_office=="Marseille" & year == 1789 & export_import=="Exports"
tab  partner_grouping  customs_office_source if customs_office=="Marseille" & year == 1789 & export_import=="Exports"
list source product_orthographic if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & partner_grouping=="Monde"
list source product_orthographic if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & partner_grouping=="Afrique"
list source product_orthographic if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & partner_grouping=="Amériques"
tab source if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & customs_office_source=="Marseille"
tab source if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Casse*")==1
br source if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Casse*")==1 
br if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Casse*")==1 
tab source if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Occiden*")==1
br if customs_office=="Marseille" & year == 1789 & export_import=="Exports" & strmatch(customs_office_source,"*Casse*")==1 
tab source if partner_grouping=="France" & year==1789  & export_import=="Exports"
tab filepath if partner_grouping=="France" & year==1789  & export_import=="Exports"
tab filepath if partner_grouping=="France" & year==1789  & export_import=="Exports" & customs_office=="Marseille"
br filepath if partner_grouping=="France" & year==1789  & export_import=="Exports" & customs_office=="Marseille"
tab product_revolutionempire customs_office_source if partner_grouping=="France" & year==1789  & export_import=="Exports" & customs_office=="Marseille"


