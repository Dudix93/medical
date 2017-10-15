import { Injectable } from '@angular/core';
import { Response, RequestOptions, Headers, Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class RestapiServiceProvider {

  data:any;
  apiUrl = 'http://localhost:3000';
  //apiUrl = 'https://my-json-server.typicode.com/Dudix93/raportowanie';
  //apiUrl = 'https://jsonplaceholder.typicode.com';
  constructor(public http: Http) {}

  getUsers() {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let options = new RequestOptions({headers:headers});

    // if (this.data) {
    //   return Promise.resolve(this.data);
    // }

    return new Promise(resolve => {
      console.log(options);
      this.http.get(this.apiUrl+'/users',options)
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  saveUser(data) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let options = new RequestOptions({ headers: headers});
    console.log(JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl+'/users', data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }
}
