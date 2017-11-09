import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';

@Component({
  selector: 'page-edit-task',
  templateUrl: 'edit-task.html',
})
export class EditTaskPage {

  params = {task_title: '', task_id:0}
  userTasks:any;
  updateTime:string;
  dayTasksObjects:any;
  dayTasks: Array<number>;

  dayTask = {id:0,
  task_id:0,
  user_id:0,
  date:'',
  hour:'',
  time_spent:0}
  
  task = {
    id:0,
    user_id: '', 
    task_id: '',
    task_title:'', 
    update_date:'', 
    update_hour:'', 
    update_time:0, 
    time_spent:0, 
    start_date:'', 
    start_hour:'',
    description:'',
    latest_dayTask:0, 
    finish_date:'',
    finish_hour:''}

  constructor(public navCtrl: NavController, 
              public navParams:NavParams, 
              private restapiService: RestapiServiceProvider, 
              private storage: Storage,
              private alertCtrl: AlertController) {
    this.params.task_title = this.navParams.get('task_title');
    this.params.task_id = this.navParams.get('task_id');
    this.getUserTask(this.params.task_id);
    //console.log(this.task);
  }

  getHour(){
    var minutes = new Date().getMinutes();
    if(minutes < 10){
      return JSON.stringify(new Date().getHours()).concat(':0').concat(JSON.stringify(new Date().getMinutes()));
    }
    else{
      return JSON.stringify(new Date().getHours()).concat(':').concat(JSON.stringify(new Date().getMinutes()));
    }
  }

  getUserTask(task_id:number) {
    this.restapiService.getUserTask()
    .then(userTasks => {
      this.userTasks = userTasks;
      this.storage.get('zalogowany_id').then((user_id) => {
        for(let task of this.userTasks){
          //console.log(task);
          if(user_id == task.user_id && task_id == task.task_id){
            this.task = task;
            break;
          }
        }
      });
    });
}

updateTask(){
  if(this.updateTime != undefined && this.updateTime != '' && isNaN(Number(this.updateTime)) == true){
    this.showalert("Wpisz liczbę!");
  }
  else if(this.updateTime != undefined && this.updateTime != '' && Number(this.updateTime) !== parseInt(this.updateTime, 10)){
    this.showalert("Wpisz pełną godzine!");
  }
  else{
    if(this.updateTime != undefined && this.updateTime != ''){
      this.task.time_spent += Number(this.updateTime);
      this.task.update_time = Number(this.updateTime);
  
      this.dayTask.date = new Date().toLocaleDateString();
      this.dayTask.hour = this.getHour();
      this.dayTask.time_spent = this.task.time_spent;
      this.dayTask.task_id = Number(this.task.task_id);
      this.dayTask.user_id = Number(this.task.user_id);
      console.log(this.task);
      console.log("update time: "+this.task.update_date);
      if(this.task.update_date == new Date().toLocaleDateString() || this.task.update_date == null){
        console.log("update: "+this.task.latest_dayTask);
        this.restapiService.updateDayTask(this.task.latest_dayTask, this.dayTask);
      }
      else{
        this.restapiService.saveDayTask(this.dayTask);
      }
  
      this.task.update_date = new Date().toLocaleDateString();
      this.task.update_hour = this.getHour();
      //console.log("task id: "+this.task.task_id);
      this.restapiService.getLatestDayTask(Number(this.task.task_id)).then(data => {
        this.dayTasks = new Array<number>();
        this.dayTasksObjects = data;
        //console.log(data);
        for(let dayTask of this.dayTasksObjects){
          this.task.latest_dayTask = dayTask.id;
          //console.log(dayTask.id);
          break;
        }
        //console.log("date "+this.task.update_date+" hour "+this.task.update_hour+" time "+this.task.update_time+" latest_dayTask "+this.task.latest_dayTask);
        this.restapiService.updateUserTask(this.task.id,this.task);
        this.getUserTask(this.params.task_id);
        this.showalert("Zaktualizowano.");
      });
    }
    else{
      this.restapiService.updateUserTask(this.task.id,this.task);
      this.getUserTask(this.params.task_id);
      this.showalert("Zaktualizowano.");
    } 
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
