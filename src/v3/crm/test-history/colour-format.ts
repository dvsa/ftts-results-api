import { SARASColourFormat } from '../../../shared/interfaces';

export enum CRMColourFormats {
  NA = 0,
  FORMAT_ONE = 1,
  FORMAT_TWO = 2,
  FORMAT_THREE = 3,
}

export class CRMColourFormat {
  public static mapFromSARAS(deliveryMode: SARASColourFormat | undefined): CRMColourFormats | undefined {
    switch (deliveryMode) {
      case undefined:
        return undefined;
      case SARASColourFormat.NA:
        return CRMColourFormats.NA;
      case SARASColourFormat.FORMAT_ONE:
        return CRMColourFormats.FORMAT_ONE;
      case SARASColourFormat.FORMAT_TWO:
        return CRMColourFormats.FORMAT_TWO;
      case SARASColourFormat.FORMAT_THREE:
        return CRMColourFormats.FORMAT_THREE;
      default:
        throw new Error(`Error Mapping SARASColourFormat - value ${deliveryMode as SARASColourFormat}`);
    }
  }
}
