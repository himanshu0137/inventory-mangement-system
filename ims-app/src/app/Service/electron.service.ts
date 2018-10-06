import { Injectable } from '@angular/core';
import { DataItem } from '../Shared/storageItem.model';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { EntryItem, Items } from '../Shared/entryItem.model';

@Injectable({
  providedIn: 'root'
})
export class ElectronService
{
  public entryItemSubject: BehaviorSubject<Array<EntryItem>>;
  private get electronProvider(): any
  {
    return window['electronProcess'];
  }
  constructor()
  {
  }
  public sendData(data: string)
  {
    this.electronProvider.sendSync('send-data', data);
  }
  public getDefaultChemicals(): Observable<DataItem[]>
  {
    return Observable.create((observer: Observer<DataItem[]>) =>
    {
      this.electronProvider.on('default-chemical-reply', (e, data: any[]) =>
      {
        observer.next(data.map((v, i) =>
          new DataItem(v._id, v.type, i + 1, v.name, v.looseAmount, v.packAmount, v.rate, v.tax, v.defualtItem)));
        observer.complete();
      });
      this.electronProvider.send('default-chemical');
    });
  }
  public getStorageItems(): Observable<DataItem[]>
  {
    return Observable.create((observer: Observer<DataItem[]>) =>
    {
      this.electronProvider.on('get-storage-items-reply', (e, data: any[]) =>
      {
        observer.next(data.map((v, i) =>
          new DataItem(v._id, v.type, i + 1, v.name, v.looseAmount, v.packAmount, v.rate, v.tax, v.defualtItem)));
        observer.complete();
      });
      this.electronProvider.send('get-storage-items');
    });
  }
  public upsertItem(data: DataItem): void
  {
    const a: any = {};
    if (data.id)
    {
      a._id = data.id;
    }
    a.type = data.type;
    a.name = data.name;
    a.looseAmount = data.looseAmount;
    a.packAmount = data.packAmount;
    a.rate = data.rate;
    a.tax = data.tax;
    a.defualtItem = data.defualtItem;
    this.electronProvider.sendSync('upsert-item', a);
  }
  public saveEntry(value: EntryItem): void
  {
    this.electronProvider.sendSync('save-entry', value);
  }

  public getEntries(): Observable<EntryItem[]>
  {
    return Observable.create((observer: Observer<EntryItem[]>) =>
    {
      this.electronProvider.on('get-all-entry-reply', (e, data: EntryItem[]) =>
      {
        observer.next(data);
        observer.complete();
      });
      this.electronProvider.send('get-all-entry');
    });
  }
  public addItems(items: Items[]): void
  {
    this.electronProvider.sendSync('add-items', items);
  }
  public removeItems(items: Items[]): void
  {
    this.electronProvider.sendSync('remove-items', items);
  }
  public getEntry(id: string): Observable<EntryItem>
  {
    return Observable.create((observer: Observer<EntryItem>) =>
    {
      this.electronProvider.once('get-entry-reply', (e, data: EntryItem) =>
      {
        observer.next(data);
        observer.complete();
      });
      this.electronProvider.send('get-entry', id);
    });
  }
  public openPrintWindow(data: any): Observable<boolean>
  {
    return Observable.create((observer: Observer<boolean>) =>
    {
      this.electronProvider.once('open-print-window-reply', (e) =>
      {
        observer.next(true);
        observer.complete();
      });
      this.electronProvider.send('open-print-window', data);
    });
  }
  public getColorItems(searchTerm: string): Observable<DataItem[]>
  {
    return Observable.create((observer: Observer<DataItem[]>) =>
    {
      this.electronProvider.once('chemical-items-reply', (e, data: DataItem[]) =>
      {
        observer.next(data);
        observer.complete();
      });
      this.electronProvider.send('chemical-items', searchTerm);
    });
  }
  public findStorageItem(searchTerm: string): Observable<DataItem[]>
  {
    return Observable.create((observer: Observer<DataItem[]>) =>
    {
      this.electronProvider.once('find-storage-items-reply', (e, data: DataItem[]) =>
      {
        observer.next(data);
        observer.complete();
      });
      this.electronProvider.send('find-storage-items', searchTerm);
    });
  }
  public deleteStorageItem(id: string): Observable<boolean>
  {
    return Observable.create((observer: Observer<boolean>) =>
    {
      this.electronProvider.once('delete-storage-item-reply', (e) =>
      {
        observer.next(true);
        observer.complete();
      });
      this.electronProvider.send('delete-storage-item', id);
    });
  }
  public deleteEntry(id: string): Observable<boolean>
  {
    return Observable.create((observer: Observer<boolean>) =>
    {
      this.electronProvider.once('delete-entry-reply', (e) =>
      {
        observer.next(true);
        observer.complete();
      });
      this.electronProvider.send('delete-entry', id);
    });
  }
}
