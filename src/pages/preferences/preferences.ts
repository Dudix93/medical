import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CommonModule } from '@angular/common';
import { IonicPage, NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { SingleDay } from '../../models/singleDay'
import { NewSingleDay } from '../../models/newSingleDay'
import { GlobalVars } from '../../app/globalVars';

@IonicPage()
@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html',
})
export class PreferencesPage {

  pref:string = 'hours';
  notifications = {
    'newMsgsNotificacion':true,
    'ownNotificationTime':null,
    'ownNotificationMsg':null,
    'ownNotificationDate':null,
    'ownNotification':false,
    'taskInProgressOption':0
  }
  taskInProgressNotification:Array<any> =[
    {'id':0, 'value':'0', 'name':'Brak'},
    {'id':1, 'value':'5000', 'name':'co 30 min'},
    {'id':2, 'value':'10000', 'name':'co 1 godzinę'},
    {'id':3, 'value':'2.0', 'name':'co 2 godziny'}
  ]

  //taskInProgressOption:string;
  preferences:any;
  loggedUser = {id:'', login:''}
  settings = {
    ponId:0,pon:true, ponOd: '', ponDo: '', 
    wtId:0,wt:true, wtOd: '', wtDo: '',  
    srId:0,sr:true, srOd: '', srDo: '',  
    czwId:0,czw:true, czwOd: '', czwDo: '',  
    ptId:0,pt:true, ptOd: '', ptDo: '',  
    sobId:0,sob:true, sobOd: '', sobDo: '',  
    ndId:0,nd:true, ndOd: '', ndDo: '', 
    }

    user = {
      "activated": this.globalVars.getUser().activated,
      "email": this.globalVars.getUser().email,
      "firstName": this.globalVars.getUser().firstName,
      "id": this.globalVars.getUser().id,
      "imageUrl": this.globalVars.getUser().imageUrl,
      "langKey": this.globalVars.getUser().langKey,
      "lastName": this.globalVars.getUser().lastName,
      "login": this.globalVars.getUser().login,
      "resetDate": null
    } 

  constructor(public navCtrl: NavController, 
              public restapiService: RestapiServiceProvider, 
              public navParams: NavParams, 
              public storage:Storage,
              public alertCtrl:AlertController,
              public events:Events,
              public globalVars:GlobalVars) {
    this.getUserPreferences();
    this.storage.get('notifications').then(data=>{
      if(data.newMsgsNotificacion == undefined) this.storage.set('notifications',this.notifications);
      else{
        this.notifications.newMsgsNotificacion = data.newMsgsNotificacion;
        this.notifications.ownNotification = data.ownNotification;
        this.notifications.ownNotificationTime = data.ownNotificationTime;
        this.notifications.ownNotificationDate = data.ownNotificationDate;
        this.notifications.ownNotificationMsg = data.ownNotificationMsg;
        console.log('defined');
      }
    });
    this.storage.get('notifications').then(data=>{
      if(data == undefined){
        this.storage.set('notifications',this.notifications);
      }
      else{
        this.notifications = data;
      }
    });
  }

  getUserPreferences() {
    this.restapiService.getUserPreferences()
    .then(data => {
      this.preferences = data;
      this.preferences.forEach(element => {
        console.log(element);
      });
      for (let entry of this.preferences) {


              if(entry.dayOfWeek == 1)this.settings.ponId = entry.id;
              if(entry.dayOfWeek == 2)this.settings.wtId = entry.id;
              if(entry.dayOfWeek == 3)this.settings.srId = entry.id;
              if(entry.dayOfWeek == 4)this.settings.czwId = entry.id;
              if(entry.dayOfWeek == 5)this.settings.ptId = entry.id;
              if(entry.dayOfWeek == 6)this.settings.sobId = entry.id;
              if(entry.dayOfWeek == 0)this.settings.ndId = entry.id;
              
              if(entry.dayOfWeek == 1)this.settings.pon = entry.workDay;
              if(entry.dayOfWeek == 2)this.settings.wt = entry.workDay;
              if(entry.dayOfWeek == 3)this.settings.sr = entry.workDay;
              if(entry.dayOfWeek == 4)this.settings.czw = entry.workDay;
              if(entry.dayOfWeek == 5)this.settings.pt = entry.workDay;
              if(entry.dayOfWeek == 6)this.settings.sob = entry.workDay;
              if(entry.dayOfWeek == 0)this.settings.nd = entry.workDay;
              
              if(entry.dayOfWeek == 1)this.settings.ponOd = entry.hourFrom;
              if(entry.dayOfWeek == 2)this.settings.wtOd = entry.hourFrom;
              if(entry.dayOfWeek == 3)this.settings.srOd = entry.hourFrom;
              if(entry.dayOfWeek == 4)this.settings.czwOd = entry.hourFrom;
              if(entry.dayOfWeek == 5)this.settings.ptOd = entry.hourFrom;
              if(entry.dayOfWeek == 6)this.settings.sobOd = entry.hourFrom;
              if(entry.dayOfWeek == 0)this.settings.ndOd = entry.hourFrom;

              if(entry.dayOfWeek == 1)this.settings.ponDo = entry.hourTo;
              if(entry.dayOfWeek == 2)this.settings.wtDo = entry.hourTo;
              if(entry.dayOfWeek == 3)this.settings.srDo = entry.hourTo;
              if(entry.dayOfWeek == 4)this.settings.czwDo = entry.hourTo;
              if(entry.dayOfWeek == 5)this.settings.ptDo = entry.hourTo;
              if(entry.dayOfWeek == 6)this.settings.sobDo = entry.hourTo;
              if(entry.dayOfWeek == 0)this.settings.ndDo = entry.hourTo;

            }
          if(this.preferences == ''){
            this.settings.ponOd = "07:00";
            this.settings.wtOd = "07:00";
            this.settings.srOd = "07:00";
            this.settings.czwOd = "07:00";
            this.settings.ptOd = "07:00";
            this.settings.sobOd = "07:00";
            this.settings.ndOd = "07:00";

            this.settings.ponDo = "15:00";
            this.settings.wtDo = "15:00";
            this.settings.srDo = "15:00";
            this.settings.czwDo = "15:00";
            this.settings.ptDo = "15:00";
            this.settings.sobDo = "15:00";
            this.settings.ndDo = "15:00";
          }
            
        });
  }

