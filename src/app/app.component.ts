import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';

import { MenuController } from '@ionic/angular';
import { AuthService } from "./services/auth.service";
import { DataService } from "./services/data.service";

const { SplashScreen, StatusBar } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private menu: MenuController,
    private authService: AuthService,
    private dataService: DataService
  ) {
    this.authService.init();
    this.dataService.init();

    SplashScreen.hide().catch(err => {
      console.warn(err);
    });

    StatusBar.hide().catch(err =>{
      console.warn(err);
    });
    
    this.initializeApp();
  }

  async Logout(){
    await this.menu.close();
    this.authService.Logout();
  }

  initializeApp() {
    this.platform.ready().then(() => {

    });
  }
}
