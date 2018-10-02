import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewEntryComponent } from './dashboard/components/new-entry/new-entry.component';
import { EditItemsComponent } from './dashboard/components/edit-items/edit-items.component';
import { ViewEntryComponent } from './dashboard/components/view-entry/view-entry.component';
import { ViewStorageComponent } from './dashboard/components/view-storage/view-storage.component';
import { ElectronService } from './Service/electron.service';
import { TabsModule, BsDatepickerModule, TypeaheadModule, ModalModule, ButtonsModule } from 'ngx-bootstrap';
import { TotalPipe } from './Shared/quantity-pipe.pipe';
import { NewItemComponent } from './dashboard/components/new-item/new-item.component';
import { AgGridModule } from 'ag-grid-angular';
import { Parser } from 'expr-eval';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    NewEntryComponent,
    EditItemsComponent,
    ViewEntryComponent,
    ViewStorageComponent,
    TotalPipe,
    NewItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    AgGridModule.withComponents([])
  ],
  providers: [ElectronService, {provide: 'ExpresionParser', useFactory: () => new Parser()}],
  bootstrap: [AppComponent]
})
export class AppModule { }
