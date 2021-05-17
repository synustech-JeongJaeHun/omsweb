import { NgModule } from '@angular/core';
import { DxTemplateModule } from 'devextreme-angular/core';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxAutocompleteModule } from 'devextreme-angular/ui/autocomplete';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { DxFileManagerModule } from 'devextreme-angular/ui/file-manager';
import { DxoPermissionsModule } from 'devextreme-angular/ui/nested';
import { DxSortableModule } from 'devextreme-angular/ui/sortable';
import { DxColorBoxModule } from 'devextreme-angular/ui/color-box';

@NgModule({
  exports: [
    DxPopoverModule,
    DxTemplateModule,
    DxSelectBoxModule,
    DxAutocompleteModule,
    DxTabPanelModule,
    DxTabsModule,
    DxDataGridModule,
    DxButtonModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxTooltipModule,
    DxFileManagerModule,
    DxoPermissionsModule,
    DxSortableModule,
    DxColorBoxModule,
  ],
})
export class SharedDevextremeModule {}
