import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { PreferencesPage } from '../pages/preferences/preferences';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { EditTaskPage } from '../pages/edit-task/edit-task';
import { CalendarPage } from '../pages/calendar/calendar';
import { MessagesPage } from '../pages/messages/messages';
import { RestapiServiceProvider } from '../providers/restapi-service/restapi-service';
import { LocalNotifications} from '@ionic-native/local-notifications'
import {GlobalVars} from '../app/globalVars'

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': 'raport123'
  },
  'push': {
    'sender_id': '160370676742',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    PreferencesPage,
    EditProfilePage,
    EditTaskPage,
    CalendarPage,
    MessagesPage
  ],
  imports: [
    IonicStorageModule.forRoot(),
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    CloudModule.forRoot(cloudSettings)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    PreferencesPage,
    EditProfilePage,
    EditTaskPage,
    CalendarPage,
    MessagesPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    RestapiServiceProvider,
    LocalNotifications,
    GlobalVars
  ]
})
export class AppModule {}
