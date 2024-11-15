txt = """
Kedves Diákok! 

Mint már sokan tudjátok, idén is megrendezésre kerül a Bimun tavasszal az iskolánkban. Mivel mi, az egész organiser csapattal úgy tartjuk, hogy a konferencia egy kihagyhatatlan élmény egy eötvösös diák életében, szeretnénk megismertetni veletek a betölthető pozíciókat és a felejthetetlen hangulatot, ezért holnap várunk titeket sok szeretettel a BIMUN Day-en! 

Nézzetek körül holnap, a 2-5. szünetben a második emeleti folyosókon és ismerjétek meg a szervező csapat tagjait, nézzetek körül az állomásokon, játszatok velünk és persze ha kérdésetek van, tegyétek fel, mert mi nagyon szívesen válaszolunk!

Azok akik az összes állomás játékát teljesítik, a büfénél ínycsiklandó nyereményt is kaphatnak. 

A pozíciókra való jelentkezés holnap megnyílik, az alábbi linken találjátok: https://www.bimun.hu/registration 

Reméljük sokatokkal találkozunk holnap, és átadhatjuk nektek a Bimun hangulatát! Gyertek legyetek részesei Ti is a BIMUN csapatának!

Üdvözlettel,
Organiser Team
"""

txt = txt[1:][:-1]
txt = txt.replace("\n", "\\n")
print(txt)
