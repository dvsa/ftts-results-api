/* eslint-disable no-underscore-dangle */
import { CRMBookingProduct } from '../../shared/crm/booking-product/interfaces';

export const getOwnerIdBind = (bookingProduct: CRMBookingProduct): string => {
  const ownerId: string = bookingProduct._ownerid_value;

  if (bookingProduct?._owningteam_value === ownerId) {
    return `/teams(${ownerId})`;
  }

  if (bookingProduct?._owninguser_value === ownerId) {
    return `/systemusers(${ownerId})`;
  }

  throw new Error(`crm-utils::getOwnerIdBind: Booking Product owner id: ${bookingProduct._ownerid_value} does not match the owning team (${bookingProduct._owningteam_value as string}) or user (${bookingProduct._owninguser_value as string})`);
};
