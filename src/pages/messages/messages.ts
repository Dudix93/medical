import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Storage } from '@ionic/storage';
import { Message } from '../../models/message'
import { GlobalVars } from '../../app/globalVars'

@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {

allMessages:Array<any>;
newMessages:Array<any>;
oldMessages:Array<any>;
allDates:Array<any>;
newDates:Array<any>;
oldDates:Array<any>;
sort:string = 'all';


  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private restapiService: RestapiServiceProvider,
              private alertCtrl: AlertController,
              private storage: Storage,
              private globalVars: GlobalVars) {
    this.getMessages();
  }

getMessages(){
  let allMsgs;
  this.allDates = new Array<any>();
  this.newDates = new Array<any>();
  this.oldDates = new Array<any>();

  this.storage.get('unreadMessages').then(unreadMsgs =>{
    this.globalVars.setNewMessages(unreadMsgs);
    this.storage.get('oldMessages').then(oldMsgs =>{
      this.globalVars.setOldMessages(oldMsgs)
      
      this.allMessages = this.globalVars.getNewMessages().concat(this.globalVars.getOldMessages());
      this.newMessages = this.globalVars.getNewMessages();
      this.oldMessages = this.globalVars.getOldMessages();
  
  
      for(let msg of this.allMessages){
        if(this.allDates.indexOf(msg.date) == -1){
          this.allDates.push(msg.date);
        }
      }
      for(let msg of this.newMessages){
        if(this.newDates.indexOf(msg.date) == -1){
          this.newDates.push(msg.date);
        }
      }
      for(let msg of this.oldMessages){
        if(this.oldDates.indexOf(msg.date) == -1){
          this.oldDates.push(msg.date);
        }
      }
  
      this.allDates.sort();
      this.allDates.reverse();
      this.newDates.sort();
      this.newDates.reverse();
      this.oldDates.sort();
      this.oldDates.reverse();
      console.log(this.oldDates);
      console.log("all "+this.allMessages);
      console.log("nowe "+this.newMessages);
      console.log("stare "+this.oldMessages);
    });
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

showMessage(id:number,title:string,message:string) {
  this.newMessages.forEach((msg,index) => {
    if(msg.id == id){
      this.globalVars.pushOldMessage(msg);
      this.oldMessages = this.globalVars.getOldMessages();
      this.newMessages.splice(index,1);
      this.storage.set('unreadMessages',this.newMessages);
      this.storage.set('oldMessages',this.oldMessages);
    }
  });
  const alert = this.alertCtrl.create({
    title: title,
    message: message,
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
