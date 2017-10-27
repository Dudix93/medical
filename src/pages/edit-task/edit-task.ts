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
    this.params.task_title = this.navParams.get('task_title');
    this.params.task_id = this.navParams.get('task_id');
    console.log("title: "+this.navParams.get('task_title'));
    console.log("id: "+this.navParams.get('task_id'));
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
