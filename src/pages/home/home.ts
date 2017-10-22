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
  tmp = '';
  tasks: any;
  user: any;
  projects: any;
  task = {title: '', id:''}
  userProject = {project:'', userProjectTasks:new Array<any>()}
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
                this.userProject.project = userProject;
                for(let project of this.projects){
                  if(project.id == userProject){
                    //console.log(project);
                    this.userProject.project = project;
                    for(let userTask of this.user.tasks){
                      for(let projectTasks of project.tasks){
                        if(userTask == projectTasks){
                          this.userProject.userProjectTasks.push(userTask);
                          continue;
                        }
                      }
                    }
                    console.log(this.userProject.project);
                    console.log(this.userProject.userProjectTasks);
                    this.userProjects.push(this.userProject);
                    this.userProject.userProjectTasks.length = 0 ;
                  }
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
