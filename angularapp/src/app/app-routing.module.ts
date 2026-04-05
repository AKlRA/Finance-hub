import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserhomeComponent } from './components/userhome/userhome.component';
import { AuthguardComponent } from './components/authguard/authguard.component'; // KEEP THIS
import { AdminhomeComponent } from './components/adminhome/adminhome.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { AdminviewfeedbackComponent } from './components/adminviewfeedback/adminviewfeedback.component';
import { CreatesavingsplanComponent } from './components/createsavingsplan/createsavingsplan.component';
import { ManagereditenquiryComponent } from './components/managereditenquiry/managereditenquiry.component';
import { ManagereditsavingsplanComponent } from './components/managereditsavingsplan/managereditsavingsplan.component';
import { ManagerviewapplicationformComponent } from './components/managerviewapplicationform/managerviewapplicationform.component';
import { ManagerviewenquiriesComponent } from './components/managerviewenquiries/managerviewenquiries.component';
import { UseraddenquiryComponent } from './components/useraddenquiry/useraddenquiry.component';
import { UseraddfeedbackComponent } from './components/useraddfeedback/useraddfeedback.component';
import { UserappliedplansComponent } from './components/userappliedplans/userappliedplans.component';
import { UserplanapplicationformComponent } from './components/userplanapplicationform/userplanapplicationform.component';
import { UserviewenquiryComponent } from './components/userviewenquiry/userviewenquiry.component';
import { UserviewfeedbackComponent } from './components/userviewfeedback/userviewfeedback.component';
import { UserviewsavingsplanComponent } from './components/userviewsavingsplan/userviewsavingsplan.component';
import { ViewsavingsplanComponent } from './components/viewsavingsplan/viewsavingsplan.component';
import { ErrorComponent } from './components/error/error.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },

  { path: 'user/view-savings-plan', component: UserviewsavingsplanComponent, canActivate: [AuthguardComponent] },
  { path: 'user/apply-plan/:id', component: UserplanapplicationformComponent, canActivate: [AuthguardComponent] },
  { path: 'user/applied-plans', component: UserappliedplansComponent, canActivate: [AuthguardComponent] },
  { path: 'user/add-enquiry', component: UseraddenquiryComponent, canActivate: [AuthguardComponent] },
  { path: 'user/view-enquiry', component: UserviewenquiryComponent, canActivate: [AuthguardComponent] },
  { path: 'user/add-feedback', component: UseraddfeedbackComponent, canActivate: [AuthguardComponent] },
  { path: 'user/view-feedback', component: UserviewfeedbackComponent, canActivate: [AuthguardComponent] },
  { path: 'user/dashboard', component: UserhomeComponent, canActivate: [AuthguardComponent] },

  { path: 'manager/dashboard', component: AdminhomeComponent, canActivate: [AuthguardComponent] },
  { path: 'manager/create-savings-plan', component: CreatesavingsplanComponent, canActivate: [AuthguardComponent] },
  { path: 'manager/view-savings-plan', component: ViewsavingsplanComponent, canActivate: [AuthguardComponent] },
  { path: 'manager/edit-savings-plan/:id', component: ManagereditsavingsplanComponent, canActivate: [AuthguardComponent] },
  { path: 'manager/view-application-form', component: ManagerviewapplicationformComponent, canActivate: [AuthguardComponent] },
  { path: 'manager/view-enquiries', component: ManagerviewenquiriesComponent, canActivate: [AuthguardComponent] },
  { path: 'manager/edit-enquiry/:id', component: ManagereditenquiryComponent, canActivate: [AuthguardComponent] },
  { path: 'manager/view-feedback', component: AdminviewfeedbackComponent, canActivate: [AuthguardComponent] },

  { path: 'user/profile',    component: ProfileComponent, canActivate: [AuthguardComponent] },
  { path: 'manager/profile', component: ProfileComponent, canActivate: [AuthguardComponent] },
  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    onSameUrlNavigation: 'reload' // Crucial for triggering NavigationEnd again
  })],
  exports: [RouterModule]
})



export class AppRoutingModule { }