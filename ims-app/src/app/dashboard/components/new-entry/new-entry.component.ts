import { Component, OnInit, ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ItemType } from '../../../Shared/itemType.enum';
import { ElectronService } from '../../../Service/electron.service';
import { Parser } from 'expr-eval';
import { EntryItem } from '../../../Shared/entryItem.model';
import { DataItem } from '../../../Shared/storageItem.model';
import { PrintService } from '../../../Service/print.service';
import { first, filter } from 'rxjs/operators';
import { TypeaheadMatch } from 'ngx-bootstrap';

@Component({
  selector: 'app-new-entry',
  templateUrl: './new-entry.component.html',
  styleUrls: ['./new-entry.component.css']
})
export class NewEntryComponent implements OnInit, OnDestroy
{
  public name: string;
  public ItemType = ItemType;
  public form: FormGroup;
  public autoCompleteChemical: DataItem[] = [];
  public dataSource;
  public selectedChemical: string[] = [];
  constructor(private fb: FormBuilder,
    private electronService: ElectronService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject('ExpresionParser') private exprParser: Parser,
    private printService: PrintService
  )
  {
    this.electronService.getStorageItems().pipe(first()).subscribe((d: DataItem[]) =>
    {
      this.autoCompleteChemical = d.filter(x => !this.selectedChemical.includes(x.name));
    });
  }

  get dynamicItem(): FormGroup
  {
    const item = this.fb.group({
      itemName: ['', Validators.required],
      itemQuantity: ['', Validators.compose([Validators.required, Validators.pattern('[0-9+-\/\*]')])],
      itemRate: ['', Validators.required],
      itemQuantityValue: [''],
      itemTotalRate: [''],
      itemQuantityBalance: [''],
      itemStorageQuantity: ['']
    });
    item.get('itemName').valueChanges.pipe(
      filter(a => a && a.length > 1 && !this.selectedChemical.includes(a))
    ).subscribe(v =>
    {
      this.electronService.getColorItems(v).pipe(first()).subscribe((d: DataItem[]) =>
      {
        this.autoCompleteChemical = d.filter(x => !this.selectedChemical.includes(x.name));
      });
    });
    item.get('itemQuantity').valueChanges.subscribe((value) =>
    {
      const tq = this.getTotalQuantity(value);
      item.get('itemQuantityBalance').setValue(
        (item.get('itemStorageQuantity').value - tq).toFixed(3)
      );
      item.get('itemQuantityValue').setValue(tq);
      item.get('itemTotalRate').setValue(this.getTotalRate(
        item.get('itemQuantityValue').value,
        item.get('itemRate').value
      ));
      if (item.parent)
      {
        let entryItem = item.parent.parent;
        entryItem.get('total').setValue(this.getEntryTotalPrice(
          entryItem.get('items').value,
          this.form.get('entryWeight').value
        ));
      }
    });
    item.get('itemRate').valueChanges.subscribe((value) =>
    {
      item.get('itemTotalRate').setValue(this.getTotalRate(
        item.get('itemQuantityValue').value,
        value
      ));
      if (item.parent)
      {
        let entryItem = item.parent.parent;
        entryItem.get('total').setValue(this.getEntryTotalPrice(
          entryItem.get('items').value,
          this.form.get('entryWeight').value
        ));
      }
    });
    return item;
  }

  get entryChemicalItems(): FormArray
  {
    return this.form.get('entryItems.entryChemicalItems.items') as FormArray;
  }

  get entryColorItems(): FormArray
  {
    return this.form.get('entryItems.entryColorItems.items') as FormArray;
  }

  ngOnInit()
  {
    this.form = this.fb.group({
      entryDate: [new Date(), Validators.required],
      entryPartyName: [''],
      entryColor: ['', Validators.required],
      entryLot: ['', Validators.required],
      entryRollCount: ['', Validators.required],
      entryWeight: ['', Validators.required],
      entryMachineNo: ['', Validators.required],
      entryCloth: ['', Validators.required],
      entryOperator: ['', Validators.required],
      entryItems: this.fb.group({
        entryChemicalItems: this.fb.group({
          items: this.fb.array([]),
          total: ['']
        }),
        entryColorItems: this.fb.group({
          items: this.fb.array([this.dynamicItem, this.dynamicItem]),
          total: ['']
        }),
      }),
      entryTotal: [''],
      print: [false]
    });
    this.form.get('entryItems.entryChemicalItems.total').valueChanges.subscribe((value) =>
    {
      this.form.get('entryTotal').setValue(this.getTotalPrice(
        value,
        this.form.get('entryItems.entryColorItems.total').value
      ));
    });
    this.form.get('entryItems.entryColorItems.total').valueChanges.subscribe((value) =>
    {
      this.form.get('entryTotal').setValue(this.getTotalPrice(
        this.form.get('entryItems.entryChemicalItems.total').value,
        value
      ));
    });
    this.form.get('entryWeight').valueChanges.subscribe(() =>
    {
      this.form.updateValueAndValidity();
    });
    this.addDefaltItems();
  }

