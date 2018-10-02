import { ItemType } from './itemType.enum';

export class DataItem
{
  public id: string;
  public type: ItemType;
  public serialNo: number;
  public name: string;
  public looseAmount: number;
  public packAmount: number;
  public rate: number;
  public tax: number;
  public defualtItem: boolean;
  public get totalPrice(): number
  {
    return this.rate * (1 + this.tax / 100);
  }
  public get totalPriceString(): string
  {
    return this.totalPrice.toFixed(3);
  }
  public get totalAmount(): number
  {
    return this.packAmount + this.looseAmount;
  }
  constructor(id: string = '',
    type: ItemType, sno: number = -1, name: string,
    looseAmount: number, packAmount: number,
    rate: number, tax: number, defualtItem: boolean)
  {
    this.id = id;
    this.type = type;
    this.serialNo = sno;
    this.name = name;
    this.looseAmount = looseAmount;
    this.packAmount = packAmount;
    this.rate = rate;
    this.tax = tax;
    this.defualtItem = defualtItem;
  }
}
