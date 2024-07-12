import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class MasterService {

  latestInvoiceNumber: number = 0;

  constructor(private angularFirestore: AngularFirestore) {
    this.getLatestInvoiceNumber();
  }

  // Add-Product
  addProduct(product: any) {
    const id = this.angularFirestore.createId();
    product.id = id;
    product.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    return this.angularFirestore.collection('/Products').doc(id).set(product);
  }

  // Get-All-Products
  getAllProducts() {
    return this.angularFirestore.collection('/Products').valueChanges();
  }


  // Update-Product
  updateProduct(product: any) {
    return this.angularFirestore.doc('/Products/' + product.id).update({ name: product.name });
  }

  // Delete-Product
  deleteProduct(product: any) {
    return this.angularFirestore.doc('/Products/' + product.id).delete();
  }

  // Get the latest invoice number
  getLatestInvoiceNumber() {
    this.angularFirestore.collection('/Invoices', ref => ref.orderBy('id', 'desc').limit(1)).valueChanges()
      .subscribe((invoices: any[]) => {
        if (invoices.length > 0) {
          const latestInvoice = invoices[0];
          const latestInvoiceNumberString = latestInvoice.id.substr(3);
          this.latestInvoiceNumber = parseInt(latestInvoiceNumberString, 10);
        } else {
          this.latestInvoiceNumber = 0;
        }
      });
  }

  // Generate the next invoice ID
  generateNextInvoiceId() {
    this.latestInvoiceNumber++;
    const invoiceNumberString = this.latestInvoiceNumber.toString().padStart(2, '0');
    return 'INV' + invoiceNumberString;
  }

  // Add-Invoice
  addInvoice(invoiceData: any) {
    const id = this.generateNextInvoiceId();
    invoiceData.id = id;
    invoiceData.createdAt = new Date();
    return this.angularFirestore.collection('/Invoices').doc(id).set(invoiceData);
  }

  // Get-All-Invoices
  getAllInvoices() {
    return this.angularFirestore.collection('/Invoices').snapshotChanges().pipe(map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data, createdAt: data.createdAt ? data.createdAt.toDate() : null };
      }))
    );
  }

  // Update-Invoice
  updateInvoice(invoice: any) {
    return this.angularFirestore.doc('/Invoices/' + invoice.id).update(invoice);
  }
  
  getInvoiceById(invoiceId: string): Observable<any> {
    return this.angularFirestore.collection('/Invoices').doc(invoiceId).valueChanges().pipe(
      map((data: any) => ({
        id: invoiceId,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null
      }))
    );
  }

  // Add-Transaction
addTransaction(customerId: string, transaction: any) {
  const id = this.angularFirestore.createId();
  transaction.id = id;
  return this.angularFirestore.collection(`/Customers/${customerId}/Transactions`).doc(id).set(transaction);
}

// Get-Transactions
getTransactions(customerId: string): Observable<any[]> {
  return this.angularFirestore.collection(`/Customers/${customerId}/Transactions`, ref => ref.orderBy('date', 'asc')).valueChanges();
}

// Get-Credit/Debit
addCreditDebit(customerId: string, creditdebit: any) {
  const id = this.angularFirestore.createId();
  creditdebit.id = id;
  return this.angularFirestore.collection(`/Customers/${customerId}/CreditDebit`).doc(id).set(creditdebit);
}

// Get-Transactions
getCreditDebit(customerId: string): Observable<any[]> {
  return this.angularFirestore.collection(`/Customers/${customerId}/CreditDebit`, ref => ref.orderBy('date', 'asc')).valueChanges();
}

}
