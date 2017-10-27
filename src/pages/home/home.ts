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
  pushPage = EditTaskPage;
  userTask: any;
  tasks: any;
  user: Array<any>;
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
  params = {task_title: 'aaa', task_id:''}
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
      this.userTask = data;
      this.storage.get('zalogowany_id').then((user_id) => {
        for(let task of this.userTask){
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

  editTask(task_id:string, task_title:string){
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
    this.currentDate = new Date().toLocaleDateString();
    this.currentTime = this.getHour();
    this.user[0].tasks.push(task_id);
    console.log(this.currentDate);
    console.log(this.currentTime);
    this.restapiService.startTask(this.user[0],new UserTask(this.user[0].id,task_id,null,null,null,null,this.currentDate,this.currentTime,null));
    this.getUserProjectsAndTasks();
  }

  updateTask(task_id:number, task:string) {
    this.getUserTask(task_id);
    const alert = this.alertCtrl.create({
      title: task,
      message:"<b>Spędzony czas: "+this.userTask.time_spent+" godzin<br>"
              +"Ostatnia aktualizacja:<br>"
              +this.userTask.update_date+" o "+this.userTask.update_time+" godzin<br><b>",
      inputs: [
      {
        name: 'updateTaskTime',
        placeholder: 'Aktualizuj'
      }
    ],        
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Aktualizuj',
          handler: data => {
            this.updateTaskTime(task_id, data.updateTaskTime);
          }
        }
      ]
    });
    alert.present();
  }

  finishTask(task:number) {
    const alert = this.alertCtrl.create({
      title: 'Zkończyć '+task+'?',
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

          }
        }
      ]
    });
    alert.present();
  }

  selectTaskToStart(project:string, project_id:number) {
    //this.prepareRadioButtons();
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
}
