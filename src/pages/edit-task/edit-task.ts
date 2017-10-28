import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';

@Component({
  selector: 'page-edit-task',
  templateUrl: 'edit-task.html',
})
export class EditTaskPage {

  params = {task_title: '', task_id:0}
  userTasks:any;
  updateTime:number;
  task = {user_id: '', 
          task_id: '', 
          update_date:'', 
          update_hour:'', 
          update_time:0, 
          time_spent:0, 
          start_date:'', 
          start_hour:'',
          description:'', 
          finish_date:''}

  constructor(public navCtrl: NavController, public navParams:NavParams, private restapiService: RestapiServiceProvider, private storage: Storage) {
    this.params.task_title = this.navParams.get('task_title');
    this.params.task_id = this.navParams.get('task_id');
    this.getUserTask(this.params.task_id);
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
  this.restapiService.deleteTask(this.task.task_id);
  this.task.time_spent += this.updateTime;
  this.task.update_time = this.updateTime;
  this.task.update_date = new Date().toLocaleDateString();
  this.task.update_hour = this.getHour();
  this.restapiService.saveTask(this.task);

}

}
