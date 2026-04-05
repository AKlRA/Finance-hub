import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminnavComponent } from './components/adminnav/adminnav.component';
import { AdminviewfeedbackComponent } from './components/adminviewfeedback/adminviewfeedback.component';
import { CreatesavingsplanComponent } from './components/createsavingsplan/createsavingsplan.component';
import { ErrorComponent } from './components/error/error.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ManagereditsavingsplanComponent } from './components/managereditsavingsplan/managereditsavingsplan.component';
import { ManagerviewapplicationformComponent } from './components/managerviewapplicationform/managerviewapplicationform.component';
import { ManagerviewenquiriesComponent } from './components/managerviewenquiries/managerviewenquiries.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { UseraddenquiryComponent } from './components/useraddenquiry/useraddenquiry.component';
import { UseraddfeedbackComponent } from './components/useraddfeedback/useraddfeedback.component';
import { UserappliedplansComponent } from './components/userappliedplans/userappliedplans.component';
import { UsernavComponent } from './components/usernav/usernav.component';
import { UserplanapplicationformComponent } from './components/userplanapplicationform/userplanapplicationform.component';
import { UserviewenquiryComponent } from './components/userviewenquiry/userviewenquiry.component';
import { UserviewfeedbackComponent } from './components/userviewfeedback/userviewfeedback.component';
import { UserviewsavingsplanComponent } from './components/userviewsavingsplan/userviewsavingsplan.component';
import { ViewsavingsplanComponent } from './components/viewsavingsplan/viewsavingsplan.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ManagereditenquiryComponent } from './components/managereditenquiry/managereditenquiry.component';
import { AdminhomeComponent } from './components/adminhome/adminhome.component';
import { UserhomeComponent } from './components/userhome/userhome.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ProfileComponent } from './components/profile/profile.component';
 
@NgModule({
  declarations: [
    AppComponent,
    AdminnavComponent,
    AdminviewfeedbackComponent,
    CreatesavingsplanComponent,
    ErrorComponent,
    HomeComponent,
    LoginComponent,
    ManagereditenquiryComponent,
    ManagereditsavingsplanComponent,
    ManagerviewapplicationformComponent,
    ManagerviewenquiriesComponent,
    NavbarComponent,
    RegistrationComponent,
    UseraddenquiryComponent,
    UseraddfeedbackComponent,
    UserappliedplansComponent,
    UsernavComponent,
    UserplanapplicationformComponent,
    UserviewenquiryComponent,
    UserviewfeedbackComponent,
    UserviewsavingsplanComponent,
    ViewsavingsplanComponent,
    AdminhomeComponent,
    UserhomeComponent,
    ChatbotComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
