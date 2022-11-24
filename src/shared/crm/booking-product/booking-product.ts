import { CRMBookingProduct } from './interfaces';

const isOwedCompensationBooking = (bookingProduct: CRMBookingProduct): boolean => {
  return bookingProduct.ftts_bookingid.ftts_owedcompbookingassigned !== null
    && bookingProduct.ftts_bookingid.ftts_owedcompbookingrecognised === null;
};

export { isOwedCompensationBooking };
