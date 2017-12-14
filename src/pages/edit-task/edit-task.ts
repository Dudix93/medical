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

  task_id:any;
  updateDate:any;
  task_name:any;
  timeOfHours:any;
  timeOfMinutes:any;
  comment:any;
  startDate:any;
  countMethod:any;
  updateTime:any;
  lastUpdateTime:any;
  currentComment:any;

  constructor(public navCtrl: NavController, 
              public navParams:NavParams, 
              private restapiService: RestapiServiceProvider, 
              private storage: Storage,
              private alertCtrl: AlertController,
              private events: Events,
              private globalVars: GlobalVars) 
  {
    this.task_id = this.navParams.get('task_id');
    if(this.navParams.get('date') == undefined){
      this.restapiService.getRaports(this.task_id).then(data => {
        this.globalVars.setRaport(data);
        this.task_name = this.globalVars.getRaport().action.name;
        this.comment = this.currentComment = this.globalVars.getRaport().comment;
        this.countMethod = this.globalVars.getRaport().countMethod;
        this.lastUpdateTime = this.globalVars.getRaport().lastUpdateTimeOf;
        if(this.globalVars.getRaport().timeOf > 60){
          this.timeOfHours = (this.globalVars.getRaport().timeOf/60).toString().split(".")[0];
          this.timeOfMinutes = (this.globalVars.getRaport().timeOf)-(this.timeOfHours*60);
        }
        else{
          this.timeOfHours = 0;
          this.timeOfMinutes = this.globalVars.getRaport().timeOf;
        }
        this.updateDate = new Date(this.globalVars.getRaport().lastUpdateDate).toLocaleDateString().concat(" ".
                          concat(new Date(this.globalVars.getRaport().lastUpdateDate).getHours().toString().concat(":".
                          concat(new Date(this.globalVars.getRaport().lastUpdateDate).getMinutes().toString()))));
        this.startDate = new Date(this.globalVars.getRaport().startDate).toLocaleDateString().concat(" ".
                          concat(new Date(this.globalVars.getRaport().startDate).getHours().toString().concat(":".
                          concat(new Date(this.globalVars.getRaport().startDate).getMinutes().toString()))));
                          
      });
    }
    else{
      // this.restapiService.getRaports(this.task_id).then(data => {
      //   this.globalVars.setRaport(data);
      //   this.task_name = this.globalVars.getRaport().action.name;
      //   console.log("globalVars.getRaport(): "+this.globalVars.getRaport());
      // });
    }
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

updateTask(){
  if(this.updateTime != undefined && this.updateTime != '' && isNaN(Number(this.updateTime)) == true){
    this.showalert("Wpisz liczbę!");
  }
  else if(this.updateTime != undefined && this.updateTime != '' && Number(this.updateTime) !== parseInt(this.updateTime, 10)){
    this.showalert("Wpisz pełną godzine!");
  }
  else{
    if(this.updateTime != undefined && this.updateTime != ''){
      if(this.globalVars.getRaport().comment != this.comment) this.globalVars.setComment(this.comment);
      if(this.globalVars.getRaport().timeOf != this.updateTime){
        this.globalVars.setTimeOf(Number(this.updateTime) + Number(this.globalVars.getRaport().timeOf));
        this.globalVars.setLastUpdateTimeOf(this.updateTime);
        this.globalVars.setLastUpdateDate(new Date());
      }
      this.restapiService.updateRaport(this.globalVars.getRaport().id,this.globalVars.getRaport());
    }
  }
  this.events.publish('updateViewAfterEdit');
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
        handler: () => {
          //this.startTask(data);
        }
      }
    ]
  });
  alert.present();
}

}
