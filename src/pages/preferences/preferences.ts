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
  settings = {user_id:'', pon: '', wt:'', sr:'', czw:'', pt:'', sob:'', nd:''}

  constructor(public navCtrl: NavController, public restapiService: RestapiServiceProvider, public navParams: NavParams, public storage:Storage) {
    this.getLoggedUser();
    this.getUserPreferences();
  }

  getUserPreferences() {
    this.restapiService.getUserPreferences()
    .then(data => {
      this.preferences = data;
      //console.log(data);
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
    // this.restapiService.saveTask(this.days).then((result) => {
    //   console.log(this.days);
    //   this.getUserPreferences();
    // }, (err) => {
    //   console.log(err);
    // });
  }
}
