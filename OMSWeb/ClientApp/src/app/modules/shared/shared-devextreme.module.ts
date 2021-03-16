import { NgModule } from '@angular/core';
import { DxTemplateModule } from 'devextreme-angular/core';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';

@NgModule({
  exports: [DxPopoverModule, DxTemplateModule, DxSelectBoxModule],
})
export class SharedDevextremeModule {}
