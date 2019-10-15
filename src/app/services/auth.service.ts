import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseConfig } from '../interfaces/config';

import { Facebook } from '@ionic-native/facebook/ngx';
import { User } from "../interfaces/user";

import { BehaviorSubject } from "rxjs";
import firebase from "@firebase/app"; 
import "@firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public user: User;

  constructor(private platform: Platform, private zone: NgZone, private facebook: Facebook) {
   }

   init(): void{
     const firebaseConfig = FirebaseConfig;

     //Init firebase
     firebase.initializeApp(firebaseConfig);

     //Emit logged in status whenever auth state changes
     firebase.auth().onAuthStateChanged(firebaseUser => {
       this.zone.run(() => {
         if(firebaseUser){
           this.user = {
             uid: firebaseUser.uid,
             displayName: firebaseUser.displayName,
             displayPicture: firebaseUser.photoURL
           };

           this.loggedIn.next(true);
         } else {
           this.user = null;
           this.loggedIn.next(false);
         }
       });
     });
   }

   Login(): void{
     if(this.platform.is("capacitor")){
       this.NativeFacebookAuth();
     }else{
       this.BrowserFacebookAuth();
     }
   }

   async Logout(): Promise<void> {
     if(this.platform.is("capacitor")){
       try{
         await this.facebook.logout();
         await firebase.auth().signOut();
       }catch (err){
         console.log(err);
       }
     }else{
       try{
         await firebase.auth().signOut();
       }catch(err){
         console.log(err);
       }
     }
   }

   async NativeFacebookAuth(): Promise<void> {
     try{
       const response = await this.facebook.login(["public_profile", "email"]);

       console.log(response);

       if(response.authResponse){
         //User is signed-in Facebook.
         const unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
           unsubscribe();
           //Check if we're already signed in Firebase with correct user
           if(!this.IsUserEqual(response.authResponse, firebaseUser)){
             //Build Firebase credential with the Facebook auth token.
             const credential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
             //Sign in with the credential from the Facebook user.
             firebase.auth().signInWithCredential(credential).catch(error => {
               console.log(error);
             });
           } else{
             //User is already signed-in Firebase with the correct user
             console.log("Already signed in.");
           }
         });
       } else {
         //User is signed out of Facebook.
         firebase.auth().signOut();
       }
     } catch (err){
       console.log(err);
     }
   }

   async BrowserFacebookAuth(): Promise<void> {
     const provider = new firebase.auth.FacebookAuthProvider();

     try{
       const result = await firebase.auth().signInWithPopup(provider);
       console.log(result);
     } catch (err) {
       console.log(err);
     }
   }

   IsUserEqual(facebookAuthResponse, firebaseUser): boolean{
     if(firebaseUser){
       const providerData = firebaseUser.providerData;

       providerData.forEach(data => {
         if(data.providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID 
          && data.uid === facebookAuthResponse.userID){
            // We don't need to re-auth the Firebase connection.
            return true;
          }
       });
     }
     return false;
   }
}
