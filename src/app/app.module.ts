import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomerDetailsComponent } from './components/customer-details/customer-details.component';
import { CreateInvoiceComponent } from './components/create-invoice/create-invoice.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';

const firebaseConfig = {
  apiKey: "AIzaSyB8CwTyVqWYg6APVeBLKKfEs8NotlPfvvE",
  authDomain: "test-98f0a.firebaseapp.com",
  projectId: "test-98f0a",
  storageBucket: "test-98f0a.appspot.com",
  messagingSenderId: "792119272884",
  appId: "1:792119272884:web:4b49f9fe7eb8657d57fee1"
};

@NgModule({
  declarations: [
    AppComponent,
    CustomerDetailsComponent,
    CreateInvoiceComponent,
    InvoiceListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
