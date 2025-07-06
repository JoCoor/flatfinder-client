export type Flat {
  _id: string;
  city: string;
  streetName: string;
  streetNumber: string;
  areaSize: number;
  hasAc: boolean;
  yearBuilt: number;
  rentPrice: number;
  dateAvailable: string;
  ownerId: {
    firstName: string;
    lastName: string;
  };
}
