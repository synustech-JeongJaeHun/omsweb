import { NgModule } from '@angular/core';
import { DxTemplateModule } from 'devextreme-angular/core';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxAutocompleteModule } from 'devextreme-angular/ui/autocomplete';

@NgModule({
  exports: [DxPopoverModule, DxTemplateModule, DxSelectBoxModule, DxAutocompleteModule],
})
export class SharedDevextremeModule {}
