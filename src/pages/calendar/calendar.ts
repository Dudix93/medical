import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { UserProject } from '../../models/userProject';
import { UserTask } from '../../models/userTask';
import { DayTask } from '../../models/dayTask';
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
                this.getUserProjectsAndTasks();
  }

  getUserProjectsAndTasks() {
    this.storage.get('zalogowany_id').then((val) => {
      this.restapiService.getUser(val)
      .then(data => {
        this.user = new Array<any>();
        this.user.push(data);
          this.restapiService.getProjects()
          .then(data => {
            this.projects = data;
            this.restapiService.getTasks()
            .then(data => {
              this.tasks = data;
              this.restapiService.getUserTask()
              .then(data => {
                this.userTasks = data;
                this.restapiService.getDayTask()
                .then(data => {
                  this.allDayTasks = data;
                  this.restapiService.getAllDayTaskUpdate()
                  .then(data => {
                    this.allEditedTask = data;
                    this.userProjects = new Array<any>();
                    if(this.user[0].projects != null){
                      for(let userProject of this.user[0].projects){
                        this.userProjectTasks = new Array<any>();
                        for(let project of this.projects){
                          if(project.id == userProject){
                            this.project = project;

                              for(let userTask of this.userTasks){
                                for(let projectTasks of project.tasks){
                                  if(userTask.finish_date == null){
                                    this.storage.set('current_task_id', userTask.task_id);
                                    this.storage.set('current_task_title', userTask.task_title);
                                  }
                                  if(userTask.task_id == projectTasks){
                                    this.dayTasks = new Array<any>();
                                    for(let dayTask of this.allDayTasks){
                                      if(dayTask.user_id == userTask.user_id && dayTask.task_id == userTask.task_id){
                                        this.alreadyEdited = false;
                                        for(let et of this.allEditedTask){
                                          if(dayTask.user_id == et.user_id && dayTask.task_id == et.task_id && dayTask.date == et.date){
                                            this.dayTasks.push(new DayTask(dayTask.task_id,dayTask.user_id,dayTask.date,dayTask.time_spent,et.time,et.description));
                                            this.alreadyEdited = true;
                                            continue;
                                          }
                                        }
                                        if(this.alreadyEdited == false){
                                          this.dayTasks.push(new DayTask(dayTask.task_id,dayTask.user_id,dayTask.date,dayTask.time_spent,null,null));
                                        }
                                      }
                                    }
                                    this.userProjectTasks.push(new UserTask(userTask.user_id,userTask.task_id,userTask.task_title,this.dayTasks));
                                    continue;
                                  }
                                }
                            }
                          
                          this.userProjects.push(new UserProject(project.id,project.title,this.userProjectTasks));
                        //console.log(this.userProjects);
                        }
                      }
                    }
                  }
                  else this.projects = null;
                  });
                });
              });
            });
          });
      });
    });
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
