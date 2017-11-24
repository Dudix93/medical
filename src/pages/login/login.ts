import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';
import { LocalNotifications} from '@ionic-native/local-notifications'

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  users:any
  apiUrl:string;
  credentials = {apiUrl: '', login: '', password:''}
  loginData = {password:'',rememberMe:true,username:''}
  correct:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public restapiService: RestapiServiceProvider, public storage:Storage, public localNotifications:LocalNotifications, public platform:Platform, public alertCtrl:AlertController) {
    this.storage.get('apiUrl').then((val) => {
      this.credentials.apiUrl = val;
    });
    this.storage.get('zalogowany').then((val) => {
      if(val != null){
        this.navCtrl.push(HomePage);
      }
    });

    // this.platform.ready().then((readySource) => {
    //   this.localNotifications.on('click', (notification, state) => {
    //     let json = JSON.parse(notification.data);
   
    //     let alert = alertCtrl.create({
    //       title: notification.title,
    //       subTitle: json.mydata
    //     });
    //     alert.present();
    //   })
    // });
  }

  scheduleNotification() {
    this.localNotifications.schedule({
      id: 1,
      title: 'Attention',
      text: 'Simons Notification',
      data: { mydata: 'My hidden message this is' },
      at: new Date(new Date().getTime() + 5 * 1000)
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
      for (var user of this.users) {
        if(user.login == this.credentials.login){
          if(user.password == this.credentials.password && user.active == true){
            this.correct = true;
            this.storage.set('zalogowany', user.login);
            this.storage.set('zalogowany_id', user.id);
            break;
          }
        }
      }
      if(this.correct == true){
        this.navCtrl.push(HomePage);
      }
    });
  }

  login2() {
    console.log("credentials.apiUrl "+this.credentials.apiUrl);
    this.storage.set('apiUrl', this.credentials.apiUrl);
    this.storage.get('apiUrl').then((value) => {
      console.log("storage apiurl "+value);
     });
    this.loginData.username = this.credentials.login;
    this.loginData.password = this.credentials.password;
    this.restapiService.login(this.loginData);
    //console.log(this.credentials.login+" "+this.credentials.password);
  }

  register(){
    this.correct=true;
    this.navCtrl.push(RegisterPage);
  }

}
