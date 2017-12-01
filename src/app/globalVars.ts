import {Injectable} from '@angular/core';

@Injectable()
export class GlobalVars {
  tok:any;

  constructor() {
  }

  setToken(value) {
    this.tok = value;
  }

  getToken() {
    return this.tok;
  }

}