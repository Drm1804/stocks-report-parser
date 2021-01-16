import { CurrencyCb, CurrencyCBConfig } from './currency-cb';
import { Database, DatabaseConfig } from './database';
import {conf} from '../config'

const currenciesConf: CurrencyCBConfig = {
  startDate: '2019-01-01',
  baseUrl: 'http://www.cbr.ru/scripts/XML_daily.asp?date_req=',
  currencies: ['USD', 'EUR']
}

const dbConfig: DatabaseConfig = conf.firebase;

const c = new CurrencyCb(currenciesConf);
const db = new Database(dbConfig);

(async function () {
  const cur = await c.grab();
  const sorted = Object.keys(cur).sort().reduce((res, key) => {
    res[key] = cur[key]
    return res;
  }, {})

  const promises = Object.keys(sorted).map((key: string) => {
    db.setCurrencies(key, cur[key]);
  })


  await Promise.all(promises);

})()
