import Remit, { CRMRemit, Organisation } from '../../../../../src/v3/crm/account/remit';

describe('Remit', () => {
  describe('mapToOrganisation', () => {
    test('GIVEN a DVA Remit WHEN called THEN the DVA Organisation is returned', () => {
      expect(Remit.mapToOrganisation(CRMRemit.DVA)).toEqual(Organisation.DVA);
    });
    test('GIVEN a DVSA England Remit WHEN called THEN the DVSA Organisation is returned', () => {
      expect(Remit.mapToOrganisation(CRMRemit.DVSA_ENGLAND)).toEqual(Organisation.DVSA);
    });
    test('GIVEN a DVSA Scotland Remit WHEN called THEN the DVSA Organisation is returned', () => {
      expect(Remit.mapToOrganisation(CRMRemit.DVSA_SCOTLAND)).toEqual(Organisation.DVSA);
    });
    test('GIVEN a DVSA Wales Remit WHEN called THEN the DVSA Organisation is returned', () => {
      expect(Remit.mapToOrganisation(CRMRemit.DVSA_WALES)).toEqual(Organisation.DVSA);
    });
    test('GIVEN undefined WHEN called THEN the DVSA Organisation is returned', () => {
      expect(Remit.mapToOrganisation(undefined)).toEqual(Organisation.DVSA);
    });
  });
});
