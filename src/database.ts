import firebase from 'firebase';

import { CurrenciesSet } from './currency-cb';


export class Database {
  currensierRef: any;
  constructor(conf: DatabaseConfig) {
    try {
      firebase.initializeApp(conf);
      this.currensierRef = firebase.database().ref('cur');

    } catch (err) {
      console.log(err);
    }
  }

  public async setCurrencies(key: string, data: CurrenciesSet): Promise<void> {
    await this.currensierRef.child(key).update(data);
  }
}

export interface DatabaseConfig {
  apiKey: string,
  authDomain: string,
  databaseURL: string,
  projectId: string,
  storageBucket: string,
  messagingSenderId: string,
  appId: string
}