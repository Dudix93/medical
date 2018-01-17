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

  getProjects(){
    if(this.globalVars.getSelectedProject() != undefined) this.selectedProject = this.globalVars.getSelectedProject();
    if(this.globalVars.getSelectedTask() != undefined) this.selectedTask = this.globalVars.getSelectedTask();
    this.userProjects = new Array<any>();
    this.userTasks = new Array<any>();
    this.restapiService.getDayTask().then(data =>{
      this.dayTasks = data;
      for(let day of this.dayTasks){
        this.dayTasks[this.dayTasks.indexOf(day)] = {
          'update':null,
          'task':day,
          'full_time':null,
          'full_update_time':null,
          'difference':null}
      }
    });
    this.restapiService.getRaportUpdate().then(data =>{
      this.raportUpdates = data;
      for(let day of this.dayTasks){
        for(let update of this.raportUpdates){
          if(update.taskId == day['task'].taskId && update.date == day['task'].date && update.projectId == day['task'].projectId){
            this.dayTasks[this.dayTasks.indexOf(day)]['update'] = update;
            this.dayTasks[this.dayTasks.indexOf(day)]['full_update_time'] = this.minutesToHM(update.time);
            if(this.dayTasks[this.dayTasks.indexOf(day)]['task'].time > this.dayTasks[this.dayTasks.indexOf(day)]['update'].time){
              this.dayTasks[this.dayTasks.indexOf(day)]['difference'] = this.dayTasks[this.dayTasks.indexOf(day)]['task'].time - this.dayTasks[this.dayTasks.indexOf(day)]['update'].time;
            }
            else if(this.dayTasks[this.dayTasks.indexOf(day)]['task'].time < this.dayTasks[this.dayTasks.indexOf(day)]['update'].time){
              this.dayTasks[this.dayTasks.indexOf(day)]['difference'] = this.dayTasks[this.dayTasks.indexOf(day)]['update'].time - this.dayTasks[this.dayTasks.indexOf(day)]['task'].time;
            }
            this.dayTasks[this.dayTasks.indexOf(day)]['difference'] = this.minutesToHM(this.dayTasks[this.dayTasks.indexOf(day)]['difference']);
            console.log(this.dayTasks);
            break;
          }
        }
        day['full_time'] = this.minutesToHM(day['task'].time);
      }
      // for(let dt of this.dayTasks){
      //   dt['full_time'] = this.minutesToHM(dt['task'].time);
      // }
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
