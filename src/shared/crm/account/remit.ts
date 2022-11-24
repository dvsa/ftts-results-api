export enum Organisation {
  DVA = 0,
  DVSA = 1,
}

export enum CRMRemit {
  DVA = 675030001,
  DVSA_ENGLAND = 675030000,
  DVSA_SCOTLAND = 675030003,
  DVSA_WALES = 675030002,
}

export default class Remit {
  public static mapToOrganisation(remit: CRMRemit | undefined): Organisation {
    switch (remit) {
      case CRMRemit.DVA:
        return Organisation.DVA;
      case CRMRemit.DVSA_ENGLAND:
      case CRMRemit.DVSA_SCOTLAND:
      case CRMRemit.DVSA_WALES:
      default:
        return Organisation.DVSA;
    }
  }
}
