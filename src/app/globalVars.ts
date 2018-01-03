import {Injectable} from '@angular/core';

@Injectable()
export class GlobalVars {
  token:any;
  apiUrl:any;
  projectTasks:any;
  selectedTask:any;
  selectedProject:any;
  startWorkHour:any;
  stopWorkHour:any;

  messages = new Array<any>();
  newMessages = new Array<any>();
  oldMessages = new Array<any>();
  buttons = new Array<any>();

  user ={
    "activated": true,
    "authorities": [],
    "createdBy":'',
    "createdDate": "",
    "email": "",
    "firstName": "",
    "id": 0,
    "imageUrl": "",
    "langKey": "",
    "lastModifiedBy": "",
    "lastModifiedDate": "",
    "lastName": "",
    "login": "",
    "password": ""
  }

  raport = {
    "id":0,
    "timeOf":0,
    "startDate":null,
    "endDate":null,
    "comment":" ",
    "action":{"id":0,"name":""},
    "countMethod":"",
    "pausedDate":"",
    "paused":false,
    "userId":0,
    "projectId":0,
    "lastUpdateDate":"",
    "lastUpdateTimeOf":0
  }

  currentTask = {
    "id":null,
    "name":null,
    "raport_id":null,
  }

  constructor() {
  }

  setStartWorkHour(value) {
    this.startWorkHour = value;
  }

  getStartWorkHour() {
    return this.startWorkHour;
  }

  setStopWorkHour(value) {
    this.stopWorkHour = value;
  }

  getStopWorkHour() {
    return this.stopWorkHour;
  }

  setSelectedTask(value) {
    this.selectedTask = value;
  }

  getSelectedTask() {
    return this.selectedTask;
  }

  setSelectedProject(value) {
    this.selectedProject = value;
  }

  getSelectedProject() {
    return this.selectedProject;
  }

  getCurrentTask() {
    return this.currentTask;
  }

  getCurrentTaskRaportId() {
    return this.currentTask.raport_id;
  }

  setCurrentTaskRaportId(value) {
    this.currentTask.raport_id = value;
  }

  getCurrentTaskId() {
    return this.currentTask.id;
  }

  setCurrentTaskId(value) {
    this.currentTask.id = value;
  }
  
  setCurrentTaskName(value) {
    this.currentTask.name = value;
  }

  getProjectTasks() {
    return this.projectTasks;
  }

  setProjectTasks(value) {
    this.projectTasks = value;
  }

  getRaport() {
    return this.raport;
  }

  setRaport(value) {
    this.raport = value;
  }

  setTimeOf(value) {this.raport.timeOf = value;}
  
  setComment(value) {this.raport.comment = value;}

  setLastUpdateTimeOf(value) {this.raport.lastUpdateTimeOf = value;}

  setLastUpdateDate(value) {this.raport.lastUpdateDate = value;}
//-----------------------------------------------------------
  getButtons() {
    return this.buttons;
  }

  setButtons(value) {
    this.buttons = value;
  }
//-----------------------------------------------------------
  getToken() {
    return this.token;
  }

  setToken(value) {
    this.token = value;
  }
//-----------------------------------------------------------
  setApiUrl(value) {
    this.apiUrl = value;
  }

  getApiUrl() {
    return this.apiUrl;
  }
//-----------------------------------------------------------
  pushMessage(value){
    this.messages.push(value);
  }

  getMessages(){
    return this.messages;
  }

  cleanMessages(){
    this.messages = new Array<any>();
  }
//-----------------------------------------------------------  
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
//-----------------------------------------------------------
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
//--------------------------------------------------------
  setUser(value){this.user = value;}

  getUser(){return this.user;}

  setUserFirstName(value){this.user.firstName = value;}

  setUserEmail(value){this.user.email = value;}

  setUserLastname(value){this.user.lastName = value;}

  setUserPassword(value){this.user.password = value;}

}