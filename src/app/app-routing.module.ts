import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerDetailsComponent } from './components/customer-details/customer-details.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { CreateInvoiceComponent } from './components/create-invoice/create-invoice.component';

const routes: Routes = [
  { path: '', redirectTo: 'create-invoice', pathMatch: 'full' },
  { path: 'create-invoice', component: CreateInvoiceComponent },
  { path: 'invoice-list', component: InvoiceListComponent },
  { path: 'customer-details/:id', component: CustomerDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
