import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { UserProject } from '../../models/userProject';
import { UserTask } from '../../models/userTask';
import { UpdateDayTask } from '../../models/updateDayTask';
import { EditTaskPage } from '../../pages/edit-task/edit-task';
@IonicPage()
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {
  selectedProject:any = null;
  selectedTask:any = null;
  user: Array<any>;
  userProjects:Array<any>;
  userProjectTasks:Array<any>;
  dayTasks:Array<any>;
  updateDayTask:Array<any>;
  projects: any;
  tasks: any;
  userTasks: any;
  allDayTasks: any;
  project:any;
  allEditedTask:any;
  alreadyEdited:boolean = false;
  taskToEdit = {
    date:'',
    task_id:0,
    user_id:0,
    time:0,
    description:''
  }
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storage: Storage,
              public restapiService: RestapiServiceProvider,
              public alertCtrl:AlertController,) {
                //this.getUserProjectsAndTasks();
  }


  addDayTaskToUpdate(date:string,task_id:number,user_id:number,time:number,description:string){
    this.taskToEdit.date = date;
    this.taskToEdit.task_id = task_id;
    this.taskToEdit.user_id = user_id;
    this.taskToEdit.time = time;
    this.taskToEdit.description =description;
    this.navCtrl.push(EditTaskPage,this.taskToEdit);
  }

  // updateTimePrompt(task_title:string, date:string, time:number) {
  //   const alert = this.alertCtrl.create({
  //     title: 'Edytujesz '+task_title+'<br>'+'z dnia '+date,
  //     inputs: [
  //       {
  //         name: 'time',
  //         value: time.toString()
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Anuluj',
  //         role: 'cancel',
  //         handler: () => {
  //         }
  //       },
  //       {
  //         text: 'OK',
  //         handler: () => {
  //           this.addDayTaskToUpdate();
  //         }
  //       }
  //     ]
  //   });
  //   alert.present();
  // }

}
