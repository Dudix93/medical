import { Component } from '@angular/core';
import {   ActionSheetController, AlertController, ToastController, NavController } from 'ionic-angular';
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
    private toastCtrl:ToastController){
  }

  register(){
    if(this.newUser.password != this.repeatPassword){
      this.showalert("Podane hasła się nie zgadzają.");
    }
    else{
      this.restapiService.register(this.newUser);
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

}
