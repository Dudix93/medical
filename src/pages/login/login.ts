import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Router } from '@angular/router';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  credentials = {apiUrl:'', login: '', password:''}

  constructor(public navCtrl: NavController, public navParams: NavParams, public router: Router) {
  }

  login() {
    console.log(this.credentials);
    //this.router.navigate(['/home']);
  }

}
