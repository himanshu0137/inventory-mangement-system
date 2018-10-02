import { Component, OnInit, Output, EventEmitter, Input, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ItemType } from '../../../Shared/itemType.enum';
import { DataItem } from '../../../Shared/storageItem.model';
import { Parser } from 'expr-eval';
import { ElectronService } from '../../../Service/electron.service';
import { switchMap, mergeMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-new-item',
  templateUrl: './new-item.component.html',
  styleUrls: ['./new-item.component.css']
})
export class NewItemComponent implements OnInit
{

  @Output() close: EventEmitter<boolean>;
  @Input() oldItem: DataItem = null;
  @Output() itemSubmit: EventEmitter<DataItem>;
  public form: FormGroup;
  public ItemType = ItemType;
  constructor(private fb: FormBuilder,
    @Inject('ExpresionParser') private exprParser: Parser,
    private electronService: ElectronService)
  {
    this.close = new EventEmitter<boolean>();
    this.itemSubmit = new EventEmitter<DataItem>();
  }

  ngOnInit()
  {
    this.form = this.oldItem ?
      this.fb.group({
        itemType: [this.oldItem.type, { validator: Validators.required, updateOn: 'blur' }],
        itemName: [this.oldItem.name, Validators.required],
        itemQuantityLoose: [this.oldItem.looseAmount, Validators.required],
        itemQuantityLooseValue: [this.oldItem.looseAmount],
        itemQuantityPacked: [this.oldItem.packAmount, Validators.required],
        itemQuantityPackedValue: [this.oldItem.packAmount],
        itemRate: [this.oldItem.rate, Validators.required],
        itemTax: [this.oldItem.tax, Validators.required]
      }) :
      this.fb.group({
        itemType: [ItemType.Chemical, { validator: Validators.required, updateOn: 'blur' }],
        itemName: ['', Validators.required],
        itemQuantityLoose: ['', Validators.required],
        itemQuantityLooseValue: [''],
        itemQuantityPacked: ['', Validators.required],
        itemQuantityPackedValue: [''],
        itemRate: ['', Validators.required],
        itemTax: ['', Validators.required]
      });
    this.form.get('itemName').valueChanges.pipe(
      filter(e => e && e.length > 3)
    ).subscribe(v =>
    {
      this.electronService.findStorageItem(v).subscribe(q =>
      {
        if (q.map(z => z.name.toLowerCase()).includes(this.form.get('itemName').value.toLowerCase()))
        {
          this.form.get('itemName').setErrors({
            'item': 'Item already exist'
          });
        }
        else
        {
          this.form.get('itemName').setErrors(null);
        }
      });
    });
    this.form.get('itemQuantityLoose').valueChanges.subscribe(v =>
    {
      this.form.get('itemQuantityLooseValue').setValue(this.getTotalQuantity(v));
    });
    this.form.get('itemQuantityPacked').valueChanges.subscribe(v =>
    {
      this.form.get('itemQuantityPackedValue').setValue(this.getTotalQuantity(v));
    });
  }

  public closeMe()
  {
    this.close.emit(true);
  }
  public onSubmit()
  {
    if (this.form.hasError)
    {
      return;
    }
    const value = this.form.value;
    this.itemSubmit.emit(new DataItem(
      this.oldItem.id || '',
      value.itemType,
      -1,
      value.itemName.toLowerCase(),
      parseFloat(value.itemQuantityLooseValue),
      parseFloat(value.itemQuantityPackedValue),
      parseFloat(value.itemRate),
      parseFloat(value.itemTax),
      value.itemType === ItemType.Chemical
    ));
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
      return -1;
    }
  }
}
