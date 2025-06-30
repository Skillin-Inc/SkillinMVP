export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage: string | null;
};

export interface TeachingExperience {
  experienceList: { expertise: string; years: string }[];
  certifications: string[];
  portfolios: string[];
}

export type Verification = {
  idFront: string | null;
  idBack: string | null;
};

export interface TeacherInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