  private addDefaltItems(): void
  {
    this.electronService.getDefaultChemicals().subscribe((items: DataItem[] = []) =>
    {
      items.forEach(v =>
      {
        const control = this.dynamicItem;
        control.patchValue({
          'itemName': v.name || '', 'itemRate': v.totalPriceString || '',
          'itemStorageQuantity': (v.looseAmount || 0).toFixed(3), 'itemQuantityBalance': (v.looseAmount || 0).toFixed(3)
        });
        this.entryChemicalItems.push(control);
      });
    });
  }
  public onSubmit(): void
  {
    const entryValue = new EntryItem();
    const formValue = this.form.value;
    entryValue.cloth = (formValue.entryCloth || '').toLowerCase();
    entryValue.color = (formValue.entryColor || '').toLowerCase();
    entryValue.date = new Date((formValue.entryDate as Date).toDateString());
    entryValue.lotNo = (formValue.entryLot || '').toLowerCase();
    entryValue.machineNo = (formValue.entryMachineNo || '').toLowerCase();
    entryValue.operator = (formValue.entryOperator || '').toLowerCase();
    entryValue.partyName = (formValue.entryPartyName || '').toLowerCase();
    entryValue.rollCount = parseInt(formValue.entryRollCount || 0, 10);
    entryValue.weight = parseFloat(formValue.entryWeight || 0);
    entryValue.items = [].concat(
      formValue.entryItems.entryChemicalItems.items.map(v =>
      {
        if (v.itemName && v.itemQuantityValue && v.itemRate)
        {
          return {
            name: (v.itemName || '').toLowerCase(),
            type: ItemType.Chemical,
            quantity: parseFloat(v.itemQuantityValue || 0),
            rate: parseFloat(v.itemRate || 0)
          };
        }
      })).concat(
        formValue.entryItems.entryColorItems.items.map(v =>
        {
          if (v.itemName && v.itemQuantityValue && v.itemRate)
          {
            return {
              name: (v.itemName || '').toLowerCase(),
              type: ItemType.Color,
              quantity: parseFloat(v.itemQuantityValue || 0),
              rate: parseFloat(v.itemRate || 0)
            };
          }
        })).filter(v => v ? true : false);
    this.electronService.saveEntry(entryValue);
    this.electronService.removeItems(entryValue.items);
    this.form.reset({ 'entryDate': new Date() });
    while (this.entryChemicalItems.length !== 0)
    {
      this.entryChemicalItems.removeAt(0);
    }
    this.addDefaltItems();
    if (formValue.print)
    {
      this.printService.printEntry(entryValue);
    }
  }

  public removeItem(index: number, type: ItemType): void
  {
    const entryItemArray: FormArray = this.getEntryFormArray(type);
    if (entryItemArray.length === 1)
    {
      return;
    }
    entryItemArray.removeAt(index);
    entryItemArray.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
  getEntryFormArray(type: ItemType): FormArray
  {
    switch (type)
    {
      case ItemType.Chemical: return this.entryChemicalItems;
      case ItemType.Color: return this.entryColorItems;
      default: return null;
    }
  }

  public addItem(type: ItemType): void
  {
    const entryItemArray: FormArray = this.getEntryFormArray(type);
    entryItemArray.push(this.dynamicItem);
  }

  private getTotalQuantity(value: string): number
  {
    if (value && value.length === 0)
    {
      return 0;
    }
    try
    {
      return this.exprParser.evaluate(value);
    }
    catch (e)
    {
      return 0;
    }
  }
  private getTotalRate(qty: string, rate: string): number
  {
    const qtyValue = parseFloat(qty);
    const rateValue = parseFloat(rate);
    if (isNaN(qtyValue) || isNaN(rateValue))
    {
      return 0;
    }
    return qtyValue * rateValue;
  }
  private getEntryTotalPrice(value: Array<any>, totalWeight: string): number
  {
    const totalWeightValue = parseFloat(totalWeight);
    const entryValues = value.map(x => parseFloat(x.itemTotalRate));
    if (entryValues.every(x => isNaN(x)) || isNaN(totalWeightValue))
    {
      return 0;
    }
    return entryValues.filter(x => !isNaN(x)).reduce((acc, val) => acc += val, 0) / totalWeightValue;
  }
  private getTotalPrice(chemicalTotal: string, colorTotal: string)
  {
    const chemicalTotalValue = parseFloat(chemicalTotal);
    const colorTotalValue = parseFloat(colorTotal);
    if (isNaN(chemicalTotalValue) || isNaN(colorTotalValue))
    {
      return 0;
    }
    return chemicalTotalValue + colorTotalValue;
  }
  ngOnDestroy(): void
  {
    this.changeDetectorRef.detach();
  }
  onSelect(event: TypeaheadMatch, item: FormGroup): void
  {
    this.selectedChemical.push(event.value);
    const d = event.item as DataItem;
    item.patchValue({
      'itemName': d.name, 'itemRate': d.rate.toFixed(3),
      'itemStorageQuantity': d.looseAmount.toFixed(3), 'itemQuantityBalance': d.looseAmount.toFixed(3)
    });
  }
}
