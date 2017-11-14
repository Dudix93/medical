import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Push, PushToken } from '@ionic/cloud-angular';
import { ActionSheetController, AlertController, ToastController, NavController, Platform } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { UserProject } from '../../models/userProject';
import { RadioButton } from '../../models/radioButton';
import { UserTask } from '../../models/userTask';
import { LoginPage } from '../login/login';
import { PreferencesPage } from '../preferences/preferences';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { EditTaskPage } from '../edit-task/edit-task';
import { CalendarPage } from '../calendar/calendar';

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
      time_spent:0}

      
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
  user: Array<any>;
  dayTasks: Array<number>;
  projects: any;
  project:any;
  login:string;
  currentDate:string;
  currentTime:string;
  userProjectTasks:Array<any>;
  userProjects:Array<any>;
  userProject:UserProject[]=[];
  radioButtons:RadioButton[]=[];
  task = {title: '', id:''}
  params = {task_title: '', task_id:0}

  constructor(public navCtrl: NavController, 
              private restapiService: RestapiServiceProvider, 
              private storage:Storage,
              private actionSheetCtrl:ActionSheetController,
              private alertCtrl:AlertController,
              private toastCtrl:ToastController,
              public push:Push,
              platform: Platform) {
    this.storage.get('zalogowany').then((val) => {
      this.login = val;
    });
    this.getUserProjectsAndTasks();
    this.inProgress = false;
    
    if (platform.is('cordova')){
      this.push.register().then((t: PushToken) => {
        return this.push.saveToken(t);
      }).then((t: PushToken) => {
        console.log('Token saved:', t.token);
      });
  
      this.push.rx.notification()
      .subscribe((msg) => {
        alert(msg.title + ': ' + msg.text);
      });
    }
    }

  getUserProjectsAndTasks() {
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
                                    //console.log(userTask);
                                    continue;
                              }
                            }
                        }
                      
                      this.userProjects.push(new UserProject(project.id,project.title,this.userProjectTasks));
                      //console.log(this.userProjectTasks);
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

  editProfile(){
    this.navCtrl.push(EditProfilePage);
  }

  preferences(){
    this.navCtrl.push(PreferencesPage);
  }

  calendar(){
    this.navCtrl.push(CalendarPage);
  }

  editTask(task_id:number, task_title:string){
    this.storage.get('current_task_id').then((id) => {
      this.storage.get('current_task_title').then((title) => {
        this.params.task_id = id;
        this.params.task_title = title;
        this.navCtrl.push(EditTaskPage, this.params);
      });
    });
  }

  menu() {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Kalendarz',
          icon:'md-calendar',
          handler: () => {
            this.calendar();
          }
        },
        {
          text: 'Edytuj swoje dane',
          icon:'ios-contacts',
          handler: () => {
            this.editProfile();
          }
        },
        {
          text: 'Preferencje',
          icon:'md-options',
          handler: () => {
            this.preferences();
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

  startTask(task:any, countMethod:any){
    console.log(task);
    console.log(countMethod);
    if(task != undefined){
      this.dayTasks = new Array<any>();
      this.currentDate = new Date().toLocaleDateString();
      this.currentTime = this.getHour();
      this.user[0].tasks.push(task.id);
      this.dayTask.hour = this.currentTime;
      this.dayTask.date = this.currentDate;
      this.dayTask.task_id = task.id;
      this.dayTask.user_id = this.user[0].id;
      this.newUserTask.start_date = this.currentDate;
      this.newUserTask.start_hour = this.currentTime;
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
  }

  finishTask(){
    this.userTask.finish_date = new Date().toLocaleDateString();
    this.userTask.finish_hour = this.getHour();
    this.restapiService.updateUserTask(this.userTask.id, this.userTask);
    this.storage.set('current_task_id', null);
    this.storage.set('current_task_title', null);
  }

  pauseTask(task_id:number){
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
              this.pausedTask.pause_date = new Date().toLocaleDateString();
              this.pausedTask.pause_hour = this.getHour();
              this.restapiService.savePausedTask(this.pausedTask);
              this.restapiService.updateUserTask(this.userTask.id,this.userTask);
              this.showalert("Wstrzymano czynność.");
            }
          });
        }
      });
    });
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
  }

  finishTaskPrompt(task_id:number, task_title:string) {
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
            this.finishTask();
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

  selectCountMethod(taskToStart:any) {
          const tasksAlert = this.alertCtrl.create({
            title: "Metoda zliczania czasu:",
            inputs: this.prepareCountMethodRadioButtons(),      
            buttons: [
              {
                text: 'OK',
                handler: data => {
                  this.startTask(taskToStart, data);
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
