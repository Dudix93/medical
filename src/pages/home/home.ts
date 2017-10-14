import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  users: any;

  user = {name: ''}

  constructor(public navCtrl: NavController, public restapiService: RestapiServiceProvider) {
    this.getUsers();
  }

  getUsers() {
    this.restapiService.getUsers()
    .then(data => {
      this.users = data;
    });
  }

  saveUser() {
    console.log(this.user);
    this.restapiService.saveUser(this.user).then((result) => {
      console.log(result);
      this.getUsers();
    }, (err) => {
      console.log(err);
    });
  }
}
