import { Component, OnInit } from '@angular/core';
import { MasterService } from '../../master.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
})
export class InvoiceListComponent implements OnInit {
  InvoicesList: any[] = [];
  filteredInvoices: any[] = [];
  pagedInvoices: any[] = [];
  searchCustomerName: string = '';
  searchInvoice: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 50;
  isLoading = true;

  constructor(private masterService: MasterService) {}

  ngOnInit() {
    this.getAllInvoices();
  }

  getAllInvoices() {
    this.isLoading = true;
    this.masterService.getAllInvoices().subscribe((invoices) => {
      this.InvoicesList = invoices;
      this.filterInvoices();
      this.isLoading = false;
    });
  }

  filterInvoices() {
    this.currentPage = 1;
    this.filteredInvoices = this.InvoicesList.filter(invoice => {
      return (
        (!this.searchCustomerName || invoice.customerName.toLowerCase().includes(this.searchCustomerName.toLowerCase())) &&
        (!this.searchInvoice || invoice.id.toLowerCase().includes(this.searchInvoice.toLowerCase()))
      );
    });
    this.setPagedInvoices();
  }

  setPagedInvoices() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedInvoices = this.filteredInvoices.slice(startIndex, endIndex);
  }

  nextPage() {
    this.currentPage++;
    this.setPagedInvoices();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPagedInvoices();
    }
  }

  showButtons(invoice: any) {
    invoice.showButtons = true;
  }

  hideButtons(invoice: any) {
    invoice.showButtons = false;
  }

  editRemarks(invoice: any) {
    invoice.originalRemarks = invoice.remarks;
    invoice.isEditing = true;
    invoice.showButtons = true;
  }

  updateRemarks(invoice: any) {
    invoice.isEditing = false;
    invoice.showButtons = false;
    this.masterService.updateInvoice(invoice).then((res: any) => {
      // this.toastr.success('Remarks updated successfully!');
      this.filterInvoices();
    }).catch((error: any) => {
      // this.toastr.error('Error updating remarks: ' + error);
    });
  }

  clearRemarks(invoice: any) {
    invoice.remarks = 'No remarks available';
    invoice.isEditing = false;
    invoice.showButtons = false;

    this.masterService.updateInvoice(invoice).then((res: any) => {
        // this.toastr.success('Remarks cleared successfully!');
        this.filterInvoices();
    }).catch((error: any) => {
        // this.toastr.error('Error clearing remarks: ' + error);
    });
  }

  cancelRemarks(invoice: any) {
    invoice.remarks = invoice.originalRemarks;
    invoice.isEditing = false;
    invoice.showButtons = false;
  }
}
