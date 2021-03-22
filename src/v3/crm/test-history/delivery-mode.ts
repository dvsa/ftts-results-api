import { SARASDeliveryMode } from '../../../shared/interfaces';

export enum CRMDeliveryModes {
  IHTTC = 1,
  PERMANENT_TEST_CENTRE = 2,
  OCCASIONAL_TEST_CENTRE = 675030002,
  AT_HOME = 675030003,
}

export class CRMDeliveryMode {
  public static mapFromSARAS(deliveryMode: SARASDeliveryMode | undefined): CRMDeliveryModes | undefined {
    switch (deliveryMode) {
      case undefined:
        return undefined;
      case SARASDeliveryMode.IHTTC:
        return CRMDeliveryModes.IHTTC;
      case SARASDeliveryMode.PERMANENT_TEST_CENTRE:
        return CRMDeliveryModes.PERMANENT_TEST_CENTRE;
      case SARASDeliveryMode.OCCASIONAL_TEST_CENTRE:
        return CRMDeliveryModes.OCCASIONAL_TEST_CENTRE;
      case SARASDeliveryMode.AT_HOME:
        return CRMDeliveryModes.AT_HOME;
      default:
        throw new Error(`Error Mapping SARASDeliveryMode - value ${deliveryMode as SARASDeliveryMode}`);
    }
  }
}
