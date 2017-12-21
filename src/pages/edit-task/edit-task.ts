import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { GlobalVars } from '../../app/globalVars';

@Component({
  selector: 'page-edit-task',
  templateUrl: 'edit-task.html',
})
export class EditTaskPage {

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

  constructor(public navCtrl: NavController, 
              public navParams:NavParams, 
              private restapiService: RestapiServiceProvider, 
              private storage: Storage,
              private alertCtrl: AlertController,
              private events: Events,
              private globalVars: GlobalVars) 
  {
    this.getRaportData();
  }

  // getEditTaskData(){
  //   this.task_id = this.navParams.get('task_id');
  //   if(this.navParams.get('date') == undefined){
  //     this.restapiService.getRaports(this.task_id).then(data => {
  //       this.globalVars.setRaport(data);
  //       this.task_name = this.globalVars.getRaport().action.name;
  //       this.comment = this.currentComment = this.globalVars.getRaport().comment;
  //       this.countMethod = this.globalVars.getRaport().countMethod;
  //       this.lastUpdateTime = this.globalVars.getRaport().lastUpdateTimeOf;
  //       if(this.globalVars.getRaport().timeOf > 60){
  //         this.timeOfHours = (this.globalVars.getRaport().timeOf/60).toString().split(".")[0];
  //         this.timeOfMinutes = (this.globalVars.getRaport().timeOf)-(this.timeOfHours*60);
  //       }
  //       else{
  //         this.timeOfHours = 0;
  //         this.timeOfMinutes = this.globalVars.getRaport().timeOf;
  //       }
  //       this.updateDate = new Date(this.globalVars.getRaport().lastUpdateDate).toLocaleDateString().concat(" ".
  //                         concat(new Date(this.globalVars.getRaport().lastUpdateDate).getHours().toString().concat(":".
  //                         concat(new Date(this.globalVars.getRaport().lastUpdateDate).getMinutes().toString()))));
  //       this.startDate = new Date(this.globalVars.getRaport().startDate).toLocaleDateString().concat(" ".
  //                         concat(new Date(this.globalVars.getRaport().startDate).getHours().toString().concat(":".
  //                         concat(new Date(this.globalVars.getRaport().startDate).getMinutes().toString()))));
                          
  //     });
  //   }
  //   else{
  //     // this.restapiService.getRaports(this.task_id).then(data => {
  //     //   this.globalVars.setRaport(data);
  //     //   this.task_name = this.globalVars.getRaport().action.name;
  //     //   console.log("globalVars.getRaport(): "+this.globalVars.getRaport());
  //     // });
  //   }
  // }

  getHour(){
    var minutes = new Date().getMinutes();
    if(minutes < 10){
      return JSON.stringify(new Date().getHours()).concat(':0').concat(JSON.stringify(new Date().getMinutes()));
    }
    else{
      return JSON.stringify(new Date().getHours()).concat(':').concat(JSON.stringify(new Date().getMinutes()));
    }
  }

// updateTask(){
//   if(this.updateTime != undefined && this.updateTime != '' && isNaN(Number(this.updateTime)) == true){
//     this.showalert("Wpisz liczbę!");
//   }
//   else if(this.updateTime != undefined && this.updateTime != '' && Number(this.updateTime) !== parseInt(this.updateTime, 10)){
//     this.showalert("Wpisz pełną godzine!");
//   }
//   else{
//     console.log(this.globalVars.getRaport());
//     if((this.updateTime != undefined && this.updateTime != '') || this.globalVars.getRaport().comment != this.comment){
//       if(this.globalVars.getRaport().comment != this.comment) this.globalVars.setComment(this.comment);
//       if(this.globalVars.getRaport().timeOf != this.updateTime && this.updateTime != undefined){
//         console.log(this.globalVars.getRaport().timeOf+" "+this.updateTime);
//         this.globalVars.setTimeOf((Number(this.updateTime)*60) + Number(this.globalVars.getRaport().timeOf));
//         this.globalVars.setLastUpdateTimeOf(this.updateTime);
//         this.globalVars.setLastUpdateDate(new Date());
//       }
//       console.log(this.globalVars.getRaport());
//       this.restapiService.updateRaport(this.globalVars.getRaport().id,this.globalVars.getRaport());
//       this.showalert("Zaktualizowano czynność.");
//     }
//   }
//   this.getEditTaskData();
//   //this.events.publish('updateViewAfterEdit');
// }

getRaportData(){
  this.raport = this.navParams.get('raport');
        this.countMethod = this.raport.countMethod;
        this.task_name = this.raport.action.name;
        this.comment = this.raport.comment;
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
                          concat(new Date(this.raport.lastUpdateDate).getMinutes().toString()))));
        this.startDate = new Date(this.raport.startDate).toLocaleDateString().concat(" ".
                          concat(new Date(this.raport.startDate).getHours().toString().concat(":".
                          concat(new Date(this.raport.startDate).getMinutes().toString()))));    
}

  updateTask(){
    this.raport = this.navParams.get('raport');
    if(this.raport.countMethod == 'manual'){
      this.restapiService.getRaports(null).then(rap => {
        this.raports = rap;
        for(let raport of this.raports){
          if(this.raport.action.id == raport.action.id && this.raport.projectId == raport.projectId && this.raport.id == raport.id){
            raport.lastUpdateDate = new Date();
            if(this.updateTime != '' && this.updateTime != undefined && this.updateTime != null){
              raport.lastUpdateTimeOf = this.updateTime;
              raport.timeOf = raport.timeOf + this.updateTime*60;
            }
            console.log(raport.comment+" "+this.comment);
            if(raport.comment != this.comment) raport.comment = this.comment;
            this.restapiService.updateRaport(raport.id,raport);
          }
        }
        this.getRaportData();
        this.events.publish('updateViewAfterEdit');
      });
    }
    if(this.raport.countMethod == 'automatic'){
      this.restapiService.getRaports(null).then(rap => {
        this.raports = rap;
        for(let raport of this.raports){
          if(this.raport.action.id == raport.action.id && this.raport.projectId == raport.projectId){
            raport.comment = this.comment;
            this.restapiService.updateRaport(raport.id,raport);
          }
        }
        this.getRaportData();
        this.events.publish('updateViewAfterEdit');
      });
    }
  }

// updatePastTask(){
//   if(isNaN(Number(this.taskToEdit.time)) == true){
//     this.showalert("Wpisz liczbę!");
//   }
//   else if(this.taskToEdit.time != parseInt(this.taskToEdit.time.toString(), 10)){
//     this.showalert("Wpisz pełną godzine!");
//   }
//   else if(this.taskToEdit.time == this.editedTask.time && this.taskToEdit.description == this.editedTask.description){
//     this.showalert("Nie dokonałeś żadnej zmiany!");
//   }
//   else{
//     this.editedTask.time = this.taskToEdit.time;
//     this.editedTask.description = this.taskToEdit.description;
//     this.restapiService.getDayTaskUpdate(this.editedTask.task_id,this.editedTask.user_id,this.editedTask.date)
//     .then(data => {
//       this.getEditedTask = data;
//       if(this.getEditedTask != ''){
//         for(let et of this.getEditedTask){
//           this.restapiService.updateDayTaskUpdate(et.id,this.editedTask);
//           this.navCtrl.pop();
//         }
//       }
//       else{
//         this.restapiService.saveDayTaskUpdate(this.editedTask);
//         this.navCtrl.pop();
//       }
//     });
//   }
// }


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
