import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {
  MatCardModule,
  MatDialogModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatInputModule,
  MatProgressBarModule
} from '@angular/material'

import { environment } from '../environments/environment';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SuperSecretComponent } from './account/super-secret/super-secret.component';
import { SubscriberPageComponent } from './account/subscriber-page/subscriber-page.component';
import { AccountComponent } from './account/account.component';

import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SuperSecretComponent,
    SubscriberPageComponent,
    NavbarComponent,
    FooterComponent,
    AccountComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpModule,
    CoreModule,
    MatCardModule,
    MatDialogModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatListModule,
    MatInputModule,
    MatProgressBarModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule { }
