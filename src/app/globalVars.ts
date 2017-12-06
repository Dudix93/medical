import {Injectable} from '@angular/core';

@Injectable()
export class GlobalVars {
  token:any;
  apiUrl:any;
  messages = new Array<any>();
  newMessages = new Array<any>();
  oldMessages = new Array<any>();

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
  
  setNewMessages(value){
    this.newMessages = value;
  }

  pushNewMessage(value){
    this.newMessages.push(value);
  }

  getNewMessages(){
    return this.newMessages;
  }

  cleanNewMessages(){
    this.newMessages = new Array<any>();
  }

  setOldMessages(value){
    this.oldMessages = value;
  }

  pushOldMessage(value){
    this.oldMessages.push(value);
  }

  getOldMessages(){
    return this.oldMessages;
  }

  cleanOldMessages(){
    this.oldMessages = new Array<any>();
  }
}