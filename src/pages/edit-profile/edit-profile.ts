import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ActionSheetController, AlertController, ToastController, NavController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { User } from '../../models/user';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {
  user: Array<any>;
  new_password2:string;
  new_password:string;
  old_password:string;
  constructor(public navCtrl: NavController, 
    private restapiService: RestapiServiceProvider, 
    private storage:Storage,
    private actionSheetCtrl:ActionSheetController,
    private alertCtrl:AlertController,
    private toastCtrl:ToastController){
      this.storage.get('zalogowany_id').then((val) => {
        this.restapiService.getUser(val)
        .then(data => {
          this.user = new Array<any>();
          this.user.push(data);
        });
      });
  }

update(){
  if(this.old_password == undefined){
    this.restapiService.deleteUser(this.user[0].id);
    this.restapiService.saveUser(new User(
      this.user[0].login,
      this.user[0].name,
      this.user[0].password,
      this.user[0].projects,
      this.user[0].tasks
    ));
  }
}
}
