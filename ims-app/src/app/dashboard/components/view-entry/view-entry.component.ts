import { Component, OnInit, Renderer2 } from '@angular/core';
import { GridOptions, ColDef, ICellRendererFunc } from 'ag-grid-community';
import { ElectronService } from '../../../Service/electron.service';
import { ValueFormatterParams, ValueGetterParams } from 'ag-grid-community/dist/lib/entities/colDef';
import { EntryItem } from '../../../Shared/entryItem.model';
import { PrintService } from '../../../Service/print.service';

@Component({
  selector: 'app-view-entry',
  templateUrl: './view-entry.component.html',
  styleUrls: ['./view-entry.component.css']
})
export class ViewEntryComponent implements OnInit
{
  public gridOptions: GridOptions = {};
  private columnDefs: ColDef[] = [
    {
      headerName: 'Date', field: 'date', valueFormatter: this.dateFormatter, filter: 'agDateColumnFilter', filterParams: {
        comparator: this.dateComparator,
        browserDatePicker: true
      },
      suppressMenu: true
    },
    { headerName: 'Lot No.', field: 'lotNo', filter: 'agTextColumnFilter', suppressMenu: true },
    { headerName: 'Party Name', field: 'partyName', filter: 'agTextColumnFilter', suppressMenu: true },
    { headerName: 'Color', field: 'color', filter: 'agTextColumnFilter', suppressMenu: true },
    { headerName: 'cost', valueGetter: this.costGetter, filter: 'agNumberColumnFilter', suppressMenu: true },
    { headerName: '', cellRenderer: (param) => this.toolsButtonRenderer(param), suppressMenu: true, suppressFilter: true }
  ];

  private rowData: any[] = [];

  constructor(
    private electronService: ElectronService,
    private renderer: Renderer2,
    private printService: PrintService) { }

  ngOnInit()
  {
    this.gridOptions = {
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      enableSorting: true,
      enableFilter: true,
      floatingFilter: true,
      domLayout: 'autoHeight',
      onGridReady: e => this.initData()
    };
  }
  private costGetter(param: ValueGetterParams): string
  {
    const total = (param.data as EntryItem).items.reduce((acc, curr) => acc += (curr.rate * curr.quantity), 0);
    return (total / param.data.weight).toFixed(3);
  }
  private initData(): void
  {
    this.electronService.getEntries().subscribe(v =>
    {
      this.rowData = v;
      this.gridOptions.api.setRowData(this.rowData);
      this.gridOptions.api.sizeColumnsToFit();
    });
  }
  private dateFormatter(param: ValueFormatterParams): string
  {
    const d = new Date(param.data.date);
    return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
  }

  private toolsButtonRenderer(param): HTMLDivElement
  {
    const container: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.addClass(container, 'btn-group');

    let b: HTMLButtonElement = this.renderer.createElement('button');
    this.renderer.addClass(b, 'btn-primary');
    this.renderer.appendChild(b, this.renderer.createText('Print'));
    this.renderer.listen(b, 'click', () =>
    {
      this.printService.printEntry(param.data);
    });
    this.renderer.appendChild(container, b);

    b = this.renderer.createElement('button');
    this.renderer.addClass(b, 'btn-warning');
    this.renderer.appendChild(b, this.renderer.createText('Edit'));
    this.renderer.listen(b, 'click', () =>
    {
      //
    });
    this.renderer.appendChild(container, b);

    b = this.renderer.createElement('button');
    this.renderer.addClass(b, 'btn-danger');
    this.renderer.appendChild(b, this.renderer.createText('Delete'));
    this.renderer.listen(b, 'click', () =>
    {
      this.electronService.deleteEntry(param.data._id).subscribe(v => { });
      this.initData();
    });
    this.renderer.appendChild(container, b);
    return container;
  }
  private dateComparator(searchValue: Date, cellValue)
  {
    const date = new Date(cellValue);
    if (date.getTime() === searchValue.getTime())
    {
      return 0;
    }
    if (date.getTime() < searchValue.getTime())
    {
      return -1;
    }
    return 1;
  }
}
