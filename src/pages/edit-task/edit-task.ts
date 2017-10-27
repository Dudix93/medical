import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';

@Component({
  selector: 'page-edit-task',
  templateUrl: 'edit-task.html',
})
export class EditTaskPage {

  params = {task_title: 'aa', task_id:''}
  userTasks:any;
  task = {user_id: '', 
          task_id: '', 
          update_date:'', 
          update_hour:'', 
          update_time:'', 
          time_spent:'', 
          start_date:'', 
          start_hour:'',
          description:'', 
          finish_date:''}

  constructor(public navCtrl: NavController, public navParams:NavParams, private restapiService: RestapiServiceProvider, private storage: Storage) {
    this.params = this.navParams.get('params');
    console.log("parametry: "+this.navParams.get('params'));
  }

  getUserTask(task_id:number) {
    this.restapiService.getUserTask()
    .then(userTasks => {
      this.userTasks = userTasks;
      this.storage.get('zalogowany_id').then((user_id) => {
        for(let task of this.userTasks){
          if(user_id == task.user_id && task_id == task.task_id){
            this.task = task;
            console.log(this.task);
            break;
          }
        }
      });
    });
}

}
