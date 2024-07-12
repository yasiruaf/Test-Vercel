import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MasterService } from '../../master.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css']
})
export class CustomerDetailsComponent implements OnInit {
  customer: any;
  ProductsList: any[] = [];
  productRows: any[] = [{
    selectedProductId: ''
  }];
  showHistory = false;
  addDebCred = {
    debit: '',
    credit: '',
  }
  isProcessing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private masterService: MasterService
  ) {}

  ngOnInit() {
    const invoiceId = this.route.snapshot.paramMap.get('id')!;
    this.getCustomerDetails(invoiceId);
    this.getProducts();
    this.getCustomerDetail(invoiceId);
  }

  downloadPDF() {
    const data = document.getElementById('table') as HTMLElement;
  
    html2canvas(data).then(canvas => {
      const padding = 10;
      const imgWidth = 208 - 2 * padding;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      const position = padding;
      pdf.addImage(contentDataURL, 'PNG', padding, position, imgWidth, imgHeight);
  
      // Set the PDF file name based on the customer's name
      const fileName = this.customer.customerName ? `${this.customer.customerName}.pdf` : 'table.pdf';
      pdf.save(fileName);
    });
  }

  getCustomerDetails(invoiceId: string) {
    this.masterService.getInvoiceById(invoiceId).subscribe((invoice) => {
      this.customer = invoice;
      this.fetchTransactions();
    });
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  getProducts() {
    this.masterService.getAllProducts().subscribe((res) => {
      this.ProductsList = res;
    });
  }

  removeProductRow(index: number) {
    if (this.productRows.length > 1) {
      this.productRows.splice(index, 1);
    } else {
      // this.toastr.error('At least one product is required');
    }
  }

  getTotalSum() {
    return this.productRows.reduce((sum, row) => sum + Number(row.price || 0), 0);
  }

  addProductRow() {
    this.productRows.push({
      selectedProductId: ''
    });
  }

  updateRecord() {
    if (this.isProcessing) {
      return; // If already processing, exit the function
    }
  
    let missingProduct = false;
    let missingPrice = false;
  
    this.productRows.forEach(row => {
      if (!row.selectedProductId) {
        missingProduct = true;
      }
      if (!row.price) {
        missingPrice = true;
      }
    });
  
    if (missingProduct && missingPrice) {
      // this.toastr.error('Please fill all product and price fields.');
      return;
    } else if (missingProduct) {
      // this.toastr.error('Please fill all product fields.');
      return;
    } else if (missingPrice) {
      // this.toastr.error('Please fill all price fields.');
      return;
    }
  
    const customerId = this.customer.id;
    const transaction = {
      products: this.productRows.map(row => ({
        productId: row.selectedProductId,
        productName: this.ProductsList.find(product => product.id === row.selectedProductId)?.name || '',
        price: row.price
      })),
      date: new Date(),
      totalPrice: this.getTotalSum()
    };
  
    this.isProcessing = true; // Set the flag to true to indicate processing
  
    this.masterService.addTransaction(customerId, transaction).then(() => {
      // this.toastr.success('Transaction added successfully');
      this.fetchTransactions();
      this.productRows = [{ selectedProductId: '' }]; // Reset productRows to initial state
    }).catch(error => {
      // this.toastr.error('Error adding transaction: ' + error.message);
    }).finally(() => {
      this.isProcessing = false; // Reset the flag once processing is done
    });
  }

  debit() {
    if (this.isProcessing) {
      return; // If already processing, exit the function
    }
  
    const amount = parseFloat(this.addDebCred.debit);
    if (!isNaN(amount)) {
      const creditDebit = {
        debit: amount,
        credit: 0,
        date: new Date()
      };
  
      this.isProcessing = true; // Set the flag to true to indicate processing
  
      this.masterService.addCreditDebit(this.customer.id, creditDebit).then(() => {
        // this.toastr.success('Debit added successfully');
        this.addDebCred.debit = '';
        this.fetchTransactions(); // Refresh transactions after update
      }).catch(error => {
        // this.toastr.error('Error adding debit: ' + error.message);
      }).finally(() => {
        this.isProcessing = false; // Reset the flag once processing is done
      });
    } else {
      // this.toastr.error('Invalid debit amount');
    }
  }

  credit() {
    if (this.isProcessing) {
      return; // If already processing, exit the function
    }
  
    const amount = parseFloat(this.addDebCred.credit);
    if (!isNaN(amount)) {
      const creditDebit = {
        debit: 0,
        credit: amount,
        date: new Date()
      };
  
      this.isProcessing = true; // Set the flag to true to indicate processing
  
      this.masterService.addCreditDebit(this.customer.id, creditDebit).then(() => {
        // this.toastr.success('Credit added successfully');
        this.addDebCred.credit = '';
        this.fetchTransactions(); // Refresh transactions after update
      }).catch(error => {
        // this.toastr.error('Error adding credit: ' + error.message);
      }).finally(() => {
        this.isProcessing = false; // Reset the flag once processing is done
      });
    } else {
      // this.toastr.error('Invalid credit amount');
    }
  }
  
  fetchTransactions() {
    this.masterService.getTransactions(this.customer.id).subscribe(transactions => {
      this.customer.transactions = transactions.map(transaction => ({
        ...transaction,
        date: transaction.date?.toDate() || new Date(),
        totalPrice: transaction.totalPrice || 0,
        products: transaction.products || [],
      }));
  
      this.masterService.getCreditDebit(this.customer.id).subscribe(creditDebit => {
        this.customer.creditDebit = creditDebit.map(cd => ({
          ...cd,
          date: cd.date?.toDate() || new Date()
        }));
  
        // Combine transactions and creditDebit, sort by date
        let allEntries = [
          ...this.customer.transactions,
          ...this.customer.creditDebit
        ].sort((a, b) => a.date.getTime() - b.date.getTime());
  
        let balance = 0;
        this.customer.ledger = allEntries.map(entry => {
          if ('totalPrice' in entry) {
            // It's a transaction
            balance += entry.totalPrice; // Add total price to balance
            return {
              ...entry,
              totalPrice: entry.totalPrice,
              debit: 0,
              credit: 0,
              balance
            };
          } else {
            // It's a credit/debit entry
            if (entry.debit) {
              balance += entry.debit;
            } else if (entry.credit) {
              balance -= entry.credit;
            }
            return {
              ...entry,
              totalPrice: 0,
              balance
            };
          }
        });
      });
    });
  }
  

  joinProductNames(products: any[]): string {
    return products.map(product => product.productName).join(', ');
  }

  calculateBalance(transaction: any): number {
    const totalDebit = transaction.debit || 0;
    const totalCredit = transaction.credit || 0;
    return totalDebit - totalCredit;
  }

  getCustomerDetail(invoiceId: string) {
    this.masterService.getInvoiceById(invoiceId).subscribe((invoice) => {
      this.customer = invoice;
      this.customer.transactions = [];
      this.customer.creditDebit = [];
      this.fetchTransactions();
    });
  }

}

