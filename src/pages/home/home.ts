import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import {   ActionSheetController, AlertController, ToastController, NavController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { UserProject } from '../../models/userProject';
import { RadioButton } from '../../models/radioButton';
import { UserTask } from '../../models/userTask';
import { LoginPage } from '../login/login';
import { PreferencesPage } from '../preferences/preferences';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { EditTaskPage } from '../edit-task/edit-task';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  userTask = {
    id:0,
    user_id: '', 
    task_id: '', 
    update_date:'', 
    update_hour:'', 
    update_time:0, 
    time_spent:0, 
    start_date:'', 
    start_hour:'',
    description:'',
    latest_dayTask:0, 
    finish_date:'',
    finish_hour:''}

  dayTask = {
      task_id:0,
      user_id:0,
      date:'',
      hour:'',
      time_spent:0}
  
  pushPage = EditTaskPage;
  inProgress:boolean;
  dayTasksObjects:any;
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
              private toastCtrl:ToastController) {
    this.storage.get('zalogowany').then((val) => {
      this.login = val;
    });
    this.getUserProjectsAndTasks();
    this.inProgress = false;
    //this.restapiService.getDayTask().then(data => {console.log("DayTasks:");console.log(data);});
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
              this.userProjects = new Array<any>();
              if(this.user[0].projects != null){
                for(let userProject of this.user[0].projects){
                  this.userProjectTasks = new Array<any>();
                  for(let project of this.projects){
                    if(project.id == userProject){
                      //console.log(project);
                      this.project = project;
                      for(let userTask of this.user[0].tasks){
                        for(let projectTasks of project.tasks){
                          if(userTask == projectTasks){
                            for(let task of this.tasks){
                              if(task.id == projectTasks){
                                this.userProjectTasks.push(task);
                                continue;
                              }
                            }
                          }
                        }
                      }
                      this.userProjects.push(new UserProject(project.id,project.title,this.userProjectTasks));
                    }
                  }
                }
              }
              else this.projects = null;
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

  editTask(task_id:number, task_title:string){
    this.params.task_id = task_id;
    this.params.task_title = task_title;
    this.navCtrl.push(EditTaskPage, this.params);
  }

  menu() {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
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

  prepareRadioButtons(project_id:number){
    this.radioButtons = [];
    //console.log(this.userProjectTasks);
    for(let project of this.userProjects){
      if(project.id == project_id){
        for(let task of this.tasks){
          if(project_id == task.project_id){
   
              if(!this.user[0].tasks.includes(task.id)){
                this.radioButtons.push(new RadioButton("taskToStart",task.title,"radio",task.id,false));
                continue;
              }
            
          }
        }
      }
    }
    this.radioButtons.push(new RadioButton("countMethod","automatycznie","radio","automatycznie",false));
    this.radioButtons.push(new RadioButton("countMethod","manualnie","radio","manualnie",false));
    //console.log(this.radioButtons);
    return this.radioButtons;
  }

  updateTaskTime(task_id:number, updateTaskTime:number){

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

  startTask(task_id:number){
    if(task_id != undefined){
      this.dayTasks = new Array<any>();
      this.currentDate = new Date().toLocaleDateString();
      this.currentTime = this.getHour();
      this.user[0].tasks.push(task_id);
      this.dayTask.hour = this.currentTime;
      this.dayTask.date = this.currentDate;
      this.dayTask.task_id = task_id;
      this.dayTask.user_id = this.user[0].id;
      // this.restapiService.saveDayTask(this.dayTask);
      // this.restapiService.getDayTask().then(data => {
      //   this.dayTasks = new Array<number>();
      //   this.dayTasksObjects = data;
      //   for(let dayTask of this.dayTasksObjects){
      //     if(dayTask.date == new Date().toLocaleDateString()){
      //       this.dayTasks.push(dayTask.id);
      //     }
      //   }
      //   this.restapiService.startTask(this.user[0],new UserTask(this.user[0].id,task_id,null,null,null,null,this.currentDate,this.currentTime,null,null));
      //   console.log("latestDayTask: "+this.dayTasks[this.dayTasks.length-1]);
      // });
      this.restapiService.startTask(this.user[0],new UserTask(this.user[0].id,task_id,null,null,null,null,this.currentDate,this.currentTime,null,null));
    }
  }

  finishTask(){
    this.userTask.finish_date = new Date().toLocaleDateString();
    this.userTask.finish_hour = this.getHour();
    this.restapiService.updateUserTask(this.userTask.id, this.userTask);
  }

  finishTaskPrompt(task_id:number, task_title:string) {
    this.restapiService.getUserTask()
    .then(userTasks => {
      this.userTasks = userTasks;
      this.storage.get('zalogowany_id').then((user_id) => {
        for(let task of this.userTasks){
          //console.log(task);
          if(user_id == task.user_id && task_id == task.task_id){
            this.userTask = task;
            break;
          }
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
            console.log(task);
            this.showalert("Nie możesz zacząć czynności.<br>Jesteś w trakcie: ");
            this.inProgress = true;
            break;
          }
        }
        if(this.inProgress == false){
          const alert = this.alertCtrl.create({
            title: "Czynnosci w "+project,
            inputs: this.prepareRadioButtons(project_id),        
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
                  this.startTask(data);
                }
              }
            ]
          });
          alert.present();
        }
      });
    });
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
