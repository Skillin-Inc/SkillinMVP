export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  zipCode: string;
  profileImage: string | null;
};

export type TeachingExperience = {
  experienceList: { expertise: string; years: string }[];
  certifications: string[];
  portfolios: string[];
};

export type Verification = {
  idFront: string | null;
  idBack: string | null;
};
