import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Push, PushToken } from '@ionic/cloud-angular';
import { ActionSheetController, AlertController, ToastController, NavController, Platform, Events } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { UserProject } from '../../models/userProject';
import { RadioButton } from '../../models/radioButton';
import { UserTask } from '../../models/userTask';
import { AutoTaskTime } from '../../models/autoTaskTime';
import { LoginPage } from '../login/login';
import { PreferencesPage } from '../preferences/preferences';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { EditTaskPage } from '../edit-task/edit-task';
import { CalendarPage } from '../calendar/calendar';
import { MessagesPage } from '../messages/messages';
import { DayTask } from '../../models/dayTask';
import { LocalNotifications} from '@ionic-native/local-notifications'
import {GlobalVars} from '../../app/globalVars'

declare let cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  userTask = {
    id:0,
    user_id: '', 
    task_id: '',
    task_title:'', 
    update_date:'', 
    update_hour:'', 
    update_time:0, 
    time_spent:0, 
    start_date:'', 
    start_hour:'',
    description:'',
    latest_dayTask:0,
    latest_pausedTask:0,
    count_method:'',
    paused:false,  
    finish_date:'',
    finish_hour:''}

    newUserTask = {
      user_id:null, 
      task_id:null,
      task_title:null, 
      update_date:null, 
      update_hour:null, 
      update_time:null, 
      time_spent:null, 
      start_date:null, 
      start_hour:null,
      description:null,
      latest_dayTask:null,
      latest_pausedTask:null,
      count_method:null,
      paused:false, 
      finish_date:null,
      finish_hour:null}

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
  dayTasksObjects:any;
  pausedTaskObjects:any;
  userTasks: any;
  tasks: any;
  userPreferences:any;
  time:number;
  firstDay:boolean;
  user: Array<any>;
  dayTasks: Array<number>;
  projects: any;
  project:any;
  login:string;
  currentDate:string;
  currentTime:string;
  name:string;
  autoTasks:Array<any>;
  userProjectTasks:Array<any>;
  userProjects:Array<any>;
  userProject:UserProject[]=[];
  radioButtons:RadioButton[]=[];
  task = {title: '', id:''}
  params = {
    task_title: '', 
    task_id:0,
    hours:0,
    minutes:0 
  }
  today = (new Date().getMonth()+1).toString().concat(".".concat((new Date().getUTCDate().toString().concat(".".concat((new Date().getFullYear().toString()))))));
  messages:any;
  message = {
    "message":'',
    "sent":true,
    "date":'',
    "time":'',
    "read":'',
  }
  amountNewMessages:number = 0;

  constructor(public navCtrl: NavController, 
              private restapiService: RestapiServiceProvider, 
              private storage:Storage,
              private actionSheetCtrl:ActionSheetController,
              private alertCtrl:AlertController,
              private toastCtrl:ToastController,
              public push:Push,
              private localNotifications: LocalNotifications,
              private platform: Platform,
              private events: Events,
              public globalVar:GlobalVars) { 
        this.storage.get('isLoggedIn').then(value =>{
          if(value == true){
            this.storage.get('zalogowany').then((val) => {
              this.login = val;
            //this.getUserProjectsAndTasks();
            this.getProjects();
            this.inProgress = false;
            this.events.subscribe('updateViewAfterEdit',()=>{
              this.getUserProjectsAndTasks();
            });
            this.platform.ready().then((readySource) => {
              this.localNotifications.on('click', (notification, state) => {
                let json = JSON.parse(notification.data);
           
                let alert = alertCtrl.create({
                  title: notification.title,
                  subTitle: json.mydata
                });
                alert.present();
              })
            });
            if(this.platform.is('cordova')){
              this.scheduleNotification();
              this.getMessages();
              setInterval(() => {
                this.getMessages();
              }, 30000);
            }
            });
          }
        });
    }

    getMessages() {
      this.restapiService.getMessages(null,null).then(data => {
        this.messages = data;
        for(let msg of this.messages){
          if(msg.read == false) this.amountNewMessages++;
          if(msg.sent == false){
            cordova.plugins.notification.local.schedule({
              id: msg.id,
              title: 'Wiadomosc',
              text: msg.message,
              icon:'ios-mail-outline'
            });
            this.message.message = msg.message;
            this.message.date = msg.date;
            this.message.time = msg.time;
            this.message.read = msg.read;
            this.restapiService.updateMessages(msg.id,this.message);
          }
        }
        console.log("new messages: "+this.amountNewMessages);
      });
    }

    scheduleNotification() {
      this.storage.get('not_id').then((ajdi) => {
        cordova.plugins.notification.local.schedule({
          id: 1,
          title: 'Powiadomienie',
          text: 'Treść powiadomienia',
          //data: { mydata: 'My hidden message' },
          trigger: { every: 'minute', count: 2 },
          icon:'md-alarm'
        });
      });
    }

    getProjects(){
      console.log('API URL: '+this.globalVar.getApiUrl());
      let userIdFound = false;
      this.restapiService.getProjects().then(data => {
        this.projects = data;
        for(let project of this.projects){
          for(let user of project.users){
            if(userIdFound == false){
              this.storage.get('zalogowany').then(stored_login => {
                if(user.login == stored_login){
                  let user_id = user.id;
                  this.storage.set('zalogowany_id',user_id);
                  this.name = user.firstName;
                  console.log('ajdi: '+user.id);
                  userIdFound = true;
                }
              });
            }
            else break;
          }
        }
        this.storage.get('zalogowany_id').then(value => {console.log("zalogowany id "+value)});
        this.storage.get('zalogowany').then(value => {console.log("zalogowany "+value)});
        console.log(this.projects);
      })
    }
  //-----------------------------------------------------------------------------------------------------------------------  
  getUserProjectsAndTasks() {
    this.autoTasks = new Array<any>();
    this.storage.get('zalogowany_id').then((val) => {
      this.restapiService.getUser(val)
      .then(data => {
        this.user = new Array<any>();
        this.user.push(data);
          this.restapiService.getProjects()
          .then(data => {
            this.projects = data;
            this.restapiService.getTasks()
            .then(data => {
              this.tasks = data;
              this.restapiService.getUserTask()
              .then(data => {
                this.userTasks = data;
                this.userProjects = new Array<any>();
                if(this.user[0].projects != null){
                  for(let userProject of this.user[0].projects){
                    this.userProjectTasks = new Array<any>();
                    for(let project of this.projects){
                      if(project.id == userProject){
                        //console.log(project);
                        this.project = project;

                          for(let userTask of this.userTasks){
                            for(let projectTasks of project.tasks){
                              if(userTask.finish_date == null){
                                this.storage.set('current_task_id', userTask.task_id);
                                this.storage.set('current_task_title', userTask.task_title);
                              }
                              if(userTask.task_id == projectTasks){
                                    this.userProjectTasks.push(userTask);
                                    if(userTask.count_method == 'automatic' && userTask.finish_date == null){
                                      //console.log(new Date(userTask.start_date.concat("/".concat(userTask.start_hour))));
                                      this.countTime(userTask.task_id,userTask.start_date,new Date(userTask.start_date.concat("/".concat(userTask.start_hour))));
                                    }
                                    continue;
                              }
                            }
                        }
                      
                      this.userProjects.push(new UserProject(project.id,project.title,this.userProjectTasks));
                      console.log(this.userProjectTasks);
                    }
                  }
                }
              }
              else this.projects = null; 
            });
            });
          });
      });
    });
  }

  getTasks() {
      this.restapiService.getTasks()
      .then(data => {
        this.tasks = data;
      });
  }

  getUserTask(task_id:number) {
    this.restapiService.getUserTask()
    .then(data => {
      this.userTasks = data;
      this.storage.get('zalogowany_id').then((user_id) => {
        for(let task of this.userTasks){
          if(user_id == task.user_id && task_id == task.task_id){
            this.userTask = task;
            console.log(this.userTask);
            break;
          }
        }
      });
    });
}

  saveTask() {
    this.restapiService.saveTask(this.task).then((result) => {
      console.log(this.task);
      this.getTasks();
    }, (err) => {
      console.log(err);
    });
  }

  deleteTask(id:String) {
    this.restapiService.deleteTask(id).then((result) => {
      console.log(result);
      this.getTasks();
    }, (err) => {
      console.log(err);
    });
  }

  logout(){
    this.storage.set('zalogowany', null);
    this.storage.set('zalogowany_id', null);
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
    console.log('messagePage');
    this.navCtrl.push(MessagesPage);
  }

  editTask(task_id:number, task_title:string, hours:number, minutes:number){
    this.storage.get('current_task_id').then((id) => {
      this.storage.get('current_task_title').then((title) => {
        this.params.task_id = id;
        this.params.task_title = title;
        this.params.hours = hours;
        this.params.minutes = minutes;
        this.navCtrl.push(EditTaskPage, this.params);
      });
    });
  }

  menu() {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Czynności skończone',
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

  prepareTasksRadioButtons(project_id:number){
    this.radioButtons = [];
    //console.log(this.userProjectTasks);
    for(let project of this.userProjects){
      if(project.id == project_id){
        for(let task of this.tasks){
          if(project_id == task.project_id){
   
              if(!this.user[0].tasks.includes(task.id)){
                if(this.radioButtons.length == 0){
                  this.radioButtons.push(new RadioButton("taskToStart",task.title,"radio",{"id":task.id, "title":task.title},true));
                }
                else{
                  this.radioButtons.push(new RadioButton("taskToStart",task.title,"radio",{"id":task.id, "title":task.title},false));
                }
                continue;
              }
            
          }
        }
      }
    }
    return this.radioButtons;
  }

  prepareCountMethodRadioButtons(){
    this.radioButtons = [];
    this.radioButtons.push(new RadioButton("countMethod","manualnie","radio","manual",true));
    this.radioButtons.push(new RadioButton("countMethod","automatycznie","radio","automatic",false));
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

  startTask(task:any, countMethod:any, startHour:any){
    console.log(task);
    console.log(countMethod);
    console.log(startHour);
    if(task != undefined){
      this.dayTasks = new Array<any>();
      this.currentDate = this.today;
      this.currentTime = this.getHour();
      this.user[0].tasks.push(task.id);
      this.dayTask.hour = this.currentTime;
      this.dayTask.date = this.currentDate;
      this.dayTask.task_id = task.id;
      this.dayTask.user_id = this.user[0].id;
      this.newUserTask.start_date = this.currentDate;
      if(startHour == null)this.newUserTask.start_hour = this.currentTime;
      else this.newUserTask.start_hour = startHour.startHour;
      this.newUserTask.user_id = this.user[0].id;
      this.newUserTask.task_id = task.id;
      this.newUserTask.task_title = task.title;
      this.newUserTask.count_method = countMethod;
      this.restapiService.saveDayTask(this.dayTask);
      this.restapiService.getLatestDayTask(task.id).then(data => {
        this.dayTasks = new Array<number>();
        this.dayTasksObjects = data;
        console.log(data);
        for(let dayTask of this.dayTasksObjects){
          this.newUserTask.latest_dayTask = dayTask.id;
          console.log(dayTask.id);
          break;
        }
        this.restapiService.startTask(this.user[0], this.newUserTask);
        this.storage.set('current_task_id', task.id);
        this.storage.set('current_task_title', task.title);
      });
    }
    this.getUserProjectsAndTasks();
  }

  finishTask(hours:any,minutes:any){
    let k = new Array<any>();
    this.userTask.finish_date = new Date().toLocaleDateString();
    this.userTask.finish_hour = this.getHour();
    if(this.userTask.count_method == 'automatic'){
      this.storage.forEach((value,key)=>{
        k = key.split(' ');
        if(k[0] == this.userTask.task_id && value != '0:0')
        {
          console.log(key+" "+value);
          this.restapiService.saveDayTask(new DayTask(
            Number(this.userTask.task_id),
            Number(this.userTask.user_id),
            k[1].replace(/\//g,'.'),//date
            value,//time spent
          ));
          this.storage.remove(key);
        }
      });
      console.log('------------NAPRAW USUWANIE ZE STORAGE--------------------------');
      this.storage.forEach((value,key)=>{console.log(key+" "+value)});
    }
    if(hours != null && minutes != null){
      this.userTask.time_spent = hours.toString().concat(":".concat(minutes));
    }
    //console.log(this.userTask);
    this.restapiService.updateUserTask(this.userTask.id, this.userTask);
    this.storage.set('current_task_id', null);
    this.storage.set('current_task_title', null);
    this.getUserProjectsAndTasks();
  }

  pauseTask(task_id:number){
    let preferences:any;
    this.restapiService.getUserPreferences().then((data) =>{
      preferences = data;
      for(let day of preferences){
        console.log("preferences: "+day.day);
      }
      // this.restapiService.getUserTask()
      // .then(data => {
      //   this.userTasks = data;
      //   this.storage.get('zalogowany_id').then((user_id) => {
      //     for(let task of this.userTasks){
      //       this.storage.get("current_task_id").then((id) => {
      //         if(id == task.task_id){
      //           this.userTask = task;
      //           this.userTask.paused = true;
      //           this.pausedTask.task_id = id;
      //           this.pausedTask.user_id = user_id;
      //           this.pausedTask.pause_date = this.today;
      //           this.pausedTask.pause_hour = this.getHour();
      //           this.restapiService.savePausedTask(this.pausedTask);
      //           this.restapiService.updateUserTask(this.userTask.id,this.userTask);
      //           this.showalert("Wstrzymano czynność.");
      //         }
      //       });
      //     }
      //   });
      // });
    });
    this.getUserProjectsAndTasks();
  }

  restartTask(task_id:number){
    this.restapiService.getUserTask()
    .then(data => {
      this.userTasks = data;
      this.storage.get('zalogowany_id').then((user_id) => {
        for(let task of this.userTasks){
          this.storage.get("current_task_id").then((id) => {
            if(id == task.task_id){
              this.restapiService.getLatestPausedTask(id,user_id)
              .then(data => {
                this.userTask = task;
                this.userTask.paused = false;
                this.pausedTaskObjects = new Array<any>();
                this.pausedTaskObjects = data;
                this.newPausedTask = this.pausedTaskObjects[0];
                this.newPausedTask.restart_date = new Date().toLocaleDateString();
                this.newPausedTask.restart_hour = this.getHour();
                this.restapiService.updatePausedTask(this.newPausedTask.id,this.newPausedTask);
                this.restapiService.updateUserTask(this.userTask.id,this.userTask);
                this.restapiService.updateUserTask(this.userTask.id,this.userTask);
                this.showalert("Wznowiono czynność.");
              });
            }
          });
        }
      });
    });
    this.getUserProjectsAndTasks();
  }

  countTime(task_id:number,start_date:string,date:Date){
    let time = 0;
    let DayTime = 0;
    let pausedTime = 0;
    let pausedHour = null;
    let pausedDate = null;
    let taskStartHour = '';
    let startHour = date.getHours().toString().concat(":".concat(date.getMinutes().toString()));
    this.firstDay = true;
    this.restapiService.getUserPreferences()
    .then(data =>{
      this.userPreferences = data;
      this.storage.get('zalogowany_id').then(user_id =>{
        for(let pref of this.userPreferences){
          if(pref.user_id == user_id){
            this.restapiService.getLatestPausedTask(task_id,user_id)
            .then(data =>{
              this.pausedTaskObjects = data;
              if(this.pausedTaskObjects != ''){
                if(this.pausedTaskObjects[0].restart_hour == null){
                  pausedHour = this.pausedTaskObjects[0].pause_hour;
                  pausedDate = this.pausedTaskObjects[0].pause_date;
                }
              }
              for(let pause of this.pausedTaskObjects){
                if(pause.restart_hour != null){
                  pausedTime += (new Date("01.01.2000/".concat(pause.restart_hour)).getTime()-new Date("01.01.2000/".concat(pause.pause_hour)).getTime());
                }
              }
              console.log("paused hour: "+pausedHour);
              console.log("paused date: "+pausedDate);
              console.log(date.getUTCDate()+":"+date.getMonth()+" ? "+new Date().getUTCDate()+":"+new Date().getMonth());
              for(let d = date;d.getUTCDate()<=new Date().getUTCDate() && d.getMonth()<=new Date().getMonth();d.setDate(d.getDate()+1)){
                taskStartHour = d.getHours().toString().concat(":".concat(d.getMinutes().toString()));
                // this.restapiService.getLatestPausedTask(task_id,pref.user_id)
                // .then(data =>{
                //   this.pausedTaskObjects = data;
                //   this.pausedTaskObjects.reverse();
                //   for(let pause of this.pausedTaskObjects){
                //     console.log(pause);
                //   }
                // });
                if(d.getDay() == 0 && pref.nd == true){
                  time += this.timeForDay(pref,this.firstDay,d,taskStartHour,pref.ndOd,pref.ndDo,startHour,task_id,pausedHour,pausedDate);
                }
                else if(d.getDay() == 1 && pref.pon == true){
                  time += this.timeForDay(pref,this.firstDay,d,taskStartHour,pref.ponOd,pref.ponDo,startHour,task_id,pausedHour,pausedDate);
                }
                else if(d.getDay() == 2 && pref.wt == true){
                  time += this.timeForDay(pref,this.firstDay,d,taskStartHour,pref.wtOd,pref.wtDo,startHour,task_id,pausedHour,pausedDate);
                }
                else if(d.getDay() == 3 && pref.sr == true){
                  time += this.timeForDay(pref,this.firstDay,d,taskStartHour,pref.srOd,pref.srDo,startHour,task_id,pausedHour,pausedDate);
                }
                else if(d.getDay() == 4 && pref.czw == true){
                  time += this.timeForDay(pref,this.firstDay,d,taskStartHour,pref.czwOd,pref.czwDo,startHour,task_id,pausedHour,pausedDate);
                } 
                else if(d.getDay() == 5 && pref.pt == true){
                  time += this.timeForDay(pref,this.firstDay,d,taskStartHour,pref.ptOd,pref.ptDo,startHour,task_id,pausedHour,pausedDate);
                }
                else if(d.getDay() == 6 && pref.sob == true){
                  time += this.timeForDay(pref,this.firstDay,d,taskStartHour,pref.sobOd,pref.sobDo,startHour,task_id,pausedHour,pausedDate);
                }
                let h = Math.floor(time);
                let m = Math.floor(60*((time) - Math.floor(time)));
                this.firstDay = false;
                DayTime = time - DayTime;
                let hours = Math.floor(DayTime);
                let minutes = Math.floor(60*(DayTime - Math.floor(DayTime)));
                console.log(d.toLocaleDateString()+" "+hours+"h "+minutes+"m");
                this.storage.set(task_id.toString().concat(" ".concat(d.toLocaleDateString())),hours.toString().concat(":".concat(minutes.toString())));
                DayTime = time;
              }
              pausedTime = pausedTime/3600000;
              let hours = Math.floor(time);
              let minutes = Math.floor(60*(time - Math.floor(time)));
              let hp = Math.floor(pausedTime);
              let mp = Math.floor(60*(pausedTime - Math.floor(pausedTime)));
              console.log(hours+":"+minutes+" - "+hp+":"+mp);
              time = time - (pausedTime);
               hours = Math.floor(time);
               minutes = Math.floor(60*(time - Math.floor(time)));
               console.log(hours+":"+minutes);
              this.autoTasks.push(new AutoTaskTime(task_id,start_date,hours,minutes));
            });
          }
        }
      });
    });
  }

  timeBetween(from:string,then:string){
    return (new Date("01.01.2000/".concat(from)).getTime()-new Date("01.01.2000/".concat(then)).getTime())
  }

  timeForDay(pref:any,firstDay:any,d:any,taskStartHour:string,dayOd:any,dayDo:any,startHour:any,task_id:any,pausedHour:any,pausedDate:any){
    let time = 0;
    let nowHour = new Date().getHours().toString().concat(":".concat(new Date().getMinutes().toString()));
    this.pausedTaskObjects = new Array<any>();
    //------------------------------------------------------------------------------------------------------------------------
      if(firstDay == true){
        //jesli to nie jest dzisiaj
        if(d.toLocaleDateString() != new Date().toLocaleDateString()){
          if((pausedHour == null) || (pausedHour != null && d.toLocaleDateString() != new Date(pausedDate).toLocaleDateString())){
            time += this.timeBetween(dayDo,taskStartHour);
          } 
          else if(pausedHour != null && d.toLocaleDateString() == new Date(pausedDate).toLocaleDateString()){
            time += this.timeBetween(pausedHour,taskStartHour);
          } 
        }
        //jesli to jest dzisiaj
        else
        {
          //jeśli jest spauzowany
            if(pausedHour != null && pausedDate != null){
              if(d.toLocaleDateString() == new Date(pausedDate).toLocaleDateString()){
                //console.log(d.toLocaleDateString()+" "+pausedDate);
                time += this.timeBetween(pausedHour,startHour);
              }
            }
            else{
              //jesli rozpocząłem czynność pozniej niz zacząłem pracę
              if(new Date("01.01.2000/".concat(dayOd)) < new Date("01.01.2000/".concat(startHour))) dayOd = startHour;
              //jesli już skończyłem dzisiaj pracować
              if(new Date("01.01.2000/".concat(nowHour)) > new Date("01.01.2000/".concat(dayDo))){
                time += this.timeBetween(dayDo,dayOd);
              }
              //jeśli jeszcze jestem w pracy
              else{
                time += this.timeBetween(nowHour,dayOd);
              }
            }
          
        }
        }
        //------------------------------------------------------------------------------------------------------------------------
      else if(d.getUTCDate() == new Date().getUTCDate() && d.getMonth() == new Date().getMonth()){
        if(pausedDate == null || d.toLocaleDateString() <= new Date(pausedDate).toLocaleDateString()){
        if(pausedHour != null && pausedDate != null && d.toLocaleDateString() == new Date(pausedDate).toLocaleDateString()){
            time += this.timeBetween(pausedHour,startHour);
        }
        else{
          //jesli rozpocząłem czynność pozniej niz zacząłem pracę
          if(new Date("01.01.2000/".concat(dayOd)) < new Date("01.01.2000/".concat(startHour))) dayOd = startHour;
          //jesli już skończyłem dzisiaj pracować
          if(new Date("01.01.2000/".concat(nowHour)) > new Date("01.01.2000/".concat(dayDo))){
            time += this.timeBetween(dayDo,dayOd);
          }
          //jeśli jeszcze jestem w pracy
          else{
            time += this.timeBetween(nowHour,dayOd);
          }
        }// SPRAWDŹ CZY NOW NIE JEST ZANIM ZACZYNASZ PRACĘ, BO BĘDZIE NA MINUSIE
      }
        }
        //------------------------------------------------------------------------------------------------------------------------
        //każdy dzień pomiędzy dzisiaj a dniem rozpoczęcia czynności
      else{
        if(pausedDate == null || d.toLocaleDateString() <= new Date(pausedDate).toLocaleDateString()){
        if(pausedHour != null && pausedDate != null && d.toLocaleDateString() == new Date(pausedDate).toLocaleDateString()){
            time += this.timeBetween(pausedHour,dayOd);
          }
        else{
          time += this.timeBetween(dayDo,dayOd);
        }
      }
      }
    time = time/3600000;
    let h = Math.floor(time);
    let m = Math.floor(60*(time - Math.floor(time)));
    console.log(" ");
    return time;
  }


  finishTaskPrompt(task_id:number, task_title:string, hours:any, minutes:any) {
    this.restapiService.getUserTask()
    .then(data => {
      this.userTasks = data;
      this.storage.get('zalogowany_id').then((user_id) => {
        for(let task of this.userTasks){
          this.storage.get("current_task_id").then((id) => {
            if(id == task.task_id){
              this.userTask = task;
            }
          });
        }
      });
    });
    const alert = this.alertCtrl.create({
      title: 'Zkończyć '+task_title+'?',
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
            this.finishTask(hours,minutes);
          }
        }
      ]
    });
    alert.present();
  }

  selectTaskToStart(project:string, project_id:number) {
    this.restapiService.getUserTask()
    .then(userTasks => {
      this.inProgress = false;
      this.userTasks = userTasks;
      this.storage.get('zalogowany_id').then((user_id) => {
        for(let task of this.userTasks){
          if(user_id == task.user_id && task.finish_date == null){
            //console.log(task);
            this.storage.get('current_task_title').then((title) => {
              this.showalert("Nie możesz zacząć czynności.<br>Jesteś w trakcie: "+title);
            });
            this.inProgress = true;
            break;
          }
        }
        if(this.inProgress == false){
          const tasksAlert = this.alertCtrl.create({
            title: "Czynnosci w "+project,
            inputs: this.prepareTasksRadioButtons(project_id),        
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
                  this.selectCountMethod(data);
                }
              }
            ]
          });
          tasksAlert.present();
        }
      });
    });
  }

  selectStartDate(taskToStart:any, data:any) {
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
            this.startTask(taskToStart, data, startHour);
          }
        }
      ]
    });
    tasksAlert.present();
}

  selectCountMethod(taskToStart:any) {
          const tasksAlert = this.alertCtrl.create({
            title: "Metoda zliczania czasu:",
            inputs: this.prepareCountMethodRadioButtons(),      
            buttons: [
              {
                text: 'OK',
                handler: data => {
                  console.log(data);
                  if(data == 'manual') this.startTask(taskToStart, data, null);
                  else this.selectStartDate(taskToStart, data);
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
