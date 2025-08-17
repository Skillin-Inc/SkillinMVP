export * from "./navigation";
export { User } from "../services/api/";

// Teacher signup flow types
export interface PersonalInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string; // Support both phone and phoneNumber
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  profileImage?: string | null;
}

export interface ExperienceItem {
  expertise?: string;
  years?: string;
}

export interface TeachingExperience {
  subjects?: string[];
  experienceYears?: number;
  previousExperience?: string;
  teachingStyle?: string;
  availability?: string[];
  experienceList?: ExperienceItem[];
  certifications?: string[];
  portfolios?: string[];
}
