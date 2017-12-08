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
              ponId:0,pon:true, ponOd: '', ponDo: '', 
              wtId:0,wt:true, wtOd: '', wtDo: '',  
              srId:0,sr:true, srOd: '', srDo: '',  
              czwId:0,czw:true, czwOd: '', czwDo: '',  
              ptId:0,pt:true, ptOd: '', ptDo: '',  
              sobId:0,sob:true, sobOd: '', sobDo: '',  
              ndId:0,nd:true, ndOd: '', ndDo: '', 
              }

    singleDay = {
      id:0,
      dayOfWeek:0,
      hourFrom:'',
      hourTo:'',
      workDay:true
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
        console.log(entry);
              this.settings.id = entry.id;
              this.settings.method_for_all = entry.method_for_all;
              this.settings.count_method = entry.count_method;
              this.settings.user_id = entry.user_id;

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
              // console.log("pon settings: "+if(entry.dayOfWeek == 6)this.settings.sobDo);
              // console.log("pon entry: "+entry.sobDo);
              //console.log("Do usunięcia: "+this.deleteID);
            }
            
        });
  }

  saveUserPreferences() {

    this.restapiService.updateUserPreferences(this.settings.ponId,new SingleDay(this.settings.ponId,1,this.settings.ponOd,this.settings.ponDo,this.settings.pon));

    // this.restapiService.updateUserPreferences(this.settings.wtId,new SingleDay(this.settings.wtId,2,this.settings.wtOd,this.settings.wtDo,this.settings.wt));

    // this.restapiService.updateUserPreferences(this.settings.srId,new SingleDay(this.settings.ptId,3,this.settings.srOd,this.settings.srDo,this.settings.sr));

    // this.restapiService.updateUserPreferences(this.settings.czwId,new SingleDay(this.settings.ptId,4,this.settings.czwOd,this.settings.czwDo,this.settings.czw));

    // this.restapiService.updateUserPreferences(this.settings.ptId,new SingleDay(this.settings.czwId,5,this.settings.ptOd,this.settings.ptDo,this.settings.pt));

    // this.restapiService.updateUserPreferences(this.settings.sobId,new SingleDay(this.settings.sobId,6,this.settings.sobOd,this.settings.sobDo,this.settings.sob));

    // this.restapiService.updateUserPreferences(this.settings.ndId,new SingleDay(this.settings.ndId,0,this.settings.ndOd,this.settings.ndDo,this.settings.nd));

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
