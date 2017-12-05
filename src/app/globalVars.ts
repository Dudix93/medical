import {Injectable} from '@angular/core';

@Injectable()
export class GlobalVars {
  token:any;
  apiUrl:any;
  messages = new Array<any>();

  constructor() {
  }

  setToken(value) {
    this.token = value;
  }

  getToken() {
    return this.token;
  }

  setApiUrl(value) {
    this.apiUrl = value;
  }

  getApiUrl() {
    return this.apiUrl;
  }

  pushMessage(value){
    this.messages.push(value);
  }

  getMessages(){
    return this.messages;
  }

  cleanMessages(){
    this.messages = new Array<any>();
  }

}