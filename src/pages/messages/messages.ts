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
dates:Array<any>;
sort:string = 'all';
newMessages:Array<any>;
oldMessages:Array<any>;


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
  this.dates = new Array<any>();
  this.restapiService.getMessages(null,null).then(data =>{
    allMsgs = data;
    for(let msg of allMsgs){
      console.log(msg);
      this.globalVars.pushMessage(new Message(
                                    msg.id,
                                    msg.title,
                                    msg.content,
                                    new Date(msg.sendDate).toLocaleDateString(),
                                    new Date(msg.sendDate).getHours().toString()
                                    .concat(':'
                                    .concat(new Date(msg.sendDate).getMinutes()<10?
                                    '0'.concat(new Date(msg.sendDate).getMinutes().toString())
                                    :''.concat(new Date(msg.sendDate).getMinutes().toString())))));
        this.globalVars.pushNewMessage(this.globalVars.getMessages()[this.globalVars.getMessages().length-1]);
    }
    this.allMessages = this.globalVars.getMessages();
    for(let msg of this.allMessages){
      if(this.dates.indexOf(msg.date) == -1){
        this.dates.push(msg.date);
      }
    }
    this.dates.sort();
    this.dates.reverse();
    this.newMessages = this.globalVars.getNewMessages();
    console.log(this.dates);
    console.log("all "+this.allMessages);
    console.log("nowe "+this.newMessages);
    console.log("stare "+this.oldMessages);
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
