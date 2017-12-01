import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, Platform, ToastController  } from 'ionic-angular';
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

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public restapiService: RestapiServiceProvider, 
              public storage:Storage, 
              public localNotifications:LocalNotifications, 
              public platform:Platform, 
              public toastCtrl:ToastController) {
                console.log('login view');   
    this.storage.get('apiUrl').then((val) => {
      this.credentials.apiUrl = val;
    });
    this.storage.get('zalogowany').then((val) => {
      if(val != null){
        this.navCtrl.push(HomePage);
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
        this.navCtrl.push(HomePage);
      }
      else{
        this.showToast("Podałeś zły login lub hasło.");
      }
    });
  }

  login2() {
    // console.log("credentials.apiUrl "+this.credentials.apiUrl);
    // this.storage.set('apiUrl', this.credentials.apiUrl);
    // this.storage.get('apiUrl').then((value) => {
    //   console.log("storage apiurl "+value);
    //  });
    this.loginData.username = this.credentials.login;
    this.loginData.password = this.credentials.password;
    this.restapiService.login(this.loginData).subscribe((data) => {
      console.log(data);
      this.storage.set('isLoggedIn',true);
      this.navCtrl.push(HomePage);
      //console.log(this.credentials.login+" "+this.credentials.password);
    });
    // this.storage.set('isLoggedIn',true);
    // this.navCtrl.push(HomePage);
    //console.log(this.credentials.login+" "+this.credentials.password);
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
