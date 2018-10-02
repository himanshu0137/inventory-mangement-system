import { Injectable } from '@angular/core';
import { EntryItem } from '../Shared/entryItem.model';
import { ItemType } from '../Shared/itemType.enum';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root',

})
export class PrintService
{
  constructor(
    private electronService: ElectronService)
  {
  }

  public printEntry(entryValue: EntryItem): any
  {
    this.electronService.openPrintWindow(entryValue).subscribe(v => { });
  }
  private openPrintWindow(html, css): void
  {
    const win = window.open('', 'print');
    win.onload = () =>
    {
      win.document.body.innerHTML = html;
      if (css)
      {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        win.document.head.appendChild(style);
      }
      win.document.head.appendChild(
        document.getElementById('bootstrap').cloneNode(true)
      );
      win.onbeforeunload = () => win.close();
      win.onafterprint = () => win.close();
      win.print();
    };
  }
  private printIframe(html: string, css: string): void
  {
    const iFrame: HTMLIFrameElement = document.createElement('iframe');
    iFrame.style.opacity = '0';
    iFrame.style.zIndex = '-10';
    iFrame.style.position = 'fixed';
    iFrame.style.right = '0';
    iFrame.style.bottom = '0';
    iFrame.style.height = '2480px';
    iFrame.style.width = '3508px';
    iFrame.onload = () =>
    {
      iFrame.contentWindow.document.body.innerHTML = html;
      if (css)
      {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        iFrame.contentWindow.document.head.appendChild(style);
      }
      iFrame.contentWindow.document.head.appendChild(
        document.getElementById('bootstrap').cloneNode(true)
      );
      iFrame.contentWindow.onbeforeunload = () => document.removeChild(iFrame);
      iFrame.contentWindow.onafterprint = () => document.removeChild(iFrame);
      iFrame.contentWindow.print();
    };
    document.body.appendChild(iFrame);
  }
  private getPrintHTML(entryValue: EntryItem): string
  {
    // tslint:disable-next-line:max-line-length
    let a = '<div class="container"><div class="row"><div class="col-sm-9"><table class="table table-bordered table-sm"><thead><tr><th>Items</th><th>Quantity</th><th>Rate</th><th>Total</th><th></th></tr></thead><tbody>';
    let totalChemical = 0;
    entryValue.items.filter(v => v.type === ItemType.Chemical).forEach(v =>
    {
      const totalItem = v.quantity * v.rate;
      a = a + `<tr><td>${v.name}</td><td>${v.quantity}</td><td>${v.rate}</td><td>${totalItem.toFixed(3)}</td><td></td></tr>`;
      totalChemical += totalItem;
    });
    // tslint:disable-next-line:max-line-length
    a = a + `<tr><td colspan="5"></td></tr><tr><td colspan="2"></td><td>Total</td><td>${totalChemical}</td><td>${(totalChemical / entryValue.weight).toFixed(3)}</td></tr><tr><td colspan="5">Color</td></tr>`;
    let totalColor = 0;
    entryValue.items.filter(v => v.type === ItemType.Color).forEach(v =>
    {
      const totalItem = v.quantity * v.rate;
      a = a + `<tr><td>${v.name}</td><td>${v.quantity}</td><td>${v.rate}</td><td>${totalItem.toFixed(3)}</td><td></td></tr>`;
      totalColor += totalItem;
    });
    // tslint:disable-next-line:max-line-length
    a = a + `<tr><td colspan="5"></td></tr><tr><td colspan="2"></td><td>Total</td><td>${totalColor}</td><td>${(totalColor / entryValue.weight).toFixed(3)}</td></tr><tr><td colspan="5"></td></tr>`;
    // tslint:disable-next-line:max-line-length
    a = a + '</tbody></table></div><div class="col-sm-2 offset-sm-1 align-self-center"><table class="table table-bordered table-sm"><tbody>';
    const d = new Date(entryValue.date);
    a = a + `<tr><td>Date</td><td>${d.getDate()}/${d.getMonth()}/${d.getFullYear()}</td></tr>`;
    a = a + `<tr><td>Party</td><td>${entryValue.partyName}</td></tr>`;
    a = a + `<tr><td>Lot</td><td>${entryValue.lotNo}</td></tr>`;
    a = a + `<tr><td>Roll</td><td>${entryValue.rollCount}</td></tr>`;
    a = a + `<tr><td>Weight</td><td>${entryValue.weight}</td></tr>`;
    a = a + `<tr><td>Machine</td><td>${entryValue.machineNo}</td></tr>`;
    a = a + `<tr><td>Cloth</td><td>${entryValue.cloth}</td></tr>`;
    a = a + `<tr><td>Operator</td><td>${entryValue.operator}</td></tr>`;
    a = a + `<tr><td colspan="2"></td></tr>`;
    a = a + `<tr><td>Total</td><td>${((totalChemical + totalColor) / entryValue.weight).toFixed(3)}</td></tr>`;
    a = a + '</tbody></table></div></div></div>';
    return a;
  }
  private getPrintCSS(): string
  {
    return '@page {size: landscape;}';
  }
}
