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

  getHour(){
    var minutes = new Date().getMinutes();
    if(minutes < 10){
      return JSON.stringify(new Date().getHours()).concat(':0').concat(JSON.stringify(new Date().getMinutes()));
    }
    else{
      return JSON.stringify(new Date().getHours()).concat(':').concat(JSON.stringify(new Date().getMinutes()));
    }
  }

getRaportData(){
  this.raportId = this.navParams.get('raportId');
  this.restapiService.getRaports(null).then(rap => {
    this.raports = rap;
    for(let raport of this.raports){
      if(this.raportId == raport.id){
        this.raport = raport;
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
              break;
      }
    }
    console.log(this.lastUpdateTimeOf);
    console.log(this.updateDate);
    console.log(this.timeOfHours+":"+this.timeOfMinutes);
  }); 
}

  updateTask(){
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
