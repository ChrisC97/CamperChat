import { Component, OnInit } from '@angular/core';
import { MenuController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private loading;

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    await this.ShowLoading();

    this.authService.loggedIn.subscribe(status => {
      this.loading.dismiss();

      if(status){
        this.menu.enable(true);
        this.navCtrl.navigateForward("/home");
      }
    });
  }

  ionViewDidEnter(){
    this.menu.enable(false);
  }

  Login(){
    this.ShowLoading();
    this.authService.Login();
  }

  async ShowLoading(){
    this.loading = await this.loadingCtrl.create({
      message: "Authenticating..."
    });
    this.loading.present();
  }
}
