import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { AdminComponent } from './account/admin/admin.component';

import { AdminGuard } from './core/admin.guard';
import { VolunteerGuard } from './core/volunteer.guard';
import { CanReadGuard } from './core/can-read.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'account/admin', component: AdminComponent, canActivate: [AdminGuard] },
  // { path: 'schedule/add', component: AddVideoComponent },
  // { path: 'schedule/edit/:id', component: EditVideoComponent, canActivate: [EditorGuard] },
  { path: '*', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
