import { Component } from '@angular/core';
import {   ActionSheetController, AlertController, ToastController, NavController, NavParams } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  newUser = {
    login: '', 
    password:'', 
    firstName: '', 
    lastName: '', 
    langKey:'en', 
    email:''
  }
  repeatPassword:string;

  constructor(public navCtrl: NavController, 
    private restapiService: RestapiServiceProvider, 
    private actionSheetCtrl:ActionSheetController,
    private alertCtrl:AlertController,
    private toastCtrl:ToastController,
    private navParams:NavParams){
      console.log('apiurl: '+this.navParams.get('apiUrl'));
  }


  register(){
    if(!this.newUser.password.match(/\W/) || !this.newUser.password.match(/^([A-Z])/gi) || !this.newUser.password.match(/\d/)){
      this.showToast("Hasło musi być alfanumeryczne.");
    }
    else if(this.newUser.password.length >= 20 || this.newUser.password.length < 8){
      this.showToast("Hasło musi mieć 8-20 znaków.");
    }
    else if(this.newUser.password != this.repeatPassword){
      this.showToast("Podane hasła się nie zgadzają.");
    }
    else if(!this.newUser.login.match(/^([0-9]|[A-Z])/gi)){
      this.showToast("Podaj poprawny login.");
    }
    else if(this.newUser.login.length >= 20 || this.newUser.login.length < 8){
      this.showToast("Login musi mieć 8-20 znaków.");
    }
    else if(!this.newUser.email.match(/[@]/gi) || !this.newUser.email.match(/[.]/gi) || !this.newUser.email.match(/^([A-Z])/gi)){
      this.showToast("Podaj poprawny email.");
    }
    else if(!this.newUser.firstName.match(/^([A-Z])/gi) || this.newUser.firstName.match(/\d/) || this.newUser.firstName.match(/\W/)){
      this.showToast("Podaj poprawne imię.");
    }
    else if(!this.newUser.lastName.match(/^([A-Z])/gi) || this.newUser.lastName.match(/\d/) || this.newUser.lastName.match(/\W/)){
      this.showToast("Podaj poprawne nazwisko.");
    }
    else{
      this.restapiService.register(this.navParams.get('apiUrl'),this.newUser);
      this.showalert("Witaj "+this.newUser.firstName+".<br>Poczekaj na aktywację konta.");
    }
  }

  showalert(info:string) {
    const alert = this.alertCtrl.create({
      title: info,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            //this.startTask(data);
          }
        }
      ]
    });
    alert.present();
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
