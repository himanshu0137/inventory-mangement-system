import { Injectable } from '@angular/core';
import { EntryItem } from '../Shared/entryItem.model';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class FormService
{
  submitNewEntry(value: EntryItem): void
  {
  }

  constructor(private electronService: ElectronService) { }
}
