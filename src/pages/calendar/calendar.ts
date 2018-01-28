import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
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
  selectedTaskName:any = null;
  updateComment:any = null;
  updatedComment:any = null;
  updateTime:any = null;
  comment:any = null;
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
    "taskId":null,
    "userId":null,
    "projectId":null,
    "time":null,
    "comment":null,
    "updateDate":null
  }
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storage: Storage,
              public restapiService: RestapiServiceProvider,
              public alertCtrl:AlertController,
              public toastCtrl:ToastController,
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
    if(this.globalVars.getSelectedTask() != undefined){
      this.selectedTask = this.globalVars.getSelectedTask();
      //this.getCurrentComments(this.selectedProject,this.selectedTask);
    }
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
      console.log(data);
      for(let day of this.dayTasks){
        day.comment = this.comment;
        for(let update of this.raportUpdates){
          if(update.taskId == day['task'].taskId && update.date == day['task'].date && update.projectId == day['task'].projectId){
            this.updateComment = update.comment;
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
  
  addDayTaskToUpdate(dayTask:any,updateTime:any,oldTime:any){
    let updated = false;
    this.taskToEdit.date = dayTask.date;
    this.taskToEdit.taskId = dayTask.taskId;
    this.taskToEdit.userId = this.globalVars.getUser().id;
    this.taskToEdit.projectId = dayTask.projectId;
    this.taskToEdit.time = updateTime;
    if(this.updateComment != null) this.taskToEdit.comment = this.updateComment;
    if(this.updateComment == null) this.taskToEdit.comment = null;
    this.taskToEdit.updateDate = new Date();
    
    if(isNaN(Number(this.taskToEdit.time)) == true){
      this.showToast("Wpisz liczbę!");
    }
    else if(this.taskToEdit.time != parseInt(this.taskToEdit.time.toString(), 10)){
      this.showToast("Wpisz pełną godzine!");
    }
    else if(this.taskToEdit.time <= 0){
      this.showToast("Wpisz liczbę większą od 0!");
    }
    else if(this.taskToEdit.time == oldTime){
      this.showToast("Nie dokonałeś żadnej zamiany!");
    }
    else{
      this.taskToEdit.updateDate = new Date();
      
      this.restapiService.getRaportUpdate().then(data =>{
        this.raports = data;
        for(let update of this.raports){
          if(this.taskToEdit.projectId == update.projectId && this.taskToEdit.taskId == update.taskId && this.taskToEdit.date == update.date){
            this.restapiService.updateRaportUpdate(update.id,this.taskToEdit);
            console.log('zaktualizowano');
            updated = true;
            break;
          }
        }
        if(updated == false){
          console.log('zapisano');
          this.restapiService.saveRaportUpdate(this.taskToEdit);
        }
        this.showToast('Zaktualizowano czas.');
        this.globalVars.setSelectedProject(this.taskToEdit.projectId);
        this.globalVars.setSelectedTask(this.taskToEdit.taskId);
      }).then(()=>{
        this.getProjects();
        this.getCurrentComments(this.selectedProject,this.selectedTask);
      });
    }
  }


  getCurrentComments(project_id:number,task_id:number){
    console.log('wczytuje komentarze');
    let dt;
    let raportUpdates;
    this.updateComment = null;
    this.comment = null;
    this.restapiService.getRaportUpdate().then(data =>{
      raportUpdates = data;
      for(let update of raportUpdates){
        if(update.projectId == project_id && update.taskId == task_id){
          this.updateComment = this.updatedComment = update.comment;
          break;
        }
      }
    });

    this.restapiService.getDayTask().then(data =>{
      dt = data;
      for(let task of dt){
        if(task.projectId == project_id && task.taskId == task_id){
          this.comment = task.comment;
          break;
        }
      }
    });
    
    this.restapiService.getProjectTasks(this.selectedProject).subscribe(data=>{
      for(let task of data.tasks){
        if(task.id == this.selectedTask){
          this.selectedTaskName = task.name;
          break;
        }
      }
    });
  }

  cancelCommentUpdate(project_id:number,task_id:number){
    console.log('cancelCommentUpdate');
    let raportUpdates;
    this.restapiService.getRaportUpdate().then(data => {
     raportUpdates = data;
     for(let update of raportUpdates){
      console.log(update.projectId+' ? '+project_id+' '+update.taskId+' ? '+task_id);
      if(update.projectId == project_id && update.taskId == task_id){
  
        if(update.time == null)this.restapiService.deleteRaportUpdate(update.id);
        else{
          console.log('znalazlem '+update.id);
          update.comment = null;
          update.updateDate = new Date().toISOString();
          this.restapiService.updateRaportUpdate(update.id,update);
        }
      }
    }
    this.globalVars.setSelectedProject(this.taskToEdit.projectId);
    this.globalVars.setSelectedTask(this.taskToEdit.taskId);
    this.updateComment = this.updatedComment = null;
    this.showToast('Anulowano zmianę komentarza.');
    });
  }

  cancelUpdate(id:number){
    console.log('anulujemy: '+id);
    this.restapiService.deleteRaportUpdate(Number(id));
    this.getProjects();
    this.showToast('Anulowano zmianę czasu.');
  }

   commentUpdate(project_id:number,task_id:number,clear:boolean){
     let found = false;
     let raportUpdates;
     if(clear == true) this.updateComment = '';
     this.restapiService.getRaportUpdate().then(data => {
      raportUpdates = data;
      for(let update of raportUpdates){
        console.log(update.projectId+' ? '+project_id+' '+update.taskId+' ? '+task_id);
        if(update.projectId == project_id && update.taskId == task_id){
          console.log('znalazlem '+update.id);
          found = true;
          update.comment = this.updateComment;
          update.updateDate = new Date().toISOString();
          this.restapiService.updateRaportUpdate(update.id,update);
        }
      }
      if(found == false){
        this.taskToEdit.updateDate = new Date().toISOString();
        this.taskToEdit.comment = this.updateComment;
        this.taskToEdit.userId = this.globalVars.getUser().id;
        this.taskToEdit.projectId = project_id;
        this.taskToEdit.taskId = task_id;
        this.taskToEdit.date = null;
        this.restapiService.saveRaportUpdate(this.taskToEdit);
      }
     });
     this.updatedComment = this.updateComment;
     this.globalVars.setSelectedProject(this.taskToEdit.projectId);
     this.globalVars.setSelectedTask(this.taskToEdit.taskId);
     if(clear == true) this.showToast('Wyczyszczono komentarz.');
     else this.showToast('Zaktualizowano komentarz.');
  }

  updateTimePrompt(task_title:string,dayTask:any) {
    const alert = this.alertCtrl.create({
      title: 'Edytujesz '+this.selectedTaskName+'<br>'+'z dnia '+dayTask.date,
      inputs: [
        {
          name: 'time',
          value: dayTask.time.toString()
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
          text: 'OK',
          handler: data => {
            this.addDayTaskToUpdate(dayTask,data.time,dayTask.time);
          }
        }
      ]
    });
    alert.present();
  }

  showToast(message:any) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

}
