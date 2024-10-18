txt = """

A bajnokságokra vasárnapig lehet jelentkezni (okt 20.).
Várunk mindenkit sok szeretettel, a programok pontos helyszíneiről hamarosan tájékoztatunk Benneteket!
"""

txt = txt[1:][:-1]
txt = txt.replace("\n", "\\n")
print(txt)