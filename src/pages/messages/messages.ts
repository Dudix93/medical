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
      this.globalVars.pushMessage(new Message(
                                    msg.id,
                                    msg.title,
                                    msg.content,
                                    new Date(msg.sendDate).toLocaleDateString(),
                                    new Date(msg.sendDate).getHours().toString().concat(':'.concat(new Date(msg.sendDate).getMinutes().toString()))));
      this.storage.get('messages').then(msgs => {
        if(msgs == undefined) this.storage.set('messages',{});
        let messages = new Array<any>();
        console.log(messages);
      });
    }
    this.allMessages = this.globalVars.getMessages();
    for(let msg of this.allMessages){
      if(this.dates.indexOf(msg.date) == -1){
        this.dates.push(msg.date);
      }
    }
    this.dates.sort();
    this.dates.reverse();
    console.log(this.dates);
    console.log(this.allMessages);
  });

  this.restapiService.getMessages(null,false).then(nju =>{
    //console.log(nju);
  });

  this.restapiService.getMessages(null,true).then(old =>{
    //console.log(old);
  });
}

showMessage(id:number){
  //showalert
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
