import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Response, Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class RestapiServiceProvider {

  data:any;
  apiUrl:string;
  //apiUrl = 'http://localhost:3000';
  //apiUrl = 'https://projekt-3d99e.firebaseio.com';
  //apiUrl = 'https://my-json-server.typicode.com/Dudix93/raportowanie';
  constructor(public http: Http, public storage:Storage){

  }

  // setApiUrl(){
  //   //this.apiUrl = 'http://localhost:3000';
  //   this.storage.get('apiUrl').then((value) => {
  //     this.apiUrl = value;
  //     console.log(this.apiUrl);
  //   });
  // }

  getUsers() {
    return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
        //console.log(value);
        this.http.get(value+'/users')
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
      });
    });
  }

  getUser(id:number) {
    return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
        //console.log(value);
        this.http.get(value+'/users/'+id)
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
      });
    });
  }

  getUserPreferences() {
    return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
        //console.log(options);
        this.http.get(value+'/preferences')
        .map(res => res.json())
        .subscribe(data => {
         this.data = data;
         resolve(this.data);
        });
       });
    });
  }

  getUserTask() {
    return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
        //console.log(options);
        this.http.get(value+'/userTask')
        .map(res => res.json())
        .subscribe(data => {
         this.data = data;
         resolve(this.data);
        });
       });
    });
  }

  getTasks() {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let options = new RequestOptions({headers:headers});

    return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
      //console.log(options);
      this.http.get(value+'/tasks',options)
      .map(res => res.json())
      .subscribe(data => {
        this.data = data;
        resolve(this.data);
      });
       });
    });
  }

  getProjects() {
    return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
        //console.log(value);
        this.http.get(value+'/projects')
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
      });
    });
  }

  saveTask(data) {
    console.log(JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.post(value+'/tasks', data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    });
  }

  deleteTask(data){
    console.log(data);
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.delete(value+'/tasks/'+data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    });
  }

  saveUserPreferences(data) {
    console.log(JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.post(value+'/preferences', data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });  
      });
    });
  }

  deleteUserPreferences(data){
    console.log(data);
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.delete(value+'/preferences/'+data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });  
      });
    });
  }
}
