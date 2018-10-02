import { ItemType } from './itemType.enum';

export class EntryItem
{
    _id: string;
    date: Date;
    partyName: string;
    color: string;
    lotNo: string;
    rollCount: number;
    weight: number;
    machineNo: string;
    cloth: string;
    operator: string;
    items: Array<Items>;
}

export class Items
{
    name: string;
    type: ItemType;
    quantity: number;
    rate: number;
}
