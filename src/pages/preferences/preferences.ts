import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CommonModule } from '@angular/common';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { SingleDay } from '../../models/singleDay'

@IonicPage()
@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html',
})
export class PreferencesPage {

  preferences:any;
  loggedUser = {id:'', login:''}
  settings = {id:0,
              user_id:'',
              method_for_all:false,
              count_method: '',
              pon:true, ponOd: '', ponDo: '', 
              wt:true, wtOd: '', wtDo: '',  
              sr:true, srOd: '', srDo: '',  
              czw:true, czwOd: '', czwDo: '',  
              pt:true, ptOd: '', ptDo: '',  
              sob:true, sobOd: '', sobDo: '',  
              nd:true, ndOd: '', ndDo: '', }

    singleDay = {
      id:0,
      day:0,
      start_hour:'',
      finish_hour:'',
      work_day:true
    }
  constructor(public navCtrl: NavController, 
              public restapiService: RestapiServiceProvider, 
              public navParams: NavParams, 
              public storage:Storage,
              public alertCtrl:AlertController) {
    this.getUserPreferences();
    //console.log(this.settings);
  }

  getUserPreferences() {
    this.restapiService.getUserPreferences()
    .then(data => {
      this.preferences = data;
      for (let entry of this.preferences) {
              this.settings.id = entry.id;
              this.settings.method_for_all = entry.method_for_all;
              this.settings.count_method = entry.count_method;
              this.settings.user_id = entry.user_id;
              
              if(entry.day == 1)this.settings.pon = entry.work_day;
              if(entry.day == 2)this.settings.wt = entry.work_day;
              if(entry.day == 3)this.settings.sr = entry.work_day;
              if(entry.day == 4)this.settings.czw = entry.work_day;
              if(entry.day == 5)this.settings.pt = entry.work_day;
              if(entry.day == 6)this.settings.sob = entry.work_day;
              if(entry.day == 0)this.settings.nd = entry.work_day;
              
              if(entry.day == 1)this.settings.ponOd = entry.start_hour;
              if(entry.day == 2)this.settings.wtOd = entry.start_hour;
              if(entry.day == 3)this.settings.srOd = entry.start_hour;
              if(entry.day == 4)this.settings.czwOd = entry.start_hour;
              if(entry.day == 5)this.settings.ptOd = entry.start_hour;
              if(entry.day == 6)this.settings.sobOd = entry.start_hour;
              if(entry.day == 0)this.settings.ndOd = entry.start_hour;

              if(entry.day == 1)this.settings.ponDo = entry.finish_hour;
              if(entry.day == 2)this.settings.wtDo = entry.finish_hour;
              if(entry.day == 3)this.settings.srDo = entry.finish_hour;
              if(entry.day == 4)this.settings.czwDo = entry.finish_hour;
              if(entry.day == 5)this.settings.ptDo = entry.finish_hour;
              if(entry.day == 6)this.settings.sobDo = entry.finish_hour;
              if(entry.day == 0)this.settings.ndDo = entry.finish_hour;
            }
            
        });
  }

  saveUserPreferences() {

    this.restapiService.updateUserPreferences(1,new SingleDay(1,1,this.settings.ponOd,this.settings.ponDo,this.settings.pon));

    this.restapiService.updateUserPreferences(2,new SingleDay(2,2,this.settings.wtOd,this.settings.wtDo,this.settings.wt));

    this.restapiService.updateUserPreferences(3,new SingleDay(3,3,this.settings.srOd,this.settings.srDo,this.settings.sr));

    this.restapiService.updateUserPreferences(4,new SingleDay(4,4,this.settings.czwOd,this.settings.czwDo,this.settings.czw));

    this.restapiService.updateUserPreferences(5,new SingleDay(5,5,this.settings.ptOd,this.settings.ptDo,this.settings.pt));

    this.restapiService.updateUserPreferences(6,new SingleDay(6,6,this.settings.sobOd,this.settings.sobDo,this.settings.sob));

    this.restapiService.updateUserPreferences(0,new SingleDay(0,0,this.settings.ndOd,this.settings.ndDo,this.settings.nd));

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
