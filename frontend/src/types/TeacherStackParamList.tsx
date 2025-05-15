import { PersonalInfo, TeachingExperience, Verification } from './TeacherFormTypes';

export type TeacherStackParamList = {
  ApplicationStart: undefined;
  PersonalInfo: undefined;

  TeachingExperience: PersonalInfo;

  Verification: PersonalInfo & TeachingExperience;

  ReviewSubmit: PersonalInfo & TeachingExperience & Verification;
};
