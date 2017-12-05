import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, Platform, ToastController  } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';
import { LocalNotifications} from '@ionic-native/local-notifications'
import {GlobalVars} from '../../app/globalVars'

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

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public restapiService: RestapiServiceProvider, 
              public storage:Storage, 
              public localNotifications:LocalNotifications, 
              public platform:Platform, 
              public toastCtrl:ToastController,
              public globalVar:GlobalVars) {
    this.storage.get('apiUrl').then((val) => {
      this.credentials.apiUrl = val;
    });
    this.storage.get('isLoggedIn').then((val) => {
      if(val == true){
        this.storage.get('zalogowany').then(login => {
          this.storage.get('haslo').then(password => {
            this.login2(login,password);
          });
        });
      }
    });
  }

  scheduleNotification() {
    this.localNotifications.schedule({
      id: 1,
      title: 'Powiadomienie',
      text: 'Treść powiadomienia',
      data: { mydata: 'My hidden message' },
      at: new Date()
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
      console.log("dejta: "+data);
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
        console.log('odpalam');
        this.storage.set('isLoggedIn',true);
        this.navCtrl.push(HomePage);
      }
      else{
        this.showToast("Podałeś zły login lub hasło.");
      }
    });
  }

  login2(login:string,password:string) {

    this.storage.set('apiUrl', this.credentials.apiUrl);
    this.globalVar.setApiUrl(this.credentials.apiUrl);

    if(login != null && password != null){
      this.loginData.username = login;
      this.loginData.password = password;
    }
    else{
      this.loginData.username = this.credentials.login;
      this.loginData.password = this.credentials.password;
    }

    console.log(this.restapiService.login(this.loginData));
    
    this.restapiService.login(this.loginData).subscribe((data) => {
      console.log(data);
      this.storage.set('isLoggedIn',true);
      this.storage.set('zalogowany', this.loginData.username);
      this.storage.set('haslo', this.loginData.password);
      this.navCtrl.push(HomePage);
    });
  }

  register(){
    this.correct=true;
    this.navCtrl.push(RegisterPage);
  }

  showToast(message:any) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

}
