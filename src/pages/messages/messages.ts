import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Storage } from '@ionic/storage';
import { Message } from '../../models/message'
import { MsgId } from '../../models/msgId'
import { GlobalVars } from '../../app/globalVars'

@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {

allMessages:Array<any>;
newMessages:Array<any>;
oldMessages:Array<any>;
deletedMessages:Array<any>;
allDates:Array<any>;
newDates:Array<any>;
oldDates:Array<any>;
sort:string = 'all';
msgsIds:Array<any>;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private restapiService: RestapiServiceProvider,
              private alertCtrl: AlertController,
              private storage: Storage,
              private globalVars: GlobalVars) {
    this.getMessages();
  }

  deleteMessagesPrompt() {
    let amount = 0;
    this.msgsIds.forEach(msg=>{
      if(msg.checked == true) amount++;
    });

    if(amount > 0){
      const alert = this.alertCtrl.create({
        title: 'Usunąć wybrane wiadomości('+amount+')?',
        buttons: [
          {
            text: 'Anuluj',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Usuń',
            handler: () => {
              this.deleteMsgs();
            }
          }
        ]
      });
      alert.present();
    }
  }

  deleteMsgs(){
    this.storage.get('deletedMessages').then(data=>{
      if(data == null || data == undefined) this.deletedMessages = new Array<any>();
      else this.deletedMessages = data;
    }).then(()=>{
      this.msgsIds.forEach(msgId=>{
        if(msgId.checked == true){
          for(let msg of this.allMessages){
            if(msg.id == msgId.id){
              this.allMessages.splice(this.allMessages.indexOf(msg),1);
              this.deletedMessages.push(msg.id);
              break;
            }
          }
          for(let msg of this.oldMessages){
            if(msg.id == msgId.id){
              this.oldMessages.splice(this.oldMessages.indexOf(msg),1);
              break;
            }
          }
          for(let msg of this.newMessages){
            if(msg.id == msgId.id){
              this.newMessages.splice(this.newMessages.indexOf(msg),1);
              break;
            }
          }
          this.storage.set('unreadMessages',this.newMessages);
          this.storage.set('oldMessages',this.oldMessages);
          this.storage.set('deletedMessages',this.deletedMessages);
        }
      });
      this.getMessages();
      console.log(JSON.stringify(this.deletedMessages));
    });
  }

getMessages(){
  let allMsgs;
  this.allDates = new Array<any>();
  this.newDates = new Array<any>();
  this.oldDates = new Array<any>();
  this.msgsIds = new Array<any>();
  this.newMessages = new Array<any>();
  this.oldMessages = new Array<any>();
  this.allMessages = new Array<any>();

  this.storage.get('unreadMessages').then(unreadMsgs =>{
    this.globalVars.setNewMessages(unreadMsgs);
    this.storage.get('oldMessages').then(oldMsgs =>{
      this.globalVars.setOldMessages(oldMsgs)
      
  
      this.globalVars.getNewMessages().forEach(msg=>{
        if(msg.userId == this.globalVars.getUser().id){
          this.allMessages.push(msg);
          this.newMessages.push(msg);
          this.msgsIds.push(new MsgId(msg.id,false));
        }
      });

      this.globalVars.getOldMessages().forEach(msg=>{
        if(msg.userId == this.globalVars.getUser().id){
          this.allMessages.push(msg);
          this.oldMessages.push(msg);
          this.msgsIds.push(new MsgId(msg.id,false));
        }
      });

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
      //this.msgsIds.forEach(el=>{console.log("ids "+JSON.stringify(el))});
      console.log(this.msgsIds);
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
  //this.getMessages();
}

}
