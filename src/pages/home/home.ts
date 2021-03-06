import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ActionSheetController, AlertController, NavController, Platform, Events } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { UserProject } from '../../models/userProject';
import { RadioButton } from '../../models/radioButton';
import { AutoTaskTime } from '../../models/autoTaskTime';
import { LoginPage } from '../login/login';
import { PreferencesPage } from '../preferences/preferences';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { EditTaskPage } from '../edit-task/edit-task';
import { CalendarPage } from '../calendar/calendar';
import { MessagesPage } from '../messages/messages';
import { DayTask } from '../../models/dayTask';
import { LocalNotifications} from '@ionic-native/local-notifications'
import { Message } from '../../models/message'
import { GlobalVars } from '../../app/globalVars'
import { UserTask } from '../../models/userTask'
import { Push, PushToken } from '@ionic/cloud-angular';
import { timestamp } from 'ionic-native/node_modules/rxjs/operator/timestamp';
//import { finalize} from 'rxjs/operators';

declare let cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
 raport = {
  "timeOf": 0,
  "startDate": '',
  "endDate": null,
  "comment": null,
  "action": {
    "id": null,
    "name": null
  },
  "countMethod": null,
  "pausedDate": null,
  "paused": false,
  "user": null,
  "project": null,
  "lastUpdateDate":null,
  "lastUpdateTimeOf":0
 }

 user = {
  "activated": this.globalVars.getUser().activated,
  "email": this.globalVars.getUser().email,
  "firstName": this.globalVars.getUser().firstName,
  "id": this.globalVars.getUser().id,
  "imageUrl": this.globalVars.getUser().imageUrl,
  "langKey": this.globalVars.getUser().langKey,
  "lastName": this.globalVars.getUser().lastName,
  "login": this.globalVars.getUser().login,
  "resetDate": null
} 

  dayTask = {
      task_id:0,
      user_id:0,
      date:'',
      hour:'',
      time_spent:''}

      
  pausedTask = {
    task_id:0,
    user_id:0,
    pause_date:null,
    pause_hour:null,
    restart_date:null,
    restart_hour:null,
  }    

  currentDay = {
    workDay:null,
    hourFrom:null,
    hourTo:null,
  }   
  
  newPausedTask = {
    id:0,
    task_id:0,
    user_id:0,
    pause_date:null,
    pause_hour:null,
    restart_date:null,
    restart_hour:null,
  } 
  pushPage = EditTaskPage;
  inProgress:boolean;
  saveDayTask = false;
  dayTasksObjects:any;
  pausedTaskObjects:any;
  userTasks: any;
  tasks: any;
  userPreferences:any;
  time:number;
  firstDay:boolean;
  //user: Array<any>;
  dayTasks: any;
  projects: any;
  project:any;
  unreadMsgs:any;
  oldMsgs:any;
  newMsgs:any;
  autoTaskNotification:any;
  login:string;
  currentDate:string;
  currentTime:string;
  autoTasks:Array<any>;
  userProjectTasks:Array<any>;
  userProjects:Array<any>;
  projectTasks:any;
  radioButtons:RadioButton[]=[];
  task = {title: '', id:''}
  params = {
    raportId:null,
    timeSpent:null,
    projectTime:null
  }
  today = (new Date().getMonth()+1).toString().concat(".".concat((new Date().getUTCDate().toString().concat(".".concat((new Date().getFullYear().toString()))))));
  messages:any;
  amountNewMessages:number = 0;
  user_id:any;
  name:string;
  constructor(public navCtrl: NavController, 
              private restapiService: RestapiServiceProvider, 
              private storage:Storage,
              private actionSheetCtrl:ActionSheetController,
              private alertCtrl:AlertController,
              private localNotifications: LocalNotifications,
              private platform: Platform,
              private events: Events,
              public globalVars:GlobalVars,
              public push:Push) { 
                //this.storage.clear();
        this.storage.get('isLoggedIn').then(value =>{
          if(value == true){
            this.storage.get('zalogowany').then((zalogowany) => {
              console.log('zalogowany: '+JSON.stringify(zalogowany));
              //this.restapiService.login(zalogowany).subscribe(data=>{console.log(data)});
              this.storage.get('apiUrl').then(url =>{
                this.globalVars.setApiUrl(url);
                this.getUserData();
                this.getProjects(null,null);
                this.storage.get('notifications').then(notifications => {
                  this.setAutoTaskNotification(notifications.taskInProgressOption);
                });
                setInterval(()=>{
                  let date;
                  this.setWorkHours();
                  this.storage.get('notifications').then(notifications => {
                    if(notifications.ownNotification == true){
                      date = new Date(new Date(notifications.ownNotificationDate).toLocaleDateString().concat('/'.concat(notifications.ownNotificationTime)));
                      if(date.toLocaleDateString() == new Date().toLocaleDateString() && date.getHours() == new Date().getHours() && date.getMinutes() == new Date().getMinutes()){
                        this.phoneNotification(1,'Twoje powiadomienie:',notifications.ownNotificationMsg);
                        notifications.ownNotification = false;
                        this.storage.set('notifications',notifications)
                      }
                    }
                  });
                },1000);
                this.inProgress = false;
                
                this.events.subscribe('updateViewAfterEdit',()=>{
                  this.getProjects(null,null);
                });

                this.events.subscribe('updateUserData',()=>{
                  this.getUserData();
                });

                this.events.subscribe('changeNotifications',()=>{
                  this.storage.get('notifications').then(data => {
                  }).then(()=>{
                    this.storage.get('notifications').then(notification => {
                    this.setAutoTaskNotification(notification.taskInProgressOption);
                    });
                  });
                });

                setInterval(() => {
                  if(this.globalVars.getCurrentTaskId() != null){
                    this.setWorkHours();
                    //console.log(JSON.stringify(this.currentDay));
                    if(this.currentDay.workDay == true && new Date() > new Date(new Date().toDateString().concat("/".concat(this.currentDay.hourFrom))) && new Date() < new Date(new Date().toDateString().concat("/".concat(this.currentDay.hourTo)))){
                      this.updateCurrentTask(this.globalVars.getCurrentTaskId());
                      console.log('czas++');
                    }
                  }
                }, 5000);

            // this.platform.ready().then((readySource) => {`
            //   this.localNotifications.on('click', (notification, state) => {
            //     let json = JSON.parse(notification.data);
           
            //     let alert = alertCtrl.create({
            //       title: notification.title,
            //       subTitle: json.mydata
            //     });
            //     alert.present();
            //   })
            // });

            // if (platform.is('cordova')){
            //   this.push.register().then((t: PushToken) => {
            //     return this.push.saveToken(t);
            //   }).then((t: PushToken) => {
            //     console.log('Token saved:', t.token);
            //   });
          
            //   this.push.rx.notification();
            // }
    
            // if(this.platform.is('cordova')){
              // setInterval(() => {
              //   this.powiadomienieCykliczne();
              // }, 120000);
              
              this.getMessages();
              setInterval(() => {
                this.getMessages();
              }, 10000);
            // }
          });
            });
          }
          else{
            this.navCtrl.push(LoginPage);
          }
        });
    }

    getUserData(){
      this.restapiService.getUser().then(user => {
        this.globalVars.setUser(user);
        this.name = this.globalVars.getUser().firstName;

        this.user.activated= this.globalVars.getUser().activated,
        this.user.email= this.globalVars.getUser().email,
        this.user.firstName= this.globalVars.getUser().firstName,
        this.user.id= this.globalVars.getUser().id,
        this.user.imageUrl= this.globalVars.getUser().imageUrl,
        this.user.langKey= this.globalVars.getUser().langKey,
        this.user.lastName= this.globalVars.getUser().lastName,
        this.user.login= this.globalVars.getUser().login,
        this.user.resetDate= null
      });
    }

    isNowWorkHour(){
      let nowTime = new Date().getHours().toString().concat(':'.concat(new Date().getMinutes().toString()));
      console.log(this.currentDay.hourFrom+" "+this.currentDay.hourTo+" "+nowTime);
      if(new Date("01.01.2000/".concat(this.currentDay.hourFrom)) < new Date("01.01.2000/".concat(nowTime))){
        if(new Date("01.01.2000/".concat(this.currentDay.hourTo)) > new Date("01.01.2000/".concat(nowTime))){
          return true;
        }
        else return false; 
      }
      else return false;  
    }

    setAutoTaskNotification(interval:number){
      console.log(interval);
      if(interval != 0){
        clearInterval(this.autoTaskNotification);
        this.autoTaskNotification = setInterval(()=>{
          if(this.globalVars.getCurrentTask().count_method == 'automatic'){
            this.phoneNotification(this.globalVars.getCurrentTask().id,'Jesteś w trakcie',this.globalVars.getCurrentTask().name);
          }
        },interval);
      }
      else{
        clearInterval(this.autoTaskNotification);
        console.log('wyczyscilem interval');
      }
    }

    doRefresh(refresher) {
      console.log('Begin async operation', refresher);
      this.getProjects(null,null);
      setTimeout(() => {
        console.log('Async operation has ended');
        refresher.complete();
      }, 2000);
    }

    getMessages(){
      // this.storage.set('deletedMessages',undefined);
      // this.storage.set('unreadMessages',undefined);
      // this.storage.set('oldMessages',undefined);
      this.amountNewMessages = 0;
      this.newMsgs = new Array<any>();
      let allMsgs;
      let currentMsg;
      let unreadMsgs;
      let oldMsgs;
      let deletedMsgs;
      let nju = true;
      this.restapiService.getMessages(null,null).then(data =>{
        allMsgs = data;
        //console.log(data);
      }).then(() =>{
        this.storage.get('unreadMessages').then(data =>{
          unreadMsgs = data;
        }).then(() =>{
          this.storage.get('oldMessages').then(data => {
            oldMsgs = data;
          }).then(()=>{
            this.storage.get('deletedMessages').then(data => {
              if(data == undefined || data == null) deletedMsgs = [];
              else deletedMsgs = data;
                if(unreadMsgs != undefined && unreadMsgs != null)
                this.unreadMsgs = unreadMsgs;
                this.oldMsgs = oldMsgs;
                if(this.unreadMsgs == undefined || this.unreadMsgs == null){
                  this.storage.set('unreadMessages',new Array<any>());
                  //this.unreadMsgs = allMsgs;
                }
                if(this.oldMsgs == undefined || this.oldMsgs == null){
                  this.storage.set('oldMessages',new Array<any>());
                  //this.oldMsgs = [];
                }
                this.globalVars.cleanMessages();
                for(let msg of allMsgs){
                  nju = true;
                  this.globalVars.pushMessage(new Message(
                                                Number(msg.id.toString()+this.globalVars.getUser().id.toString()),
                                                this.globalVars.getUser().id,
                                                msg.title,
                                                msg.content,
                                                new Date(msg.sendDate).toLocaleDateString(),
                                                new Date(msg.sendDate).getHours().toString()
                                                .concat(':'
                                                .concat(new Date(msg.sendDate).getMinutes()<10?
                                                '0'.concat(new Date(msg.sendDate).getMinutes().toString())
                                                :''.concat(new Date(msg.sendDate).getMinutes().toString())))));
                  
                    currentMsg = this.globalVars.getMessages()[(this.globalVars.getMessages().length)-1];
                    
                    if(this.oldMsgs != null && this.oldMsgs != undefined){
                      for(let n of this.unreadMsgs){
                        if(n.id == currentMsg.id){
                          nju = false;
                          break;
                        }
                      }
  
                      if(nju == true){
                        for(let o of this.oldMsgs){
                          if(o.id == currentMsg.id){
                            nju = false;
                            break;
                          }
                        }
                      }
                    }
                    else{
                      this.unreadMsgs = new Array<any>();
                      this.oldMsgs = new Array<any>();
                    }

                    if(nju == true && deletedMsgs.indexOf(currentMsg.id) == -1){
                      this.unreadMsgs.push(currentMsg);
                      this.newMsgs.push(currentMsg);
                      console.log("dodane jako nowe: "+currentMsg.id);
                    }
                    //console.log("przeczytane: "+this.unreadMsgs);
                }
                this.storage.set('unreadMessages',this.unreadMsgs);

                this.unreadMsgs.forEach(msg => {
                  if(msg.userId == this.globalVars.getUser().id)this.amountNewMessages++;
                });
                this.storage.get('notifications').then(notifications=>{
                  if(notifications.newMsgsNotificacion == true){
                      if(this.newMsgs.length != 0){
                      if(this.newMsgs.length == 1){
                      this.phoneNotification(this.newMsgs[0].id,'Raportowanie wiadomość',this.newMsgs[0].title);
                      console.log("nowa wiadomosc: "+this.newMsgs[0].title);
                      }
                      else{
                        this.phoneNotification(this.newMsgs[0].id,'Raportowanie wiadomość',"Masz nowe wiadomości ("+this.newMsgs.length+")");
                        console.log("nowe wiadomosci: "+this.newMsgs.length);
                      }
                      this.newMsgs = new Array<any>();
                    }
                  }
                });
            });
          });
        });
      });
    

    }

    phoneNotification(id:number,title:string,text:string){
        cordova.plugins.notification.local.schedule({
        id: id,
        title: title,
        text: text,
      }); 
    }

    // powiadomienieCykliczne() {
    //   let id = new Date().getUTCDate().toString().
    //   concat(new Date().getMonth().toString().
    //   concat(new Date().getFullYear().toString().
    //   concat(new Date().getHours().toString().
    //   concat(new Date().getMinutes().toString()))));
    //   console.log("Powiadomienie o nr id: "+id+" otrzymane o godzinie "+this.getHour());
    //   cordova.plugins.notification.local.schedule({
    //       id: Number(id),
    //       title: 'Powiadomienie',
    //       text: 'Otrzymano o godzinie: '+this.getHour(),
    //       //trigger: { every: 'minute', count: 3 }
    //     });
    // }

    minutesToHM(time:number){
      let Minutes;
      let hours = Math.floor(time);
      let minutes = Math.floor(60*(time - Math.floor(time)));
      if(minutes < 10){
        Minutes = '0'.concat(minutes.toString());
        return hours.toString().concat(':'.concat(Minutes.toString()));
      }
      else
      return hours.toString().concat(':'.concat(minutes.toString()));
    }

    updateCurrentTask(task_id:number){
      let raport;
      let index = 0;
      let minutesSpent = 0;
      if(this.globalVars.getCurrentTaskId != null){
        for(let project of this.userProjects){
          for(let task of project.tasks){
            if(task[0].endDate == null && task[0].pausedDate == null && task[0].action.id == task_id && task[0].countMethod == 'automatic'){
              this.restapiService.getRaports(task[0].id).then(rap => {
                raport = rap;

                this.userProjects.forEach(up=>{
                  if(up.project.id == raport.project.id){
                    minutesSpent = (Number(this.userProjects[index]['spent'].split(':')[0])*60)+(Number(this.userProjects[index]['spent'].split(':')[1]));
                    minutesSpent++;
                    this.userProjects[index]['spent'] = this.minutesToHM((minutesSpent+1)/60);
                    console.log(Number(this.userProjects[index]['spent'].split(':')[0])+' '+this.userProjects[index].project.numberOfHours);
                    if(Number(this.userProjects[index]['spent'].split(':')[0]) == this.userProjects[index].project.numberOfHours){
                      this.finishTask(this.globalVars.getCurrentTask().id,this.userProjects[index].project.id);
                    }
                  }
                  index++;
                })

                raport.timeOf++;
                this.restapiService.updateRaport(raport.id,raport);
                this.userProjects[this.userProjects.indexOf(project)].
                tasks[this.userProjects[this.userProjects.indexOf(project)].tasks.indexOf(task)][0] = raport;
                this.userProjects[this.userProjects.indexOf(project)].
                tasks[this.userProjects[this.userProjects.indexOf(project)].tasks.indexOf(task)][1] = this.minutesToHM(raport.timeOf/60); 
                this.updateRaportsTime(raport.action.id,raport.project.id,raport.timeOf);
              });
            }
          }
        }
      }
    }

    updateRaportsTime(task_id:number,project_id:number,time:number){
      let raports;
      this.restapiService.getRaports(null).then(data =>{
        raports = data;
        for(let raport of raports){
          if(raport.action.id == task_id && raport.project.id == project_id){
            raport.timeOf = time;
            this.restapiService.updateRaport(raport.id,raport);
          }
        }
      });
    }
  
    updateRaportsComment(task_id:number,project_id:number,comment:string){
      for(let raport of this.userTasks){
        if(raport.action.id == task_id && raport.project.id == project_id){
          raport.comment = comment;
          this.restapiService.updateRaport(raport.id,raport);
        }
      }
    }

    setWorkHours(){
      this.restapiService.getUserPreferences().then(data =>{
        this.userPreferences = data;
        for(let p of this.userPreferences){
          if(p.dayOfWeek == new Date().getDay()){
            this.currentDay.workDay = p.workDay;
            this.currentDay.hourFrom = p.hourFrom;
            this.currentDay.hourTo = p.hourTo;

            this.globalVars.setStartWorkHour(p.hourFrom);
            this.globalVars.setStopWorkHour(p.hourTo);
            break;
          }
        }
      });
    }

    mergeDayTasks(){
      let dayTasks;
      let time;
      let currentDayTaskId;
      let currentDayTask = {
        "taskId": null,
        "projectId": null,
        "date": null,
        "time":null,
        "userId":null,
        "comment":null,
      };
      let currentDayTaskObjects = new Array<any>();
        for(let dt of this.dayTasks){
          console.log('dt: '+currentDayTask.date+" "+currentDayTask.time);
          if(currentDayTask.taskId == null){
            currentDayTask.taskId = dt.taskId;
            currentDayTask.projectId = dt.projectId;
            currentDayTask.date = new Date(dt.date.concat('/00:00'));
            
            if(Math.floor(60*(dt.time/60 - Math.floor(dt.time/60)))>30) currentDayTask.time = Math.floor(dt.time/60)+1;
            else currentDayTask.time = Math.floor(dt.time/60);

            currentDayTask.userId = dt.userId;
            currentDayTask.comment = dt.comment;
          }
          else if(currentDayTask.taskId != dt.taskId || currentDayTask.projectId != dt.projectId || currentDayTask.date != dt.date){
            console.log('nowy: '+currentDayTask.date+" "+currentDayTask.time);
            currentDayTaskObjects.push(new DayTask(currentDayTask.taskId,currentDayTask.projectId,currentDayTask.userId,currentDayTask.date,currentDayTask.time,currentDayTask.comment));
                currentDayTask.taskId = dt.taskId;
                currentDayTask.projectId = dt.projectId;
                currentDayTask.date = new Date(dt.date.concat('/00:00'));
                
                if(Math.floor(60*(dt.time/60 - Math.floor(dt.time/60)))>30) currentDayTask.time = Math.floor(dt.time/60)+1;
                else currentDayTask.time = Math.floor(dt.time/60);

                currentDayTask.userId = dt.userId;
                currentDayTask.comment = dt.comment;
                console.log('nadpisanie: '+currentDayTask.date+" "+currentDayTask.time);
                if(this.dayTasks.indexOf(dt) == this.dayTasks.length-1){
                  console.log('koniec: '+currentDayTask.date+" "+currentDayTask.time);
                  currentDayTaskObjects.push(new DayTask(currentDayTask.taskId,currentDayTask.projectId,currentDayTask.userId,currentDayTask.date,currentDayTask.time,currentDayTask.comment));
                }
          }
          else if(currentDayTask.taskId == dt.taskId && currentDayTask.projectId == dt.projectId && currentDayTask.date == dt.date){
            console.log(Number(currentDayTask.time)+" + "+Number(dt.time))
            currentDayTask.time = Number(currentDayTask.time) + Number(dt.time);
            if(this.dayTasks.indexOf(dt) == this.dayTasks.length-1){
              currentDayTaskObjects.push(new DayTask(currentDayTask.taskId,currentDayTask.projectId,currentDayTask.userId,currentDayTask.date,currentDayTask.time,currentDayTask.comment));
              console.log('koniec: '+currentDayTask.date+" "+currentDayTask.time);
            }
          }
          console.log('currentTask: '+currentDayTask.date+" "+currentDayTask.time);
          console.log('');
        }
        for(let dt of currentDayTaskObjects){
          console.log(dt);
          this.restapiService.saveDayTask(dt);
        }
    }

    getProjects(project_id:number,task_id:number){
      let userIdFound = false;
      let autoTasks = [];
      let autoTasksIds = [];
      let currentAutoTask = null;
      let index;
      let time;
      this.globalVars.setCurrentTaskId(null);
      this.globalVars.setCurrentTaskName(null);
      this.globalVars.setCurrentTaskRaportId(null);
      this.globalVars.setCurrentTaskCountMethod(null);
      this.userProjects = new Array<any>();
      this.userProjectTasks = new Array<any>();
      this.restapiService.getProjects().then(data => {
        this.projects = data;
        this.restapiService.getRaports(null).then(data => {
          this.userTasks = data;
           for(let project of this.projects){
            this.restapiService.getProjectTasks(project.id).subscribe(data => {
              this.projectTasks = data;
              this.restapiService.getUserPreferences().then(data =>{
                this.userPreferences = data;
                this.storage.get('notifications').then(notifications => {
                  currentAutoTask = null;
                  this.projectTasks = new Array<any>();
                  autoTasks = new Array<any>(); 
                  autoTasksIds = new Array<any>(); 
                  this.userProjectTasks = new Array<[any,any]>();
                  for(let raport of this.userTasks){
                    if(project.id == raport.project.id){
                      this.projectTasks.push(raport);
                    }
                  }
                  for(let task of this.projectTasks){
                    if(task.countMethod == 'manual'){
                      if(task.endDate == null){
                        this.globalVars.setCurrentTaskId(task.action.id);
                        this.globalVars.setCurrentTaskName(task.action.name);
                        this.globalVars.setCurrentTaskRaportId(task.id);
                        this.globalVars.setCurrentTaskCountMethod('manual');
                      }
                      this.userProjectTasks.push([task,this.minutesToHM(task.timeOf/60)]);
                      //console.log('czas: '+task.timeOf);
                    }
                    else if(task.endDate == null && task.countMethod == 'automatic'){
                      if(task.pausedDate == null){
                        this.globalVars.setCurrentTaskId(task.action.id);
                        this.globalVars.setCurrentTaskName(task.action.name);
                        this.globalVars.setCurrentTaskRaportId(task.id);
                        this.globalVars.setCurrentTaskCountMethod('automatic');
                        this.setAutoTaskNotification(notifications.taskInProgressOption);
                      }
                      autoTasks.push(task);
                    }
                    else if(task.endDate != null && task.countMethod == 'automatic' && autoTasksIds.indexOf(task.action.id) == (-1)){
                      this.userProjectTasks.push([task,this.minutesToHM(task.timeOf/60)]);
                      autoTasksIds.push(task.action.id);
                    }
                  }

                  index = 1;
                  time = 0;
                  for(let task of autoTasks){
                    if(currentAutoTask == null){
                      currentAutoTask = task;
                      if(project_id == task.project.id && task_id == task.action.id){
                        this.saveDayTask = true;
                        console.log('savedaytask true');
                      }
                    }
                    if(currentAutoTask.action.id != task.action.id){
                      console.log("sumarycznie dla "+currentAutoTask.action.name+": "+this.minutesToHM(time));
                      console.log('');
                      this.userProjectTasks.push([currentAutoTask,this.minutesToHM(time)]);
                      this.updateRaportsTime(currentAutoTask.action.id,currentAutoTask.project.id,time*60);
                      currentAutoTask = task;
                      time = 0;
                    }
                    if(index == autoTasks.length){
                      if(project_id == task.project.id && task_id == task.action.id)this.saveDayTask = true;
                      if(task.pausedDate != null)time+=this.countTime(currentAutoTask.project.id,task.action.id,this.userPreferences,new Date(task.startDate),new Date(task.pausedDate));
                      else if(task.pausedDate == null)time+=this.countTime(currentAutoTask.project.id,task.action.id,this.userPreferences,new Date(task.startDate),new Date());
                      let hours = Math.floor(time);
                      let minutes = Math.floor(60*(time - Math.floor(time)));
                      console.log('');
                      console.log("sumarycznie dla "+currentAutoTask.action.name+": "+this.minutesToHM(time));
                      this.userProjectTasks.push([task,this.minutesToHM(time)]);
                      this.updateRaportsTime(task.action.id,task.project.id,time*60);
                      if(project_id != null) this.mergeDayTasks();
                      continue;
                    }
                    if(task.pausedDate != null){
                      if(project_id == task.project.id && task_id == task.action.id)this.saveDayTask = true;
                      time+=this.countTime(currentAutoTask.project.id,task.action.id,this.userPreferences,new Date(task.startDate),new Date(task.pausedDate));
                      currentAutoTask = task;
                    }
                    else if(task.pausedDate == null){
                      if(project_id == task.project.id && task_id == task.action.id)this.saveDayTask = true;
                      time+=this.countTime(currentAutoTask.project.id,task.action.id,this.userPreferences,new Date(task.startDate),new Date());
                      currentAutoTask = task;
                    }
                    index++;
                    console.log('');
                    this.saveDayTask = false;
                  }
                  this.userProjects.push(new UserProject(project,this.sumUpTasksTime(this.userProjectTasks),this.userProjectTasks));
                });
              });
              });
          }
      });
    });
    }

    sumUpTasksTime(userProjectTasks:Array<any>){
      let totalMinutes = 0;
      let totalHours = 0;
      for(let task of userProjectTasks){
        totalHours += Number(task[1].split(':')[0]);
        totalMinutes += Number(task[1].split(':')[1]);
      }
      return this.minutesToHM((totalMinutes+(totalHours*60))/60);
    }
  //-----------------------------------------------------------------------------------------------------------------------  

