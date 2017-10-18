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
  corect:boolean

  constructor(public navCtrl: NavController, public navParams: NavParams, public restapiService: RestapiServiceProvider) {
  }

  login() {
    //console.log(this.credentials);
    this.restapiService.getUsers()
    .then(data => {
      this.users = data;
      console.log(data);
    });
    //this.navCtrl.push(HomePage);
  }

}