  saveUserPreferences() {

    if(this.settings.pon == true && this.settings.ponOd > this.settings.ponDo) this.showalert('Popraw godziny w poniedziałku.');
    else if(this.settings.wt == true && this.settings.wtOd > this.settings.wtDo) this.showalert('Popraw godziny w wtorku.');
    else if(this.settings.sr == true && this.settings.srOd > this.settings.srDo) this.showalert('Popraw godziny w środzie.');
    else if(this.settings.czw == true && this.settings.czwOd > this.settings.czwDo) this.showalert('Popraw godziny w czwartku.');
    else if(this.settings.pt == true && this.settings.ptOd > this.settings.ptDo) this.showalert('Popraw godziny w piątku.');
    else if(this.settings.sob == true && this.settings.sobOd > this.settings.sobDo) this.showalert('Popraw godziny w sobocie.');
    else if(this.settings.nd == true && this.settings.ndOd > this.settings.ndDo) this.showalert('Popraw godziny w niedzieli.');
    else if(this.notifications.ownNotification == true && (this.notifications.ownNotificationMsg == null || this.notifications.ownNotificationMsg == undefined || this.notifications.ownNotificationMsg == '')) this.showalert('Wpisz wiadomość.');
    else if(this.preferences != ''){
      this.restapiService.updateUserPreferences(this.settings.ponId,new SingleDay(this.settings.ponId,this.user,'1',this.settings.ponOd,this.settings.ponDo,this.settings.pon));

      this.restapiService.updateUserPreferences(this.settings.wtId,new SingleDay(this.settings.wtId,this.user,'2',this.settings.wtOd,this.settings.wtDo,this.settings.wt));
  
      this.restapiService.updateUserPreferences(this.settings.srId,new SingleDay(this.settings.srId,this.user,'3',this.settings.srOd,this.settings.srDo,this.settings.sr));
  
      this.restapiService.updateUserPreferences(this.settings.czwId,new SingleDay(this.settings.ptId,this.user,'4',this.settings.czwOd,this.settings.czwDo,this.settings.czw));
  
      this.restapiService.updateUserPreferences(this.settings.ptId,new SingleDay(this.settings.czwId,this.user,'5',this.settings.ptOd,this.settings.ptDo,this.settings.pt));
  
      this.restapiService.updateUserPreferences(this.settings.sobId,new SingleDay(this.settings.sobId,this.user,'6',this.settings.sobOd,this.settings.sobDo,this.settings.sob));
  
      this.restapiService.updateUserPreferences(this.settings.ndId,new SingleDay(this.settings.ndId,this.user,'0',this.settings.ndOd,this.settings.ndDo,this.settings.nd));

      this.showalert('Zaktualizowano<br>preferencje.');

      this.storage.set('notifications',this.notifications);
      this.storage.set('taskInProgressMsgInterval',this.notifications.taskInProgressOption);
      this.events.publish('changeNotifications');
    }
    else{
      this.restapiService.saveUserPreferences(this.settings.ponId,new NewSingleDay(this.user,'1',this.settings.ponOd,this.settings.ponDo,this.settings.pon));

      this.restapiService.saveUserPreferences(this.settings.wtId,new NewSingleDay(this.user,'2',this.settings.wtOd,this.settings.wtDo,this.settings.wt));
  
      this.restapiService.saveUserPreferences(this.settings.srId,new NewSingleDay(this.user,'3',this.settings.srOd,this.settings.srDo,this.settings.sr));
  
      this.restapiService.saveUserPreferences(this.settings.czwId,new NewSingleDay(this.user,'4',this.settings.czwOd,this.settings.czwDo,this.settings.czw));
  
      this.restapiService.saveUserPreferences(this.settings.ptId,new NewSingleDay(this.user,'5',this.settings.ptOd,this.settings.ptDo,this.settings.pt));
  
      this.restapiService.saveUserPreferences(this.settings.sobId,new NewSingleDay(this.user,'6',this.settings.sobOd,this.settings.sobDo,this.settings.sob));
  
      this.restapiService.saveUserPreferences(this.settings.ndId,new NewSingleDay(this.user,'0',this.settings.ndOd,this.settings.ndDo,this.settings.nd));

      this.showalert('Zapisano<br>preferencje.');

      this.storage.set('notifications',this.notifications);
      this.storage.set('taskInProgressMsgInterval',this.notifications.taskInProgressOption);
      this.events.publish('changeNotifications');
    }
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
