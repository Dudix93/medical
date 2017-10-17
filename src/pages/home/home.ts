import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  users: any;
  user = {name: '', id:''}

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
    this.restapiService.saveUser(this.user).then((result) => {
      console.log(this.user);
      this.getUsers();
    }, (err) => {
      console.log(err);
    });
  }

  deleteUser(id:String) {
    this.restapiService.deleteUser(id).then((result) => {
      console.log(result);
      this.getUsers();
    }, (err) => {
      console.log(err);
    });
  }
}
