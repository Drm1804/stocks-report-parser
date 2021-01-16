import dayjs from 'dayjs'
import * as xml2js from 'xml2js';
import fetch from 'node-fetch';

export class CurrencyCb {
  private format = 'YYYY-MM-DD';
  private conf: CurrencyCBConfig
  private store: CurrencyStore = {};
  constructor(conf: CurrencyCBConfig) {
    this.conf = conf;
  }

  public async grab(): Promise<CurrencyStore> {
    const dates = this.generateDates(this.conf.startDate);

    const promises = dates.map(async (data: string) => {
      const url = `${this.conf.baseUrl}${this.parceDateToCBFormat(data)}`;
      const xml = await this.fetchXML(url);

      const json = await this.xmlParcer(xml);
      this.store[data] = json['ValCurs']['Valute'].reduce((res, el) => {
        this.conf.currencies.includes(el['CharCode'][0]) && (res[el['CharCode'][0]] = el['Value'][0])

        return res;
      }, {});

    });

    await Promise.all(promises);

    return this.store;

  }

  private parceDateToCBFormat(date: string): string {
    return date.split('-').reverse().join('/')
  }

  private async fetchXML(url: string): Promise<string> {
    let xml;
    try {
      const res = await fetch(url);
      xml = await res.text();
    } catch (e) {
      console.error(e);
    }

    return xml
  }


  private xmlParcer(xml: string) {
    let result;
    try {
      xml2js.parseString(xml, (err, res) => {
        res && console.error(err);
        result = res;
      })
    } catch (e) {
      console.error(e)
    }

    return result
  }



  private generateDates(start: string): string[] {
    let iteration = dayjs(start);
    const dates = [];
    while (iteration < dayjs()) {
      dates.push(iteration.format(this.format));
      iteration = iteration.add(1, 'day');
    }
    return dates;
  }

}

export interface CurrencyCBConfig {
  startDate: string; //2018-12-31 
  currencies: string[];
  baseUrl: string;
}

export interface CurrencyStore {
  // 2018-12-31 : {}
  [key: string]: CurrenciesSet
}

export type CurrenciesSet = {
  [key in Currencies]: string
}

export enum Currencies {
  'AUD', 'GBP', 'BYR', 'DKK', 'USD', 'EUR', 'ISK', 'KZT', 'CAD', 'NOK', 'XDR', 'SGD', 'TRL', 'UAH', 'SEK', 'CHF', 'JPY',
}

