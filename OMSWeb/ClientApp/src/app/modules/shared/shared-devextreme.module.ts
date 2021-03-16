import { NgModule } from '@angular/core';
import { DxTemplateModule } from 'devextreme-angular/core';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';

@NgModule({
  exports: [DxPopoverModule, DxTemplateModule],
})
export class SharedDevextremeModule {}
