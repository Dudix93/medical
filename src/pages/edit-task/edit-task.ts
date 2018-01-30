import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { GlobalVars } from '../../app/globalVars';
import { DayTask } from '../../models/dayTask';
import { CalendarPage } from '../../pages/calendar/calendar';

@Component({
  selector: 'page-edit-task',
  templateUrl: 'edit-task.html',
})
export class EditTaskPage {

  raportId:any;
  raports:any;
  raport:any;
  updateDate:any;
  task_name:any;
  timeOfHours:any;
  timeOfMinutes:any;
  comment:any;
  startDate:any;
  countMethod:any;
  updateTime:any;
  lastUpdateTimeOf:any;
  currentComment:any;
  currentTime:any;
  timeSpent:any;
  timeLeft:any;
  projectTime:any;
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
              public navParams:NavParams, 
              private restapiService: RestapiServiceProvider, 
              private storage: Storage,
              private alertCtrl: AlertController,
              private events: Events,
              private globalVars: GlobalVars) 
  {
    if(this.navParams.get('time') != undefined)this.getEditTaskData();
    else this.getRaportData();
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

  getEditTaskData(){
    this.taskToEdit.date = this.navParams.get('date');
    this.taskToEdit.taskId = this.navParams.get('task_id');
    this.taskToEdit.userId = this.navParams.get('user_id');
    this.taskToEdit.projectId = this.navParams.get('project_id');
    this.taskToEdit.time = this.currentTime = this.navParams.get('time');

    this.restapiService.getRaports(null).then(data =>{
      this.raports = data;
      for(let raport of this.raports){
        if(raport.endDate != null && raport.action.id == this.taskToEdit.taskId && raport.projectId == this.taskToEdit.projectId){
          this.taskToEdit.comment = this.currentComment = raport.comment;
          this.task_name = raport.action.name;
          break;
        }
      }
      console.log(JSON.stringify(this.taskToEdit));
    });
  }

  fullMinutes(m:number){
    if(m<10){
      return '0'.concat(m.toString());
    }
    else return m.toString();
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

getRaportData(){
  this.timeSpent = this.navParams.get('timeSpent');
  this.projectTime = this.navParams.get('projectTime');
  this.timeSpent = Number(this.timeSpent.split(':')[0])*60 + Number(this.timeSpent.split(':')[1]);
  this.timeLeft = this.minutesToHM((this.projectTime*60-this.timeSpent)/60);

  this.raportId = this.navParams.get('raportId');
  this.restapiService.getRaports(null).then(rap => {
    this.raports = rap;
    for(let raport of this.raports){
      if(this.raportId == raport.id){
        this.raport = raport;
        this.countMethod = this.raport.countMethod;
        this.task_name = this.raport.action.name;
        this.comment = this.currentComment = this.raport.comment;
        this.lastUpdateTimeOf = this.raport.lastUpdateTimeOf;
        if(this.raport.timeOf > 60){
          this.timeOfHours = (this.raport.timeOf/60).toString().split(".")[0];
          this.timeOfMinutes = (this.raport.timeOf)-(this.timeOfHours*60);
        }
        else{
          this.timeOfHours = 0;
          this.timeOfMinutes = this.raport.timeOf;
        }
        this.updateDate = new Date(this.raport.lastUpdateDate).toLocaleDateString().concat(" ".
                          concat(new Date(this.raport.lastUpdateDate).getHours().toString().concat(":".
                          concat(this.fullMinutes(new Date(this.raport.lastUpdateDate).getMinutes())))));
        this.startDate = new Date(this.raport.startDate).toLocaleDateString().concat(" ".
                          concat(new Date(this.raport.startDate).getHours().toString().concat(":".
                          concat(this.fullMinutes(new Date(this.raport.startDate).getMinutes())))));   
              break;
      }
    }
    console.log(this.lastUpdateTimeOf);
    console.log(this.updateDate);
    console.log(this.timeOfHours+":"+this.timeOfMinutes);
  }); 
}

  updateTask(){
    let dayTasks;
    let updated = false;
    if(this.raport.countMethod == 'manual'){
      if(isNaN(Number(this.updateTime)) == true && this.updateTime != undefined){
        this.showalert("Wpisz liczbę!");
      }
      else if(this.updateTime != undefined && this.updateTime != parseInt(this.updateTime.toString(), 10)){
        this.showalert("Wpisz pełną godzine!");
      }
      else if(Number(this.updateTime) < 0){
        this.showalert("Wpisz dodatnią liczbę!");
      }
      else if(Number(this.updateTime)*60 > (this.projectTime*60-this.timeSpent)){
        this.showalert("Przekroczysz pulę godzin w projekcie!");
      }
      else{
      this.restapiService.getRaports(null).then(rap => {
        this.raports = rap;
        for(let raport of this.raports){
          if(this.raport.action.id == raport.action.id && this.raport.projectId == raport.projectId && this.raport.id == raport.id){
            raport.lastUpdateDate = new Date();
            if(this.updateTime != '' && this.updateTime != undefined && this.updateTime != null){
              raport.lastUpdateTimeOf = this.updateTime;
              raport.timeOf = raport.timeOf + this.updateTime*60;
            }
              this.restapiService.getDayTask().then(data =>{
                dayTasks = data;
                for(let dayTask of dayTasks){
                  if(dayTask.date && raport.action.id == dayTask.taskId && raport.action.id == dayTask.taskId){
                    dayTask.comment = this.comment;
                    this.restapiService.updateDayTask(dayTask.id,dayTask);
                  }
                  if(new Date().toLocaleDateString() == dayTask.date && raport.action.id == dayTask.taskId && raport.action.id == dayTask.taskId){
                    if(this.updateTime != '' && this.updateTime != undefined && this.updateTime != null){
                      if(dayTask.time != undefined) dayTask.time = Number(dayTask.time) + Number(this.updateTime);
                      else dayTask.time = Number(this.updateTime);
                    }
                    dayTask.comment = this.comment;
                    this.restapiService.updateDayTask(dayTask.id,dayTask);
                    console.log('update: '+JSON.stringify(dayTask));
                    updated = true;
                    break;
                  }
                }
                if(updated == false){
                  this.restapiService.saveDayTask(new DayTask(this.raport.action.id,this.raport.projectId,this.raport.userId,new Date().toLocaleDateString(),this.updateTime,this.comment));
                  console.log('save: '+JSON.stringify(new DayTask(this.raport.action.id,this.raport.projectId,this.raport.userId,new Date().toLocaleDateString(),this.updateTime,this.comment)));
                }
              });
            console.log(raport.comment);
            console.log(this.comment);
            if(raport.comment != this.comment) raport.comment = this.comment;
            this.restapiService.updateRaport(raport.id,raport);
          }
        }
        this.events.publish('updateViewAfterEdit');
        this.showalert('Zaktualizowano czynność.');
        this.navCtrl.pop();
      });
    }
    }
    else if(this.raport.countMethod == 'automatic'){
      this.restapiService.getRaports(null).then(rap => {
        this.raports = rap;
        for(let raport of this.raports){
          if(this.raport.action.id == raport.action.id && this.raport.projectId == raport.projectId){
            if(raport.comment != this.comment) raport.comment = this.comment;
            this.restapiService.updateRaport(raport.id,raport);
          }
        }
        this.events.publish('updateViewAfterEdit');
        this.showalert('Zaktualizowano czynność.');
        this.navCtrl.pop();
      });
    }
  }

updatePastTask(){
  let updated = false;
  if(isNaN(Number(this.taskToEdit.time)) == true){
    this.showalert("Wpisz liczbę!");
  }
  else if(this.taskToEdit.time != parseInt(this.taskToEdit.time.toString(), 10)){
    this.showalert("Wpisz pełną godzine!");
  }
  else{
    this.taskToEdit.updateDate = new Date();
    
    this.restapiService.getRaportUpdate().then(data =>{
      this.raports = data;
      for(let update of this.raports){
        if(this.taskToEdit.projectId == update.projectId && this.taskToEdit.taskId == update.taskId && this.taskToEdit.date == update.date){
          this.restapiService.updateRaportUpdate(update.id,this.taskToEdit);
          updated = true;
          break;
        }
      }
      if(updated == false) this.restapiService.saveRaportUpdate(this.taskToEdit);
      this.showalert('Zaktualizowano czynność.');
      this.globalVars.setSelectedProject(this.taskToEdit.projectId);
      this.globalVars.setSelectedTask(this.taskToEdit.taskId);
      // this.navCtrl.pop();
      // this.navCtrl.pop();
      // this.events.publish('updatePastTasksList');
      // this.navCtrl.push(CalendarPage);
      //this.events.publish('updatePastTasksList');
    });
  }
}


showalert(info:string) {
  const alert = this.alertCtrl.create({
    title: info,
    buttons: [
      {
        text: 'Ok',
      }
    ]
  });
  alert.present();
}

}
