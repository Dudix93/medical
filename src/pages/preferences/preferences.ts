import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CommonModule } from '@angular/common';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';

@IonicPage()
@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html',
})
export class PreferencesPage {

  preferences:any;
  loggedUser = {id:'', login:''}
  settings = {user_id:'', 
              pon: '', ponOd: '', ponDo: '', 
              wt:'', wtOd: '', wtDo: '',  
              sr:'', srOd: '', srDo: '',  
              czw:'', czwOd: '', czwDo: '',  
              pt:'', ptOd: '', ptDo: '',  
              sob:'', sobOd: '', sobDo: '',  
              nd:'', ndOd: '', ndDo: '', }
  deleteID:any;
  constructor(public navCtrl: NavController, public restapiService: RestapiServiceProvider, public navParams: NavParams, public storage:Storage) {
    this.getLoggedUser();
    this.getUserPreferences();
  }

  getUserPreferences() {
    this.restapiService.getUserPreferences()
    .then(data => {
      this.preferences = data;
      for (let entry of this.preferences) {
          this.storage.get('zalogowany_id').then((val) => {
            if(entry.user_id == val){
              this.deleteID = entry.id;
              this.settings.user_id = entry.user_id;
              this.settings.pon = entry.pon;
              this.settings.wt = entry.wt;
              this.settings.sr = entry.sr;
              this.settings.czw = entry.czw;
              this.settings.pt = entry.pt;
              this.settings.sob = entry.sob;
              this.settings.nd = entry.nd;
              
              this.settings.ponOd = entry.ponOd;
              this.settings.wtOd = entry.wtOd;
              this.settings.srOd = entry.srOd;
              this.settings.czwOd = entry.czwOd;
              this.settings.ptOd = entry.ptOd;
              this.settings.sobOd = entry.sobOd;
              this.settings.ndOd = entry.ndOd;

              this.settings.ponDo = entry.ponDo;
              this.settings.wtDo = entry.wtDo;
              this.settings.srDo = entry.srDo;
              this.settings.czwDo = entry.czwDo;
              this.settings.ptDo = entry.ptDo;
              this.settings.sobDo = entry.sobDo;
              this.settings.ndDo = entry.ndDo;
              console.log(this.deleteID);
            }
          });
        }
    });
  }

  getLoggedUser(){
    this.storage.get('zalogowany_id').then((val) => {
      this.loggedUser.id = val;
    });
    this.storage.get('zalogowany').then((val) => {
      this.loggedUser.login = val;
    });
    console.log(this.loggedUser);
    return this.loggedUser;
  }

  saveUserPreferences() {
    console.log(this.settings);
    this.restapiService.deleteUserPreferences(this.deleteID);
    this.restapiService.saveUserPreferences(this.settings);
  }
}
