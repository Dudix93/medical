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
//import { finalize} from 'rxjs/operators';

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
  unreadMsgs:any;
  oldMsgs:any;
  newMsgs:any;
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
    task_title: '', 
    task_id:0,
    hours:0,
    minutes:0 
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
        this.storage.get('isLoggedIn').then(value =>{
          if(value == true){
            this.storage.get('zalogowany').then((val) => {
              this.storage.get('apiUrl').then(url =>{
                this.globalVars.setApiUrl(url);

              this.login = val;
            //this.getUserData();
            this.getProjects();
            this.inProgress = false;
            this.events.subscribe('updateViewAfterEdit',()=>{
              this.getProjects();
            });

            // this.platform.ready().then((readySource) => {
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

            this.getMessages();
            if(this.platform.is('cordova')){
              setInterval(() => {
                this.powiadomienieCykliczne();
              }, 120000);
              
              setInterval(() => {
                this.getMessages();
              }, 5000);
            }
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
      });
    }

    getMessages(){
      this.newMsgs = new Array<any>();
      let allMsgs;
      let currentMsg;
      let nju = true;
      this.restapiService.getMessages(null,null).then(data =>{
        allMsgs = data;
        this.storage.get('unreadMessages').then(unreadMsgs =>{
          this.storage.get('oldMessages').then(oldMsgs => {
            this.amountNewMessages = unreadMsgs.length;
            this.unreadMsgs = unreadMsgs;
            this.oldMsgs = oldMsgs;
            if(this.unreadMsgs == undefined || this.unreadMsgs == null)this.storage.set('unreadMessages',new Array<any>());
            if(this.oldMsgs == undefined || this.oldMsgs == null)this.storage.set('oldMessages',new Array<any>());
            this.globalVars.cleanMessages();
            for(let msg of allMsgs){
              nju = true;
              this.globalVars.pushMessage(new Message(
                                            msg.id,
                                            msg.title,
                                            msg.content,
                                            new Date(msg.sendDate).toLocaleDateString(),
                                            new Date(msg.sendDate).getHours().toString()
                                            .concat(':'
                                            .concat(new Date(msg.sendDate).getMinutes()<10?
                                            '0'.concat(new Date(msg.sendDate).getMinutes().toString())
                                            :''.concat(new Date(msg.sendDate).getMinutes().toString())))));
              
                currentMsg = this.globalVars.getMessages()[(this.globalVars.getMessages().length)-1];
                //console.log(this.unreadMsgs);
                
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

                if(nju == true){
                  this.unreadMsgs.push(currentMsg);
                  this.newMsgs.push(currentMsg);
                  console.log("dodane jako nowe: "+currentMsg.id);
                }
                //console.log("przeczytane: "+this.unreadMsgs);
            }
            this.storage.set('unreadMessages',this.unreadMsgs);

            if(this.newMsgs.length != 0){
              if(this.newMsgs.length == 1){
                cordova.plugins.notification.local.schedule({
                id: this.newMsgs[0].id,
                title: 'Raportowanie',
                text: this.newMsgs[0].title,
                icon:'ios-chatbubbles-outline'
              });
              //console.log("nowa wiadomosc: "+this.newMsgs[0].title);
              }
              else{
                cordova.plugins.notification.local.schedule({
                  id: this.newMsgs[0].id,
                  title: 'Raportowanie',
                  text: "Masz "+this.newMsgs.length+" nowych wiadomości.",
                }); 
              }
              this.newMsgs = new Array<any>();
            }
          });
        });
      });
    
    }

    powiadomienieCykliczne() {
      let id = new Date().getUTCDate().toString().
      concat(new Date().getMonth().toString().
      concat(new Date().getFullYear().toString().
      concat(new Date().getHours().toString().
      concat(new Date().getMinutes().toString()))));
      console.log("Powiadomienie o nr id: "+id+" otrzymane o godzinie "+this.getHour());
      cordova.plugins.notification.local.schedule({
          id: Number(id),
          title: 'Powiadomienie',
          text: 'Otrzymano o godzinie: '+this.getHour(),
          //trigger: { every: 'minute', count: 3 }
        });
    }

    minutesToHM(time:number){
      let hours = Math.floor(time);
      let minutes = Math.floor(60*(time - Math.floor(time)));
      return hours.toString().concat(':'.concat(minutes.toString()));
    }
    getProjects(){
      let userIdFound = false;
      let autoTasks = [];
      let currentAutoTask;
      let index;
      let time;
      this.userProjects = new Array<any>();
      this.restapiService.getProjects().then(data => {
        this.projects = data;
        this.restapiService.getRaports(null).then(data => {
          this.userTasks = data;
           for(let project of this.projects){
            this.restapiService.getProjectTasks(project.id).subscribe(data => {
              this.projectTasks = data;
              this.restapiService.getUserPreferences().then(data =>{
                this.userPreferences = data;
              this.projectTasks = new Array<any>();
              autoTasks = new Array<any>(); 
              this.userProjectTasks = new Array<[any,any]>();
              for(let raport of this.userTasks){
                if(project.id == raport.projectId){
                  this.projectTasks.push(raport);
                }
              }
              for(let task of this.projectTasks){
                if(task.countMethod == 'manual' || (task.endDate != null && task.countMethod == 'automatic')){
                  console.log("manual: "+project.name+" "+task.action.name);//skonczony autotask tez bo po zakonczniu naspisuje enddate dla kazdego raportu 
                  this.userProjectTasks.push([task,this.minutesToHM(task.timeOf/60)]);
                  console.log('czas: '+task.timeOf);
                }
                else if(task.endDate == null && task.countMethod == 'automatic'){
                  autoTasks.push(task);
                }
              }

              index = 1;
              time = 0;
              for(let task of autoTasks){
                if(currentAutoTask == undefined){
                  currentAutoTask = task;
                }
                if(currentAutoTask.action.id != task.action.id){
                  console.log("sumarycznie dla "+currentAutoTask.action.name+": "+this.minutesToHM(time));
                  console.log('');
                  this.userProjectTasks.push([currentAutoTask,this.minutesToHM(time)]);
                  currentAutoTask = task;
                  time = 0;
                }
                if(index == autoTasks.length){
                  if(task.pausedDate != null)time+=this.countTime(task.id,this.userPreferences,new Date(task.startDate),new Date(task.pausedDate));
                  else if(task.pausedDate == null)time+=this.countTime(task.id,this.userPreferences,new Date(task.startDate),new Date());
                  let hours = Math.floor(time);
                  let minutes = Math.floor(60*(time - Math.floor(time)));
                  console.log('');
                  console.log("sumarycznie dla "+currentAutoTask.action.name+": "+this.minutesToHM(time));
                  this.userProjectTasks.push([task,this.minutesToHM(time)]);
                  continue;
                }
                if(task.pausedDate != null){
                  time+=this.countTime(task.id,this.userPreferences,new Date(task.startDate),new Date(task.pausedDate));
                  currentAutoTask = task;
                }
                else if(task.pausedDate == null){
                  time+=this.countTime(task.id,this.userPreferences,new Date(task.startDate),new Date());
                  currentAutoTask = task;
                }
                index++;
                console.log('');
              }
              this.userProjects.push(new UserProject(project.id,project.name,this.userProjectTasks));
            });
            });
          }
      });
    });
    }
  //-----------------------------------------------------------------------------------------------------------------------  

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
    this.storage.set('isLoggedIn',false);
    this.storage.set('zalogowany', null);
    this.storage.set('zalogowany_id', null);
    this.storage.set('haslo', null);
    this.storage.set('isLoggedIn',false);
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

  editTask(task_id:number){
        this.params.task_id = task_id;
        this.navCtrl.push(EditTaskPage, this.params);
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

  prepareTasksRadioButtons(pt:any,project_id:number){
    let buttons:any;
    let startedTasks:any;
    this.radioButtons = new Array<any>();
    this.globalVars.setButtons([]);
    this.restapiService.getProjectTasks(project_id).
    subscribe((data:any) => {
      console.log(data);
    });
      startedTasks = new Array<any>();
      this.projectTasks = pt;
      console.log("--------------------------------");
      for(let task of this.projectTasks.tasks){
        console.log("taski: "+task.id+" "+task.name);
        for(let project of this.userProjects){
          if(project.id == project_id && project.tasks.length != 0){
            for(let task of project.tasks)startedTasks.push(task[0].action.id);
              if(startedTasks.indexOf(task.id) == -1){
     
                if(this.radioButtons.length == 0){
                  this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},true));
                }
                else{
                  this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},false));
                }
              }
          }
          else if(project.id == project_id && project.tasks.length == 0){

            if(this.radioButtons.length == 0){
              this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},true));
            }
            else{
              this.radioButtons.push(new RadioButton("taskToStart",task.name,"radio",{"id":task.id, "title":task.name},false));
            }
          }
        }
      }
      this.globalVars.setButtons(this.radioButtons);
      return this.globalVars.getButtons();

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
    this.getProjects();
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
    this.getProjects();
  }

  pauseTask(task_id:number){
    let preferences:any;
    this.restapiService.getUserPreferences().then((data) =>{
      preferences = data;
      for(let day of preferences){
        console.log("preferences: "+day.day);
      }
      this.restapiService.getUserTask()
      .then(data => {
        this.userTasks = data;
        this.storage.get('zalogowany_id').then((user_id) => {
          for(let task of this.userTasks){
            this.storage.get("current_task_id").then((id) => {
              if(id == task.task_id){
                this.userTask = task;
                this.userTask.paused = true;
                this.pausedTask.task_id = id;
                this.pausedTask.user_id = user_id;
                this.pausedTask.pause_date = this.today;
                this.pausedTask.pause_hour = this.getHour();
                this.restapiService.savePausedTask(this.pausedTask);
                this.restapiService.updateUserTask(this.userTask.id,this.userTask);
                this.showalert("Wstrzymano czynność.");
              }
            });
          }
        });
      });
    });
    this.getProjects();
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
    this.getProjects();
  }

  podgląd(d:any,start:any,end:any){
    let tmp = this.timeBetween(end,start);
    let hours = Math.floor(tmp/3600000);
    let minutes = Math.floor(60*(tmp/3600000 - Math.floor(tmp/3600000)));
    console.log(d.toLocaleDateString()+" "+"godz: "+start+"-"+end+" "+hours+"h "+minutes+"m");
  }

  countTime(task_id:number,pref:any,startDate:Date,endDate:Date){
    let time = 0;
    let reportStartHour;
    let reportEndHour;
    let workStartHour;
    let workEndHour;
    let workDay;
    this.firstDay = true;
    this.userPreferences = pref;
    let nowHour = new Date().getHours().toString().concat(":".concat(new Date().getMinutes().toString()));

              for(let d = startDate;d.toLocaleDateString()<=new Date(endDate).toLocaleDateString();d.setDate(d.getDate()+1)){
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
                    time += this.timeBetween(workEndHour,reportStartHour);
                    this.podgląd(d,reportStartHour,workEndHour);
                  }//pierwszy dzień, liczymy od startTask do endDay
  
                  else if(this.firstDay == true && startDate.toLocaleDateString() == endDate.toLocaleDateString()){
                    if(endDate.toLocaleDateString() == new Date().toLocaleDateString()){
                      if(new Date("01.01.2000/".concat(workEndHour)) > new Date("01.01.2000/".concat(nowHour))){
                        time += this.timeBetween(nowHour,reportStartHour);
                        this.podgląd(d,reportStartHour,nowHour);
                      }
                      else if(new Date("01.01.2000/".concat(workEndHour)) < new Date("01.01.2000/".concat(nowHour))){
                        time += this.timeBetween(workEndHour,reportStartHour);
                        this.podgląd(d,reportStartHour,workEndHour);
                      } 
                    }
                    else{
                      time += this.timeBetween(reportEndHour,reportStartHour);
                      this.podgląd(d,reportStartHour,reportEndHour);
                    }
                  }//pierwszy i ostatni dzień
  
                  else if(this.firstDay == false && startDate.toLocaleDateString() == endDate.toLocaleDateString()){
                    if(endDate.toLocaleDateString() == new Date().toLocaleDateString()){
                      if(new Date("01.01.2000/".concat(workEndHour)) > new Date("01.01.2000/".concat(nowHour))){
                        time += this.timeBetween(nowHour,reportStartHour);
                        this.podgląd(d,reportStartHour,nowHour);
                      }
                      else if(new Date("01.01.2000/".concat(workEndHour)) < new Date("01.01.2000/".concat(nowHour))){
                        time += this.timeBetween(workEndHour,reportStartHour);
                        this.podgląd(d,reportStartHour,workEndHour);
                      } 
                    }
                  }//nie pierwszy ale ostatni, bo dzisiaj
  
                  else{
                    time += this.timeBetween(workEndHour,workStartHour);
                    this.podgląd(d,workStartHour,workEndHour);
                  }//każdy dzień pomiędzy, liczymy od startDay do endDay
                }
                this.firstDay = false;
                //this.storage.set(task_id.toString().concat(" ".concat(d.toLocaleDateString())),hours.toString().concat(":".concat(minutes.toString())));
              }
              time = time/3600000;
               let hours = Math.floor(time);
               let minutes = Math.floor(60*(time - Math.floor(time)));
               console.log("sumarycznie dla raportu: "+hours+":"+minutes);
               return time;
  }

  timeBetween(from:string,then:string){
    return (new Date("01.01.2000/".concat(from)).getTime()-new Date("01.01.2000/".concat(then)).getTime())
  }

  // timeForDay(firstDay:any,dayOd:any,dayDo:any,startHour:any,endHour:any){
  //   let time = 0;
  //   let nowHour = new Date().getHours().toString().concat(":".concat(new Date().getMinutes().toString()));
  //   this.pausedTaskObjects = new Array<any>();
  //   //------------------------------------------------------------------------------------------------------------------------
  //     if(firstDay == true){
  //       //jesli to nie jest dzisiaj
  //       if(d.toLocaleDateString() != new Date().toLocaleDateString()){
  //         if((pausedHour == null) || (pausedHour != null && d.toLocaleDateString() != new Date(pausedDate).toLocaleDateString())){
  //           time += this.timeBetween(dayDo,taskStartHour);
  //         } 
  //         else if(pausedHour != null && d.toLocaleDateString() == new Date(pausedDate).toLocaleDateString()){
  //           time += this.timeBetween(pausedHour,taskStartHour);
  //         } 
  //       }
  //       //jesli to jest dzisiaj
  //       else
  //       {
  //         //jeśli jest spauzowany
  //           if(pausedHour != null && pausedDate != null){
  //             if(d.toLocaleDateString() == new Date(pausedDate).toLocaleDateString()){
  //               //console.log(d.toLocaleDateString()+" "+pausedDate);
  //               time += this.timeBetween(pausedHour,startHour);
  //             }
  //           }
  //           else{
  //             //jesli rozpocząłem czynność pozniej niz zacząłem pracę
  //             if(new Date("01.01.2000/".concat(dayOd)) < new Date("01.01.2000/".concat(startHour))) dayOd = startHour;
  //             //jesli już skończyłem dzisiaj pracować
  //             if(new Date("01.01.2000/".concat(nowHour)) > new Date("01.01.2000/".concat(dayDo))){
  //               time += this.timeBetween(dayDo,dayOd);
  //             }
  //             //jeśli jeszcze jestem w pracy
  //             else{
  //               time += this.timeBetween(nowHour,dayOd);
  //             }
  //           }
          
  //       }
  //       }
  //       //------------------------------------------------------------------------------------------------------------------------
  //     else if(d.getUTCDate() == new Date().getUTCDate() && d.getMonth() == new Date().getMonth()){
  //       if(pausedDate == null || d.toLocaleDateString() <= new Date(pausedDate).toLocaleDateString()){
  //       if(pausedHour != null && pausedDate != null && d.toLocaleDateString() == new Date(pausedDate).toLocaleDateString()){
  //           time += this.timeBetween(pausedHour,startHour);
  //       }
  //       else{
  //         //jesli rozpocząłem czynność pozniej niz zacząłem pracę
  //         if(new Date("01.01.2000/".concat(dayOd)) < new Date("01.01.2000/".concat(startHour))) dayOd = startHour;
  //         //jesli już skończyłem dzisiaj pracować
  //         if(new Date("01.01.2000/".concat(nowHour)) > new Date("01.01.2000/".concat(dayDo))){
  //           time += this.timeBetween(dayDo,dayOd);
  //         }
  //         //jeśli jeszcze jestem w pracy
  //         else{
  //           time += this.timeBetween(nowHour,dayOd);
  //         }
  //       }// SPRAWDŹ CZY NOW NIE JEST ZANIM ZACZYNASZ PRACĘ, BO BĘDZIE NA MINUSIE
  //     }
  //       }
  //       //------------------------------------------------------------------------------------------------------------------------
  //       //każdy dzień pomiędzy dzisiaj a dniem rozpoczęcia czynności
  //     else{
  //       if(pausedDate == null || d.toLocaleDateString() <= new Date(pausedDate).toLocaleDateString()){
  //       if(pausedHour != null && pausedDate != null && d.toLocaleDateString() == new Date(pausedDate).toLocaleDateString()){
  //           time += this.timeBetween(pausedHour,dayOd);
  //         }
  //       else{
  //         time += this.timeBetween(dayDo,dayOd);
  //       }
  //     }
  //     }
  //   time = time/3600000;
  //   console.log(" ");
  //   return time;
  // }


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
    this.restapiService.getRaports(null)
    .then(userTasks => {
      let inputs:any[];
      this.inProgress = false;
      this.userTasks = userTasks;
        // for(let task of this.userTasks){
        //   if(task.finish_date == null){
        //     //console.log(task);
        //     this.storage.get('current_task_title').then((title) => {
        //       this.showalert("Nie możesz zacząć czynności.<br>Jesteś w trakcie: "+title);
        //     });
        //     this.inProgress = true;
        //     break;
        //   }
        // }
        if(this.inProgress == false){
          this.restapiService.getProjectTasks(project_id).subscribe(ProjectTasks => {
            const tasksAlert = this.alertCtrl.create({
              title: "Czynnosci w "+project,
              inputs: this.prepareTasksRadioButtons(ProjectTasks,project_id),        
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
          });
        }
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
