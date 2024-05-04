import fetch from "node-fetch";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { teachersConfig } from "@/config/teachers";

const url = "https://suli.ejg.hu/intranet/helyettes/refresh.php";

export async function getData() {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const text = iconv.decode(buffer, "iso-8859-2"); // Kódolás konvertálása
  const tableData = parseTable(text);
  // console.log(tableData);
  return tableData;
}

function parseTable(text) {
  const $ = cheerio.load(text);
  const tableData = [];

  $("table tr").each((index1, row) => {
    const rowData = [];
    $(row)
      .find("td")
      .each((index, cell) => {
        if (teachersConfig.showIndexes.includes(index)) {
          rowData.push($(cell).text().trim());
        } else {
          rowData.push();
        }
      });
    tableData.push(rowData);
  });

  return tableData;
}
