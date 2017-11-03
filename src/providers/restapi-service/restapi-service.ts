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

  get(apiUrl,resource,id,headers):Promise<any>{
    console.log(apiUrl);
    if(id == null){
      console.log("nie ma id");
      return new Promise(resolve => {
        this.http.get(apiUrl+'/'+resource)
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
    });
    }
    else{
      console.log("jest id");
      return new Promise(resolve => {
        this.http.get(apiUrl+'/'+resource+'/'+id)
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
    });
    }
  }

  post(apiUrl,resource,data,headers):Promise<any>{
    return new Promise((resolve, reject) => {
        this.http.post(apiUrl+'/'+resource+'/',data,headers)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  delete(apiUrl,resource,id):Promise<any>{
    return new Promise((resolve, reject) => {
        this.http.delete(apiUrl+'/'+resource+'/',id)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  headers():RequestOptions{
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    return new RequestOptions({headers:headers});
  }

  getApiUrl():string {
    if(this.storage.get('apiUrl')!=null){
      this.storage.get('apiUrl').then((value) => {
        return value;
      });
    }
    else return null;
  }

  getUserId():string {
    if(this.storage.get('zalogowany_id')!=null){
      this.storage.get('zalogowany_id').then((value) => {
        return value;
      });
    }
    else return null;
  }

  getUsers() {
    //this.get(this.getApiUrl,"users",null,this.headers);
    return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
        //console.log(value);
        this.http.get(value+'/users',this.headers())
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
      });
    });
  }

  getUser(id:number) {
    //this.get(this.getApiUrl,"users",id,this.headers);
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
        this.http.get(value+'/preferences',this.headers())
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
        this.http.get(value+'/userTask',this.headers())
        .map(res => res.json())
        .subscribe(data => {
         this.data = data;
         resolve(this.data);
        });
       });
    });
  }

  getTasks() {
     return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
      //console.log(options);
      this.http.get(value+'/tasks',this.headers())
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

  getDayTask() {
    return new Promise(resolve => {
      this.storage.get('apiUrl').then((value) => {
        this.http.get(value+'/dayTask',this.headers())
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        });
      });
    });
  }

  saveDayTask(data) {
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.post(value+'/dayTask', data,this.headers())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    });
  }

  deleteDayTask(id) {
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.delete(value+'/dayTask/'+id,this.headers())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    });
  }

  updateDayTask(id,data) {
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.put(value+'/dayTask/'+id, data, this.headers())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    });
  }

  saveUserTask(data) {
    //console.log(JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.post(value+'/userTask', data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    });
  }

  updateUserTask(id,data) {
    //console.log(JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.put(value+'/userTask/'+id, data, this.headers())
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
        this.http.delete(value+'/tasks/'+data,this.headers())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    });
  }

  deleteUserTask(data){
    //console.log(data);
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.delete(value+'/userTask/'+data,this.headers())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
      });
    });
  }

  saveUser(data) {
    console.log(JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.post(value+'/users', data)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });  
      });
    });
  }

  updateUser(id,data) {
    //console.log(JSON.stringify(data));
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.put(value+'/users/'+id, data, this.headers())
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

  deleteUser(data){
    console.log(data);
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((value) => {
        this.http.delete(value+'/users/'+data)
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

  startTask(user,task){
    console.log(user);
    return new Promise((resolve, reject) => {
      this.storage.get('apiUrl').then((apiUrl) => {
        this.storage.get('zalogowany_id').then((id) => {
          this.updateUser(id,user)
          this.saveUserTask(task);
          }); 
      });
    });
  }
}
