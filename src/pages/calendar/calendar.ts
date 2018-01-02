import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { UserProject } from '../../models/userProject';
import { UserTask } from '../../models/userTask';
import { EditTaskPage } from '../../pages/edit-task/edit-task';
import { Events } from 'ionic-angular/util/events';
import { GlobalVars } from '../../app/globalVars';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {
  selectedProject:any = null;
  selectedTask:any = null;
  userProjects:any;
  userTasks:any;
  dayTasks:any;
  raportUpdates:any;
  raports:any;
  currentTask = {
    "id":null,
    "name":null,
    "projectId":null
  }
  taskToEdit = {
    "date":null,
    "task_id":null,
    "user_id":null,
    "project_id":null,
    "time":null
  }
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storage: Storage,
              public restapiService: RestapiServiceProvider,
              public alertCtrl:AlertController,
              public events:Events,
              public globalVars:GlobalVars) {
              this.getProjects();
              // this.events.subscribe('updatePastTasksList',()=>{
              //   this.getProjects();
              //   // this.navCtrl.pop();
              //   // this.navCtrl.setRoot(CalendarPage);
              // });
  }


  getProjects(){
    if(this.globalVars.getSelectedProject() != undefined) this.selectedProject = this.globalVars.getSelectedProject();
    if(this.globalVars.getSelectedTask() != undefined) this.selectedTask = this.globalVars.getSelectedTask();
    this.userProjects = new Array<any>();
    this.userTasks = new Array<any>();
    this.restapiService.getDayTask().then(data =>{
      this.dayTasks = data;
      for(let day of this.dayTasks){
        this.dayTasks[this.dayTasks.indexOf(day)] = {'update':null,'task':day}
      }
    });
    this.restapiService.getRaportUpdate().then(data =>{
      console.log('pobieramy updaty');
      this.raportUpdates = data;
      for(let day of this.dayTasks){
        for(let update of this.raportUpdates){
          if(update.taskId == day['task'].taskId && update.date == day['task'].date && update.projectId == day['task'].projectId){
            this.dayTasks[this.dayTasks.indexOf(day)]['update'] = update;
            console.log(this.dayTasks);
            break;
          }
        }
      }
    });
    this.restapiService.getProjects().then(data =>{
      this.userProjects = data;
    }).then(()=>{
      this.restapiService.getRaports(null).then(data =>{
        this.raports = data;
        for(let raport of this.raports){
          if(this.currentTask.id == null){
            if(raport.endDate != null){
              this.currentTask.id = raport.action.id;
              this.currentTask.projectId = raport.projectId;
              this.currentTask.name = raport.action.name;
              this.userTasks.push(new UserTask(this.currentTask.id,this.currentTask.name,this.currentTask.projectId));
            }
          }
          else if(raport.endDate != null && (raport.projectId != this.currentTask.projectId || raport.action.id != this.currentTask.id)){
            this.currentTask.id = raport.action.id;
            this.currentTask.projectId = raport.projectId;
            this.currentTask.name = raport.action.name;
            this.userTasks.push(new UserTask(this.currentTask.id,this.currentTask.name,this.currentTask.projectId));
          }
        }
      });
    });
  }
  addDayTaskToUpdate(date:string,task_id:number,user_id:number,project_id:number,time:number){
    this.taskToEdit.date = date;
    this.taskToEdit.task_id = task_id;
    this.taskToEdit.user_id = user_id;
    this.taskToEdit.project_id = project_id;
    this.taskToEdit.time = time;
    this.navCtrl.push(EditTaskPage,this.taskToEdit);
  }

  // updateTimePrompt(task_title:string, date:string, time:number) {
  //   const alert = this.alertCtrl.create({
  //     title: 'Edytujesz '+task_title+'<br>'+'z dnia '+date,
  //     inputs: [
  //       {
  //         name: 'time',
  //         value: time.toString()
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Anuluj',
  //         role: 'cancel',
  //         handler: () => {
  //         }
  //       },
  //       {
  //         text: 'OK',
  //         handler: () => {
  //           this.addDayTaskToUpdate();
  //         }
  //       }
  //     ]
  //   });
  //   alert.present();
  // }

}
