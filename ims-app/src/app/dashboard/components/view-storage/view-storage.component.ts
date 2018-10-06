import { Component, OnInit, TemplateRef, ViewChild, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { DataItem } from '../../../Shared/storageItem.model';
import { ElectronService } from '../../../Service/electron.service';
import { GridOptions, ColDef, RowNode } from 'ag-grid-community';
import { ItemType } from '../../../Shared/itemType.enum';

@Component({
  selector: 'app-view-storage',
  templateUrl: './view-storage.component.html',
  styleUrls: ['./view-storage.component.css']
})
export class ViewStorageComponent implements OnInit, OnDestroy
{
  public gridOptions: GridOptions = {};
  public oldItem: DataItem = null;
  public columns: Array<ColDef> = [
    {
      headerName: '#',
      field: 'serialNo'
    },
    {
      headerName: 'Name',
      field: 'name'
    },
    {
      headerName: 'Loose(Kg)',
      field: 'looseAmount'
    },
    {
      headerName: 'Packed(Kg)',
      field: 'packAmount'
    },
    {
      headerName: 'Total(Kg)',
      field: 'totalAmount'
    },
    {
      headerName: 'Rate',
      field: 'rate'
    },
    {
      headerName: 'GST%',
      field: 'tax'
    },
    {
      headerName: 'Total Price',
      field: 'totalPriceString'
    },
    {
      headerName: '',
      cellRenderer: (param) => this.toolsButtonRenderer(param)
    }
  ];
  public popUpShow = false;
  @ViewChild('filter') private filter: ElementRef<any>;
  public rows: Array<DataItem> = [];
  @ViewChild('template') public popUptemplate: TemplateRef<any>;
  constructor(private electronService: ElectronService, private renderer: Renderer2)
  {
  }
  ngOnInit()
  {
    this.gridOptions = {
      columnDefs: this.columns,
      rowData: this.rows,
      enableSorting: true,
      domLayout: 'autoHeight',
      onGridReady: e =>
      {
        this.showItems();
      },
      getRowStyle: (gridOptions) =>
      {
        return { 'background-color': gridOptions.data.type === ItemType.Color ? '#F2FF00' : '#00FFFF' };
      },
      isExternalFilterPresent: () => (this.filter.nativeElement as HTMLInputElement).value.length > 0,
      doesExternalFilterPass: (node) => this.filterRows(node)
    };
  }
  private showItems(): void
  {
    this.electronService.getStorageItems().subscribe(items =>
    {
      this.rows = items;
      if (this.gridOptions.api)
      {
        this.gridOptions.api.setRowData(this.rows);
        this.gridOptions.api.sizeColumnsToFit();
      }
    });
  }
  private filterRows(node: RowNode): boolean
  {
    return (node.data as DataItem)
      .name.toLocaleLowerCase()
      .includes((this.filter.nativeElement as HTMLInputElement).value.toLocaleLowerCase());
  }
  public openPopUp(): void
  {
    (this.popUptemplate as any).show();
    this.popUpShow = true;
  }
  public closePopUp(): void
  {
    (this.popUptemplate as any).hide();
    this.popUpShow = false;
    this.showItems();
  }
  public searchTable(): void
  {
    this.gridOptions.api.onFilterChanged();
  }
  public upsertItem(data: DataItem)
  {
    this.electronService.upsertItem(data);
    this.oldItem = null;
    this.closePopUp();
  }
  private editButtonRenderer(param): HTMLButtonElement
  {
    const b: HTMLButtonElement = this.renderer.createElement('button');
    this.renderer.addClass(b, 'btn-primary');
    this.renderer.appendChild(b, this.renderer.createText('Edit'));
    this.renderer.listen(b, 'click', () =>
    {
      this.oldItem = param.data as DataItem;
      this.openPopUp();
    });
    return b;
  }
  private deleteButtonRenderer(param): HTMLButtonElement
  {
    const b: HTMLButtonElement = this.renderer.createElement('button');
    this.renderer.addClass(b, 'btn-danger');
    this.renderer.appendChild(b, this.renderer.createText('Delete'));
    this.renderer.listen(b, 'click', () =>
    {
      this.electronService.deleteStorageItem(param.data.id).subscribe(v => { });
      this.showItems();
    });
    return b;
  }
  private toolsButtonRenderer(param): HTMLDivElement
  {
    const container: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.addClass(container, 'btn-group');
    this.renderer.appendChild(container, this.editButtonRenderer(param));
    this.renderer.appendChild(container, this.deleteButtonRenderer(param));

    return container;
  }
  ngOnDestroy(): void
  {
  }
}

