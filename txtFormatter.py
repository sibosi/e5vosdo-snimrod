txt = """
Kedves Mindenki, 
Holnap a 307-es teremben az osztályunk nerf csatát rendez, 13:30-16:00-ig. A játék részleteiről majd a helyszínen tájékoztatunk mindenkit, de gyertek a barátaitokkal együtt, max hatan-heten. 
Várunk titeket!
9.b 
"""

txt = txt[1:][:-1]
txt = txt.replace("\n", "\\n")
print(txt)