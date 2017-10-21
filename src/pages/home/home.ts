import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { LoginPage } from '../login/login';
import { PreferencesPage } from '../preferences/preferences';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  tasks: any;
  task = {title: '', id:''}
  login:string;
  userProjects:Array<any>;
  constructor(public navCtrl: NavController, public restapiService: RestapiServiceProvider, public storage:Storage) {
    this.storage.get('zalogowany').then((val) => {
      this.login = val;
    });
    this.getTasks();
  }

  getTasks() {
    this.restapiService.getProjects()
    .then(data => {
      this.tasks = data;
    });
  }

  saveTask() {
    this.restapiService.saveTask(this.task).then((result) => {
      console.log(this.task);
      this.getTasks();
    }, (err) => {
      console.log(err);
    });
  }

  deleteTask(id:String) {
    this.restapiService.deleteTask(id).then((result) => {
      console.log(result);
      this.getTasks();
    }, (err) => {
      console.log(err);
    });
  }

  logout(){
    this.storage.set('zalogowany', null);
    this.storage.set('zalogowany_id', null);
    this.navCtrl.push(LoginPage);
  }

  preferences(){
    this.navCtrl.push(PreferencesPage);
  }
}
