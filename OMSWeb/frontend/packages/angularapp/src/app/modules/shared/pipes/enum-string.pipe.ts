import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumString'
})
export class EnumStringPipe implements PipeTransform {

  transform(value: any, enumType: string): any {
    let type;
    switch (enumType) {
      case 'value':

        break;

      default:
        break;
    }
    return null;
  }

}
