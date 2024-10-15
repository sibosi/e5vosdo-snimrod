txt = """ 
Itt olvashattok a programjaikrol az ev egesze alatt:
Európa Nap – március 28. péntek
- Európa Fórum – Téma: EU Zöld Megállapodás -
- EPAS (Európa) Bajnokság (12 órás foci) - minden csoport

Európai Filmklub – Európa Napon, Tavaszi Fesztiválon 

Európa Kvíz - szeptembertől folyamatosan 

Tavaszi Fesztivál – április 
- Európa Filmklub

BIMUN - részvétel a 0. napon, krízis bizottság 

Zöld Program – szeptembertől folyamatosan - Zöld Bizottság
"""

txt = txt.replace("\n", "\\n")
print(txt)