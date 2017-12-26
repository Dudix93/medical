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
 raport = {
  "timeOf": null,
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
  "userId": null,
  "projectId": null
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
    raportId:null
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
                //this.getUserData();
                this.getProjects();
                // this.storage.set('unreadMsgs',null);
                // this.storage.set('oldMessages',null);
                this.inProgress = false;
                this.events.subscribe('updateViewAfterEdit',()=>{
                  this.getProjects();
                });
                setInterval(() => {
                  this.updateCurrentTask(this.globalVars.getCurrentTaskId());
                }, 60000);

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
              }, 60000);
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
      let unreadMsgs;
      let oldMsgs;
      let nju = true;
      this.restapiService.getMessages(null,null).then(data =>{
        allMsgs = data;
        console.log('wszystkie '+allMsgs);
      }).then(() =>{
        this.storage.get('unreadMessages').then(data =>{
          unreadMsgs = data;
        }).then(() =>{
          this.storage.get('oldMessages').then(data => {
            oldMsgs = data;
            this.amountNewMessages = unreadMsgs.length;
            this.unreadMsgs = unreadMsgs;
            this.oldMsgs = oldMsgs;
            if(this.unreadMsgs == undefined || this.unreadMsgs == null)this.storage.set('unreadMessages',new Array<any>());
            if(this.oldMsgs == undefined || this.oldMsgs == null)this.storage.set('oldMessages',new Array<any>());
            this.globalVars.cleanMessages();
            for(let msg of allMsgs){
              console.log(msg);
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

    updateCurrentTask(task_id:number){
      let raport;
      if(this.globalVars.getCurrentTaskId != null){
        for(let project of this.userProjects){
          for(let task of project.tasks){
            if(task[0].endDate == null && task[0].action.id == task_id && task[0].countMethod == 'automatic'){
              this.restapiService.getRaports(task[0].id).then(rap => {
                raport = rap;
                raport.timeOf++;
                this.restapiService.updateRaport(raport.id,raport);
                this.userProjects[this.userProjects.indexOf(project)].
                tasks[this.userProjects[this.userProjects.indexOf(project)].tasks.indexOf(task)][0] = raport;
                this.userProjects[this.userProjects.indexOf(project)].
                tasks[this.userProjects[this.userProjects.indexOf(project)].tasks.indexOf(task)][1] = this.minutesToHM(raport.timeOf/60); 
                this.updateRaportsTime(raport.action.id,raport.projectId,raport.timeOf);
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
          if(raport.action.id == task_id && raport.projectId == project_id){
            raport.timeOf = time;
            this.restapiService.updateRaport(raport.id,raport);
          }
        }
      });
    }
  
    updateRaportsComment(task_id:number,project_id:number,comment:string){
      for(let raport of this.userTasks){
        if(raport.action.id == task_id && raport.projectId == project_id){
          raport.comment = comment;
          this.restapiService.updateRaport(raport.id,raport);
        }
      }
    }

    getProjects(){
      let userIdFound = false;
      let autoTasks = [];
      let autoTasksIds = [];
      let currentAutoTask = null;
      let index;
      let time;
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
                currentAutoTask = null;
                this.projectTasks = new Array<any>();
                autoTasks = new Array<any>(); 
                autoTasksIds = new Array<any>(); 
                this.userProjectTasks = new Array<[any,any]>();
                for(let raport of this.userTasks){
                  if(project.id == raport.projectId){
                    this.projectTasks.push(raport);
                  }
                }
                for(let task of this.projectTasks){
                  if(task.countMethod == 'manual'){
                    if(task.endDate == null){
                      this.globalVars.setCurrentTaskId(task.action.id);
                      this.globalVars.setCurrentTaskName(task.action.name);
                      this.globalVars.setCurrentTaskRaportId(task.id);
                    }
                    this.userProjectTasks.push([task,this.minutesToHM(task.timeOf/60)]);
                    //console.log('czas: '+task.timeOf);
                  }
                  else if(task.endDate == null && task.countMethod == 'automatic'){
                    if(task.pausedDate == null){
                      this.globalVars.setCurrentTaskId(task.action.id);
                      this.globalVars.setCurrentTaskName(task.action.name);
                      this.globalVars.setCurrentTaskRaportId(task.id);
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
                  }
                  if(currentAutoTask.action.id != task.action.id){
                    console.log("sumarycznie dla "+currentAutoTask.action.name+": "+this.minutesToHM(time));
                    console.log('');
                    this.userProjectTasks.push([currentAutoTask,this.minutesToHM(time)]);
                    this.updateRaportsTime(currentAutoTask.action.id,currentAutoTask.projectId,time*60);
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
                    this.updateRaportsTime(task.action.id,task.projectId,time*60);
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

  editTask(raportId:any){
        this.params.raportId = raportId;
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

  startTask(projectId:any, task:any, countMethod:any, startHour:any){
    let raports;
    if(countMethod == 'automatic'){
      if(startHour.startHour != ''){
        const today = new Date();
        today.setTime(today.getTime() + (1 * 60 * 60 * 1000));
        const todayStr: string = today.toISOString();
        this.raport.startDate = todayStr.substring(0, 11) + startHour.startHour;
      }
      else if(startHour.startHour == ''){
        this.raport.startDate = new Date().toUTCString();
      }
    }
    else if(countMethod == 'manual'){
      this.raport.startDate = new Date().toUTCString();
    }
    
    this.raport.action.id = task.id;
    this.raport.action.name = task.title;
    this.raport.countMethod = countMethod;
    //this.raport.userId = this.globalVars.getUser().id;
    this.raport.userId = 4;
    this.raport.projectId = projectId;

    this.globalVars.setCurrentTaskId(task.id);
    this.globalVars.setCurrentTaskName(task.title);
    this.restapiService.saveRaport(this.raport).then(() =>{
      this.restapiService.getRaports(null).then(data => {
        raports = data;
        for(let raport of raports){
          if(raport.action.id == task.id && raport.endDate == null && raport.projectId == projectId){
            this.globalVars.setCurrentTaskRaportId(raport.id);
            console.log(this.globalVars.getCurrentTask());
            this.getProjects();
            break;
          }
        }
      });
    });
  }

  finishTask(task_id:number,project_id:number){
    for(let raport of this.userTasks){
      if(raport.action.id == task_id && raport.projectId == project_id){
        raport.endDate = new Date();
        this.restapiService.updateRaport(raport.id,raport);
      }
    }
    this.globalVars.setCurrentTaskId(null);
    this.globalVars.setCurrentTaskName(null);
    this.globalVars.setCurrentTaskRaportId(null);
    this.getProjects();
    this.showalert("Zakończono czynność.");
    console.log('currentTask: '+this.globalVars.getCurrentTask());
  }

  pauseTask(raport_id:number){
    for(let raport of this.userTasks){
      if(raport.id == raport_id){
        raport.pausedDate = new Date();
        raport.paused = true;
        this.restapiService.updateRaport(raport.id,raport).then(() =>{
          this.globalVars.setCurrentTaskId(null);
          this.globalVars.setCurrentTaskName(null);
          this.globalVars.setCurrentTaskRaportId(null);
          this.getProjects();
          this.showalert("Wstrzymano czynność.");
        });
        break;
      }
    }
  }

  restartTask(raport_id:number){
    let raports;
    this.restapiService.getRaports(null).then(data => {
      raports = data;
      for(let raport of raports){
        if(raport.id == raport_id){
          console.log(raport);
          this.raport.timeOf = raport.timeOf;
          this.raport.startDate = new Date().toUTCString();
          this.raport.comment = raport.comment;
          this.raport.action.id = raport.action.id;
          this.raport.action.name = raport.action.name;
          this.raport.countMethod = raport.countMethod;
          this.raport.userId = raport.userId;
          this.raport.projectId = raport.projectId;
          console.log(this.raport);

          this.globalVars.setCurrentTaskId(this.raport.action.id);
          this.globalVars.setCurrentTaskName(this.raport.action.name);
          this.restapiService.saveRaport(this.raport).then(() =>{this.getProjects();});
          break;
          }
        }

          for(let raport of raports){
            if(raport.action.id == this.raport.action.id && raport.endDate == null && raport.projectId == this.raport.projectId){
              this.globalVars.setCurrentTaskRaportId(raport.id);
              console.log('currentTask: '+this.globalVars.getCurrentTask().id+" "+this.globalVars.getCurrentTask().name+" "+this.globalVars.getCurrentTask().raport_id);
              this.showalert("Wznowiono czynność.");
              break;
            }
          }
  });
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
                    if(endDate == new Date()){//spełnione gdy nie jest spauzowane
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
  
                  else if(this.firstDay == false && d.toLocaleDateString() == endDate.toLocaleDateString()){
                    if(endDate == new Date()){
                      if(new Date("01.01.2000/".concat(workEndHour)) > new Date("01.01.2000/".concat(nowHour))){
                        time += this.timeBetween(nowHour,workStartHour);
                        this.podgląd(d,workStartHour,nowHour);
                      }
                      else if(new Date("01.01.2000/".concat(workEndHour)) < new Date("01.01.2000/".concat(nowHour))){
                        time += this.timeBetween(workEndHour,workStartHour);
                        this.podgląd(d,workStartHour,workEndHour);
                      } 
                    }
                    else{
                      time += this.timeBetween(reportEndHour,workStartHour);
                      this.podgląd(d,workStartHour,reportEndHour);
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


  finishTaskPrompt(task_id:number, project_id:number, project_name:string) {
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

  selectTaskToStart(project:string, project_id:number) {
    this.restapiService.getRaports(null)
    .then(userTasks => {
      let inputs:any[];
      console.log('currentTask: '+this.globalVars.getCurrentTask().id+" "+this.globalVars.getCurrentTask().name);
        if(this.globalVars.getCurrentTask().id != null
        && this.globalVars.getCurrentTask().id != undefined
        && this.globalVars.getCurrentTask().name != null
        && this.globalVars.getCurrentTask().name != undefined){
          this.showalert('Nie możesz rozpoczać czynności.<br>Jesteś w trakcie '+this.globalVars.getCurrentTask().name);
        }
        else{
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
                    this.selectCountMethod(project_id,data);
                  }
                }
              ]
            });
            tasksAlert.present();
          });
        }
    });
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

  selectCountMethod(projectId:any,taskToStart:any) {
          const tasksAlert = this.alertCtrl.create({
            title: "Metoda zliczania czasu:",
            inputs: this.prepareCountMethodRadioButtons(),      
            buttons: [
              {
                text: 'OK',
                handler: data => {
                  if(data == 'manual') this.startTask(projectId,taskToStart, data, null);
                  else this.selectStartDate(projectId,taskToStart, data);
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