//   getTasks() {
//       this.restapiService.getTasks()
//       .then(data => {
//         this.tasks = data;
//       });
//   }

//   getUserTask(task_id:number) {
//     this.restapiService.getUserTask()
//     .then(data => {
//       this.userTasks = data;
//       this.storage.get('zalogowany_id').then((user_id) => {
//         for(let task of this.userTasks){
//           if(user_id == task.user_id && task_id == task.task_id){
//             this.userTask = task;
//             console.log(this.userTask);
//             break;
//           }
//         }
//       });
//     });
// }

//   saveTask() {
//     this.restapiService.saveTask(this.task).then((result) => {
//       console.log(this.task);
//       this.getTasks();
//     }, (err) => {
//       console.log(err);
//     });
//   }

//   deleteTask(id:String) {
//     this.restapiService.deleteTask(id).then((result) => {
//       console.log(result);
//       this.getTasks();
//     }, (err) => {
//       console.log(err);
//     });
//   }

  logout(){
    this.storage.set('isLoggedIn',false);
    this.storage.set('zalogowany', null);
    this.storage.set('zalogowany_id', null);
    this.storage.set('haslo', null);
    this.navCtrl.push(LoginPage);
  }

  pushEditProfilePage(){
    this.navCtrl.push(EditProfilePage);
  }

  pushPreferencesPage(){
    this.navCtrl.push(PreferencesPage);
  }

  pushCalendarPage(){
    this.navCtrl.push(CalendarPage);
  }

  pushMessagesPage(){
    this.navCtrl.push(MessagesPage);
  }

  editTask(raportId:any,timeSpent:any,projectTime:any){
        if(this.isNowWorkHour() == true){
          this.params.raportId = raportId;
          this.params.timeSpent = timeSpent;
          this.params.projectTime = projectTime;
          this.navCtrl.push(EditTaskPage, this.params);
        }
        else this.showalert('Jesteś poza godzinami pracy.');
  }

  menu() {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Zakończone czynności',
          icon:'md-calendar',
          handler: () => {
            this.pushCalendarPage();
          }
        },
        {
          text: 'Edytuj swoje dane',
          icon:'ios-contacts',
          handler: () => {
            this.pushEditProfilePage();
          }
        },
        {
          text: 'Preferencje',
          icon:'md-options',
          handler: () => {
            this.pushPreferencesPage();
          }
        },
        {
          text: 'Wyloguj',
          icon:'md-power',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    actionSheet.present();
  }

  prepareTasksRadioButtons(pt:any,project_id:number){
    console.log(pt);
    let buttons:any;
    let startedTasks:any;
    this.radioButtons = new Array<any>();
    this.globalVars.setButtons([]);
    // this.restapiService.getProjectTasks(project_id).
    // subscribe((data:any) => {
    //   console.log(data);
    // });
      startedTasks = new Array<any>();
      this.projectTasks = pt;
      console.log("--------------------------------");
      for(let task of this.projectTasks){
        if(task.dateTo == null) task.dateTo = new Date("01/01/2999");
        for(let project of this.userProjects){
          if(project.project.id == project_id && project.tasks.length != 0){
            for(let task of project.tasks)startedTasks.push(task[0].action.id);
              if(startedTasks.indexOf(task.id) == -1){
                console.log(task);
                console.log(task.dateTo.valueOf()+' '+new Date().valueOf()+' '+new Date(task.dateFrom).valueOf());
                if(this.radioButtons.length == 0){
                  if(task.dateTo.valueOf() > new Date().valueOf() && new Date().valueOf() > new Date(task.dateFrom).valueOf())
                  this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},false,true));
                  else
                  this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},true,true));
                }
                else{
                  if(task.dateTo.valueOf() > new Date().valueOf() && new Date().valueOf() > new Date(task.dateFrom).valueOf())
                  this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},false,false));
                  else
                  this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},true,false));
                }
              }
          }
          else if(project.project.id == project_id && project.tasks.length == 0){
            console.log(task);
            console.log(task.dateTo.valueOf()+' '+new Date().valueOf()+' '+task.dateFrom.valueOf());
            if(this.radioButtons.length == 0){
              
              if(task.dateTo.valueOf() > new Date().valueOf() && new Date().valueOf() > new Date(task.dateFrom).valueOf())
              this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},false,true));
              else
              this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},true,true));
            }
            else{
              if(task.dateTo.valueOf() > new Date().valueOf() && new Date().valueOf() > new Date(task.dateFrom).valueOf())
              this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},false,false));
              else
              this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},true,false));
            }
          }
        }
      }
      this.globalVars.setButtons(this.radioButtons);
      console.log('butony: '+this.radioButtons);
      return this.globalVars.getButtons();

  }

  prepareCountMethodRadioButtons(){
    this.radioButtons = [];
    this.radioButtons.push(new RadioButton("countMethod","manualnie","radio","manual",false,true));
    this.radioButtons.push(new RadioButton("countMethod","automatycznie","radio","automatic",false,false));
    return this.radioButtons;
  }

  getHour(){
    var minutes = new Date().getMinutes();
    if(minutes < 10){
      return JSON.stringify(new Date().getHours()).concat(':0').concat(JSON.stringify(new Date().getMinutes()));
    }
    else{
      return JSON.stringify(new Date().getHours()).concat(':').concat(JSON.stringify(new Date().getMinutes()));
    }
  }

  startTask(project:any, task:any, countMethod:any, startHour:any){
    let raports;
    if(countMethod == 'automatic'){
      if(startHour.startHour != ''){
        const today = new Date();
        today.setTime(today.getTime() + (1 * 60 * 60 * 1000));
        const todayStr: string = today.toISOString();
        this.raport.startDate = todayStr.substring(0, 11) + startHour.startHour+':00.000Z';
      }
      else if(startHour.startHour == ''){
        this.raport.startDate = new Date().toISOString();
      }
    }
    else if(countMethod == 'manual'){
      this.raport.startDate = new Date().toISOString();
    }
    
    this.raport.action.id = task.id;
    this.raport.action.name = task.title;
    this.raport.countMethod = countMethod;
    //this.raport.userId = this.globalVars.getUser().id;
    this.raport.user = this.user;
    this.raport.project = project;

    this.globalVars.setCurrentTaskId(task.id);
    this.globalVars.setCurrentTaskName(task.title);
    this.globalVars.setCurrentTaskCountMethod(countMethod);
    console.log('zapisujemy raport: '+JSON.stringify(this.raport));
    this.restapiService.saveRaport(this.raport).then(() =>{
      this.restapiService.getRaports(null).then(data => {
        raports = data;
        this.storage.get('notifications').then(notifications => {
          for(let raport of raports){
            if(raport.action.id == task.id && raport.endDate == null && raport.project.id == project.id){
              this.globalVars.setCurrentTaskRaportId(raport.id);
              console.log(this.globalVars.getCurrentTask());
              this.getProjects(null,null);
              break;
            }
          }
          if(countMethod == 'automatic'){
            this.setAutoTaskNotification(notifications.taskInProgressOption);
          }
        });
      });
    });
  }

  finishTask(task_id:number,project_id:number){
    let automatic = false;
    let raports;
    this.restapiService.getRaports(null).then(data =>{
      raports = data;
      for(let raport of raports){
        if(raport.action.id == task_id && raport.project.id == project_id){
          if(raport.timeOf == 0)this.restapiService.deleteRaport(raport.id);
          else{
            raport.endDate = new Date().toISOString();
            this.restapiService.updateRaport(raport.id,raport);
          }
          if(raport.countMethod == 'automatic')automatic = true;
        }
      }
      this.globalVars.setCurrentTaskId(null);
      this.globalVars.setCurrentTaskName(null);
      this.globalVars.setCurrentTaskRaportId(null);
      this.globalVars.setCurrentTaskCountMethod(null);
      if(automatic == true){
        this.dayTasks = new Array<any>();
        this.getProjects(project_id,task_id);
      }
      else this.getProjects(null,null);
      this.showalert("Zakończono czynność.");
    });
  }

  pauseTask(raport_id:number){
    if(this.isNowWorkHour() == false) this.showalert('Jesteś poza godzinami pracy.');
    else{
      for(let raport of this.userTasks){
        if(raport.id == raport_id){
          raport.pausedDate = new Date().toISOString();
          raport.paused = true;
          this.restapiService.updateRaport(raport.id,raport).then(() =>{
            this.globalVars.setCurrentTaskId(null);
            this.globalVars.setCurrentTaskName(null);
            this.globalVars.setCurrentTaskRaportId(null);
            this.globalVars.setCurrentTaskCountMethod('paused');
            this.getProjects(null,null);
            this.showalert("Wstrzymano czynność.");
          });
          break;
        }
      }
    }
  }

  restartTask(raport_id:number,task_id:number){
    let raports;
    if(this.globalVars.getCurrentTask().id != null && this.globalVars.getCurrentTask().id != task_id){
      this.showalert('Nie możesz rozpoczać czynności.<br>Jesteś w trakcie '+this.globalVars.getCurrentTask().name);
    }
    else if(this.isNowWorkHour() == false) this.showalert('Jesteś poza godzinami pracy.');
    else{
      this.restapiService.getRaports(null).then(data => {
        raports = data;
        this.storage.get('notifications').then(notifications => {
          for(let raport of raports){
            if(raport.id == raport_id){
              console.log(raport);
              this.raport.timeOf = raport.timeOf;
              this.raport.startDate = new Date().toISOString();
              this.raport.comment = raport.comment;
              this.raport.action.id = raport.action.id;
              this.raport.action.name = raport.action.name;
              this.raport.countMethod = raport.countMethod;
              this.raport.user = raport.user;
              this.raport.project = raport.project;
              console.log(this.raport);
    
              this.globalVars.setCurrentTaskId(this.raport.action.id);
              this.globalVars.setCurrentTaskName(this.raport.action.name);
              this.globalVars.setCurrentTaskCountMethod(this.raport.countMethod);
              this.setAutoTaskNotification(notifications.taskInProgressOption);
              this.restapiService.saveRaport(this.raport).then(() =>{this.getProjects(null,null);});
              break;
              }
            }
    
              for(let raport of raports){
                if(raport.action.id == this.raport.action.id && raport.endDate == null && raport.project.id == this.raport.project.id){
                  this.globalVars.setCurrentTaskRaportId(raport.id);
                  console.log('currentTask: '+this.globalVars.getCurrentTask().id+" "+this.globalVars.getCurrentTask().name+" "+this.globalVars.getCurrentTask().raport_id);
                  this.showalert("Wznowiono czynność.");
                  break;
                }
              }
          });
    });
    }
  }

  podgląd(d:any,start:any,end:any){
    let tmp = this.timeBetween(end,start);
    let hours = Math.floor(tmp/3600000);
    let minutes = Math.floor(60*(tmp/3600000 - Math.floor(tmp/3600000)));
    console.log(d.toLocaleDateString()+" "+"godz: "+start+"-"+end+" "+hours+"h "+minutes+"m");
  }

  countTime(project_id:number,task_id:number,pref:any,startDate:Date,endDate:Date){
    // console.log(startDate.getMonth()+' '+new Date(endDate).getMonth()+' '+startDate.getUTCDate()+' '+new Date(endDate).getUTCDate());
    // console.log(startDate+' '+startDate.getUTCDate());
    // console.log(endDate+' '+endDate.getUTCDate());
    let time = 0;
    let reportStartHour;
    let reportEndHour;
    let workStartHour;
    let workEndHour;
    let workDay;
    let hours;
    let minutes;
    let dayTime;
    this.firstDay = true;
    this.userPreferences = pref;
    let nowHour = new Date().getHours().toString().concat(":".concat(new Date().getMinutes().toString()));
              for(let d = startDate;d.getMonth()<=new Date(endDate).getMonth() && d.getUTCDate()<=new Date(endDate).getUTCDate();d.setDate(d.getDate()+1)){
                //console.log(d.toLocaleDateString());
                for(let p of this.userPreferences){
                  if(p.dayOfWeek == d.getDay()){
                    workStartHour = p.hourFrom;
                    workEndHour = p.hourTo;
                    workDay = p.workDay;
                    break;
                  }
                }
                if(workDay == true){
                  reportStartHour = startDate.getHours().toString().concat(":".concat(startDate.getMinutes().toString()));
                  reportEndHour = endDate.getHours().toString().concat(":".concat(endDate.getMinutes().toString()));
                  let tmp;
                  
                  if(this.firstDay == true && startDate.toLocaleDateString() != endDate.toLocaleDateString()){
                    dayTime = this.timeBetween(workEndHour,reportStartHour);
                    time += this.timeBetween(workEndHour,reportStartHour);
                    this.podgląd(d,reportStartHour,workEndHour);
                  }//pierwszy dzień, liczymy od startTask do endDay
  
                  else if(this.firstDay == true && startDate.toLocaleDateString() == endDate.toLocaleDateString()){
                    if(endDate.toLocaleDateString() == new Date().toLocaleDateString()){//spełnione gdy nie jest spauzowane
                      if(new Date("01.01.2000/".concat(workEndHour)) > new Date("01.01.2000/".concat(nowHour))){
                        dayTime = this.timeBetween(nowHour,reportStartHour);
                        time += this.timeBetween(nowHour,reportStartHour);
                        this.podgląd(d,reportStartHour,nowHour);
                        console.log('przed koncem zmiany');
                      }
                      else if(new Date("01.01.2000/".concat(workEndHour)) < new Date("01.01.2000/".concat(nowHour))){
                        dayTime = this.timeBetween(workEndHour,reportStartHour);
                        time += this.timeBetween(workEndHour,reportStartHour);
                        this.podgląd(d,reportStartHour,workEndHour);
                        console.log('po zmianie');
                      } 
                    }
                    else{
                      dayTime = this.timeBetween(reportEndHour,reportStartHour);
                      time += this.timeBetween(reportEndHour,reportStartHour);
                      this.podgląd(d,reportStartHour,reportEndHour);
                      console.log('else?');
                    }
                  }//pierwszy i ostatni dzień
  
                  else if(this.firstDay == false && d.toLocaleDateString() == endDate.toLocaleDateString()){
                    if(endDate == new Date()){
                      if(new Date("01.01.2000/".concat(workEndHour)) > new Date("01.01.2000/".concat(nowHour))){
                        dayTime = this.timeBetween(nowHour,workStartHour);
                        time += this.timeBetween(nowHour,workStartHour);
                        this.podgląd(d,workStartHour,nowHour);
                        console.log('przed koncem zmiany');
                      }
                      else if(new Date("01.01.2000/".concat(workEndHour)) < new Date("01.01.2000/".concat(nowHour))){
                        dayTime = this.timeBetween(workEndHour,workStartHour);
                        time += this.timeBetween(workEndHour,workStartHour);
                        this.podgląd(d,workStartHour,workEndHour);
                        console.log('po zmianie');
                      } 
                    }
                    else{
                      dayTime = 
                      time += this.timeBetween(reportEndHour,workStartHour);
                      this.podgląd(d,workStartHour,reportEndHour);
                    }
                  }//nie pierwszy ale ostatni, bo dzisiaj
  
                  else{
                    dayTime = 
                    time += this.timeBetween(workEndHour,workStartHour);
                    this.podgląd(d,workStartHour,workEndHour);
                  }//każdy dzień pomiędzy, liczymy od startDay do endDay
                }
                this.firstDay = false;
                
                hours = Math.floor(dayTime/3600000);
                minutes = Math.floor(60*(dayTime/3600000 - Math.floor(dayTime/3600000)));
                if(this.saveDayTask == true){
                  this.dayTasks.push(new DayTask(task_id,project_id,this.globalVars.getUser().id,d.toLocaleDateString(),((hours*60)+minutes),null));
                }
              }
              time = time/3600000;
              hours = Math.floor(time);
              minutes = Math.floor(60*(time - Math.floor(time)));
              console.log("sumarycznie dla raportu: "+hours+":"+minutes);
              return time;
  }

  timeBetween(from:string,then:string){
    return (new Date("01.01.2000/".concat(from)).getTime()-new Date("01.01.2000/".concat(then)).getTime())
  }


  finishTaskPrompt(task_id:number, project_id:number, project_name:string) {
    if(this.isNowWorkHour() == false) this.showalert('Jesteś poza godzinami pracy.');
    else{
      this.restapiService.getUserTask()
      const alert = this.alertCtrl.create({
        title: 'Zakończyć '+project_name+'?',
        buttons: [
          {
            text: 'Anuluj',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Zakończ',
            handler: () => {
              this.finishTask(task_id,project_id);
            }
          }
        ]
      });
      alert.present();
    }
  }

  selectTaskToStart(project:any) {
    if(this.isNowWorkHour() == false) this.showalert('Jesteś poza godzinami pracy.');
    else{
      this.restapiService.getRaports(null)
      .then(userTasks => {
        let inputs;
        console.log('currentTask: '+this.globalVars.getCurrentTask().id+" "+this.globalVars.getCurrentTask().name);
          if(this.globalVars.getCurrentTask().id != null
          && this.globalVars.getCurrentTask().id != undefined
          && this.globalVars.getCurrentTask().name != null
          && this.globalVars.getCurrentTask().name != undefined){
            this.showalert('Nie możesz rozpoczać czynności.<br>Jesteś w trakcie '+this.globalVars.getCurrentTask().name);
          }
          else{
            this.restapiService.getProjectTasks(project.id).subscribe(ProjectTasks => {
              inputs = this.prepareTasksRadioButtons(ProjectTasks,project.id);
              const tasksAlert = this.alertCtrl.create({
                title: "Czynnosci w "+project.name,
                inputs: inputs,        
                buttons: [
                  {
                    text: 'Anuluj',
                    role: 'cancel',
                    handler: () => {
                    }
                  },
                  {
                    text: 'Rozpocznij',
                    handler: data => {
                      this.selectCountMethod(project,data);
                    }
                  }
                ]
              });
              if(inputs != '')tasksAlert.present();
              else this.showalert('Brak czynności w '+project.name);
            });
          }
      });
    }
  }

  selectStartDate(projectId:any,taskToStart:any, data:any) {
    const tasksAlert = this.alertCtrl.create({
      title: "Godzina rozpoczęcia:",
      inputs: [
        {
        name: 'startHour',
        type: 'time'
        }
      ],      
      buttons: [
        {
          text: 'OK',
          handler: startHour => {
            this.startTask(projectId,taskToStart, data, startHour);
          }
        }
      ]
    });
    tasksAlert.present();
}

  selectCountMethod(project:any,taskToStart:any) {
          const tasksAlert = this.alertCtrl.create({
            title: "Metoda zliczania czasu:",
            inputs: this.prepareCountMethodRadioButtons(),      
            buttons: [
              {
                text: 'OK',
                handler: data => {
                  console.log('selectcount: '+data);
                  if(data == 'manual') this.startTask(project,taskToStart, data, null);
                  else this.selectStartDate(project,taskToStart, data);
                }
              }
            ]
          });
          tasksAlert.present();
  }
  

  showalert(info:string) {
    const alert = this.alertCtrl.create({
      title: info,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            //this.startTask(data);
          }
        }
      ]
    });
    alert.present();
  }
}
