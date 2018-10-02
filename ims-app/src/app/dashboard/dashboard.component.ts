import { Component } from '@angular/core';
import { DashBoardTabs } from '../Shared/dashBoardTabs.enum';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent
{
  public DashBoardTabs = DashBoardTabs;
  private selectedTab: DashBoardTabs = DashBoardTabs.NewEntry;

  public changeTab(tab: DashBoardTabs)
  {
    this.selectedTab = tab;
  }

  public isTabSelected(tab: DashBoardTabs): boolean
  {
    return tab === this.selectedTab;
  }

  constructor() { }
}
