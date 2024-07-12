import { Component } from '@angular/core';
import { MasterService } from '../../master.service';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.css']
})
export class CreateInvoiceComponent {

  customerName: string = '';
  remarks: string = '';
  ProductsList: any[] = [];
  productRows: any[] = [{
    selectedProductId: ''
  }];
  isProcessingInvoice: boolean = false;

  constructor(private masterService: MasterService) {
    this.getProducts();
    this.masterService.getLatestInvoiceNumber();
  }

  getProducts() {
    this.masterService.getAllProducts().subscribe((res:any) => {
      this.ProductsList = res;
    });
  }

  updateProductPrice(row: any) {
    const selectedProduct = this.ProductsList.find(p => p.id === row.selectedProductId);
    if (selectedProduct) {
      row.price = selectedProduct.price;
    }
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

  saveInvoice() {
    if (this.isProcessingInvoice) {
      return; // If already processing, exit the function
    }
  
    if (!this.customerName) {
      // this.toastr.error('Customer name is required');
      return;
    }
  
    // Uncomment and use these checks if necessary
    // for (const row of this.productRows) {
    //   if (!row.selectedProductId) {
    //     this.toastr.error('Please select a product for each row');
    //     return;
    //   }
    //   if (!row.price) {
    //     this.toastr.error('Please enter a price for each selected product');
    //     return;
    //   }
    // }
  
    // const productsWithNames = this.productRows.map(row => {
    //   const selectedProduct = this.ProductsList.find(p => p.id === row.selectedProductId);
    //   return selectedProduct ? selectedProduct.name : '';
    // });
  
    const invoiceData = {
      customerName: this.customerName,
      remarks: this.remarks,
      // products: productsWithNames,
      // total: this.getTotalSum(),
      createdAt: new Date()
    };
  
    this.isProcessingInvoice = true; // Set the flag to true to indicate processing
  
    this.masterService.addInvoice(invoiceData).then(() => {
      // this.toastr.success('Invoice saved successfully');
      this.resetForm();
    }).catch((error:any) => {
      // this.toastr.error('Error saving invoice: ' + error.message);
    }).finally(() => {
      this.isProcessingInvoice = false; // Reset the flag once processing is done
    });
  }

  resetForm() {
    this.customerName = '';
    this.remarks = '';
    this.productRows = [{
      selectedProductId: '',
      price: ''
    }];
  }
}
