// TODO Старый код, для парсинга депозитарного отчета, очень PoC

const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

const result = excelToJson({
  sourceFile: './build/src/broker-report-2020-01-01-2020-12-31.xlsx',
});

function removeEmptyCell(r: EXEL_ROW): EXEL_ROW {
  const d = Object.entries(r).reduce((res, el) => {
    el[1].length && (res[el[0]] = el[1])
    return res;
  }, {})
  return d;
}

function getUnixTimeForAction(date: string, time: string): number {

  const d = date.split('.');
  const t = time.split(':');
  return new Date(+d[2], +d[1] - 1, +d[0], +t[0], +t[1], +t[2]).getTime() / 1000
}

function getRowsWithActions(d: EXEL_ROW[]): { [key: string]: EXEL_ROW } {
  const startKey = '3079865403';
  const finishKey = '1.2 Информация о неисполненных сделках на конец отчетного периода';

  interface RowsReducer {
    rows: { [key: string]: EXEL_ROW },
    canAdd: boolean
  }

  return d.reduce((res: RowsReducer, row: EXEL_ROW) => {
    row.A === startKey && (res.canAdd = true)
    row.A === finishKey && (res.canAdd = false)
    if (!res.canAdd) {
      return res;
    }

    const time = getUnixTimeForAction(row["F"], row["K"])
    res.rows[time] = removeEmptyCell(row);
    return res;
  }, { rows: {}, canAdd: false }).rows

}
const d = getRowsWithActions(result.broker_rep)
const g = Object.keys(d).sort().reduce((res, key) => {
  res[key] = d[key]
  return res;
}, {})




fs.writeFile('./build/src/test.json', JSON.stringify(g), () => {
  console.log('complite');

})

export interface EXEL_ROW {
  [key: string]: string
}