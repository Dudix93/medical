import { Injectable } from '@angular/core';
import { Response, Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class RestapiServiceProvider {

  data:any;
  apiUrl = 'http://localhost:3000';
  //apiUrl = 'https://my-json-server.typicode.com/Dudix93/raportowanie';
  constructor(public http: Http) {}

  getUsers() {
    return new Promise(resolve => {
      //console.log(options);
      this.http.get(this.apiUrl+'/users')
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  getTasks() {
    // let headers = new Headers();
    // headers.append('Accept', 'application/json');
    // headers.append('Content-Type', 'application/json');
    // headers.append('Access-Control-Allow-Origin', '*');
    // headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // let options = new RequestOptions({headers:headers});

    // if (this.data) {
    //   return Promise.resolve(this.data);
    // }

    return new Promise(resolve => {
      //console.log(options);
      this.http.get(this.apiUrl+'/tasks')
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  saveTask(data) {
    console.log(JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl+'/tasks', data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  deleteTask(data){
    console.log(data);
    return new Promise((resolve, reject) => {
      this.http.delete(this.apiUrl+'/tasks/'+data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }
}
