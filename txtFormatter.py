txt = """
<iframe
        width="100%"
        height="166"
        scrolling="no"
        frameborder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1941990415&color=ff5500"
      ></iframe>
      <div
        style={{
          fontSize: "10px",
          color: "#cccccc",
          lineBreak: "anywhere",
          wordBreak: "normal",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontFamily:
            "Interstate, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Garuda, Verdana, Tahoma, sans-serif",
          fontWeight: 100,
        }}
      >
        <a
          href="https://soundcloud.com/hvgonline"
          title="HVG Podcastok"
          target="_blank"
          style={{
            color: "#cccccc",
            textDecoration: "none",
          }}
        >
          HVG Podcastok
        </a>{" "}
        ·{" "}
        <a
          href="https://soundcloud.com/hvgonline/nem-vagyunk-versenyistallo-a-hvg-kozepiskolai-rangsoranak-elen-allo-eotvos-igazgatoja-a-fulkeben"
          title="„Nem vagyunk versenyistálló” – A HVG középiskolai rangsorának élén álló Eötvös igazgatója a Fülkében"
          target="_blank"
          style={{
            color: "#cccccc",
            textDecoration: "none",
          }}
        >
          „Nem vagyunk versenyistálló” – A HVG középiskolai rangsorának élén
          álló Eötvös igazgatója a Fülkében
        </a>
      </div>
"""

txt = txt[1:][:-1]
txt = txt.replace("\n", "\\n")
print(txt)
