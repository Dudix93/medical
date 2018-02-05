import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ActionSheetController, AlertController, ToastController, NavController, Events } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { User } from '../../models/user';
import { GlobalVars} from '../../app/globalVars'

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {
  user:any;
  new_password2:string;
  new_password:string;
  old_password:string;
  constructor(public navCtrl: NavController, 
    private restapiService: RestapiServiceProvider, 
    private storage:Storage,
    private actionSheetCtrl:ActionSheetController,
    private alertCtrl:AlertController,
    private toastCtrl:ToastController,
    private globalVars:GlobalVars,
    private events:Events){
      this.user = this.globalVars.getUser();
      console.log(this.user);
  }

update(){
  this.storage.get('zalogowany').then(zalogowany=>{
    if(this.old_password == zalogowany.password && (this.new_password == undefined || this.new_password2 == undefined)){
      this.restapiService.updateUser(this.globalVars.getUser().id,this.globalVars.getUser()).then(()=>{
        this.events.publish('updateUserData');
      });
      this.showalert("Zaktualizowano dane.");
    }
      else if((this.new_password == this.new_password2) && this.old_password == zalogowany.password && this.old_password != undefined && this.new_password != null && this.new_password2 != null && this.new_password != undefined && this.new_password2 != undefined){
        this.restapiService.updateUser(this.globalVars.getUser().id,this.globalVars.getUser()).then(()=>{
          this.restapiService.updateUserPassword(this.new_password);
          this.events.publish('updateUserData');
        });
        this.showalert("Zaktualizowano dane.");
      }
      else if(this.old_password != zalogowany.password && (this.new_password == undefined || this.new_password2 == undefined)){
        this.showalert("Podaj aktualne hasło.");
      }
      else if((this.old_password != zalogowany.password) && (this.new_password == this.new_password2)){
        this.showalert("To nie jest aktualne hasło.");
      }
      else if((this.old_password == zalogowany.password) && (this.new_password != this.new_password2)){
        this.showalert("Nowe hasła się nie zgadzają.");
      }
      else if((this.old_password != zalogowany.password) && (this.new_password != this.new_password2)){
        this.showalert("To nie jest aktualne hasło.<br><br>Nowe hasła się nie zgadzają.");
      }     
  });
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
