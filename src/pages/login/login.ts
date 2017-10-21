import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { HomePage } from '../home/home';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  users:any
  apiUrl:string;
  credentials = {apiUrl: '', login: '', password:''}
  correct:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public restapiService: RestapiServiceProvider, public storage:Storage) {
    this.storage.get('apiUrl').then((val) => {
      this.credentials.apiUrl = val;
    });
    this.storage.get('zalogowany').then((val) => {
      if(val != null){
        this.navCtrl.push(HomePage);
      }
    });
  }

  login() {
    console.log("credentials.apiUrl "+this.credentials.apiUrl);
    this.storage.set('apiUrl', this.credentials.apiUrl);
    this.storage.get('apiUrl').then((value) => {
      console.log("storage apiurl "+value);
     });
    this.restapiService.getUsers()
    .then(data => {
      this.correct=false;
      this.users = data;
      console.log(this.users);
      for (var item of this.users) {
        if(item.login == this.credentials.login){
          if(item.password == this.credentials.password){
            this.correct = true;
            this.storage.set('zalogowany', item.login);
            this.storage.set('zalogowany_id', item.id);
            break;
          }
        }
      }
      if(this.correct == true){
        this.navCtrl.push(HomePage);
      }
    });
  }

}
