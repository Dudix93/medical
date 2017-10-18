import { Component } from '@angular/core';
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
  credentials = {apiUrl:'', login: '', password:''}
  correct=false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public restapiService: RestapiServiceProvider) {
  }

  login() {
    //console.log(this.credentials);
    this.restapiService.getUsers()
    .then(data => {
      this.correct=false;
      this.users = data;
      for (var item of this.users) {
        if(item.login == this.credentials.login){
          if(item.password == this.credentials.password){
            this.correct = true;
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
