import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { RestapiServiceProvider } from '../../providers/restapi-service/restapi-service';
import { LoginPage } from '../login/login';
import { PreferencesPage } from '../preferences/preferences';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  tmp = new Array<any>();
  tasks: any;
  user: any;
  projects: any;
  task = {title: '', id:''}
  userProject = {project:new Array<any>(), userProjectTasks:new Array<any>()}
  login:string;
  userProjects = new Array<any>()
  constructor(public navCtrl: NavController, public restapiService: RestapiServiceProvider, public storage:Storage) {
    this.storage.get('zalogowany').then((val) => {
      this.login = val;
    });
    this.getUserProjects();
  }

  getUserProjects() {
    this.storage.get('zalogowany_id').then((val) => {
      this.restapiService.getUser(val)
      .then(data => {
        this.user = data;
          this.restapiService.getProjects()
          .then(data => {
            this.projects = data;
            this.restapiService.getTasks()
            .then(data => {
              this.tasks = data;
              for(let userProject of this.user.projects){
                for(let project of this.projects){
                  if(project.id == userProject){
                    this.tmp.push(project);
                    this.userProject.project = this.tmp;
                    console.log(this.tmp);
                    this.userProjects.push(this.userProject);
                    // for(let userTask of this.user.tasks){
                    //   for(let projectTasks of project.tasks){
                    //     if(userTask == projectTasks){
                    //       this.userProject.userProjectTasks.push(userTask);
                    //     }
                    //   }
                    // }
                  }
                  this.userProject.project.length=0;
                }
              }
              console.log(this.userProjects);
            });
          });
      });
    });
  }

  getTasks() {
      this.restapiService.getTasks()
      .then(data => {
        this.tasks = data;
      });
  }

  saveTask() {
    this.restapiService.saveTask(this.task).then((result) => {
      console.log(this.task);
      this.getTasks();
    }, (err) => {
      console.log(err);
    });
  }

  deleteTask(id:String) {
    this.restapiService.deleteTask(id).then((result) => {
      console.log(result);
      this.getTasks();
    }, (err) => {
      console.log(err);
    });
  }

  logout(){
    this.storage.set('zalogowany', null);
    this.storage.set('zalogowany_id', null);
    this.navCtrl.push(LoginPage);
  }

  preferences(){
    this.navCtrl.push(PreferencesPage);
  }
}
