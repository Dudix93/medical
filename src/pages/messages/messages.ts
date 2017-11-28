import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {

allMessages:any;
sort:string = 'all';
newMessages:any;
oldMessages:any;
currentDate:any;
dates:Array<any>;


  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private restapiService: RestapiServiceProvider,
              private alertCtrl: AlertController) {
    this.getMessages();
  }

getMessages(){
  this.dates = new Array<any>();
  this.restapiService.getMessages(null,null).then(data =>{
    console.log(data);
    this.allMessages = data;
    for(let msg of this.allMessages){
      if(this.dates.indexOf(msg.date) == -1){
        this.dates.push(msg.date);
      }
    }
    console.log(this.dates);
  });

  this.restapiService.getMessages(null,false).then(nju =>{
    console.log(nju);
    this.newMessages = nju;
  });

  this.restapiService.getMessages(null,true).then(old =>{
    console.log(old);
    this.oldMessages = old;
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
