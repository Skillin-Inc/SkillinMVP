import { PersonalInfo, TeachingExperience, Verification } from './TeacherFormTypes';

export type TeacherStackParamList = {
  PersonalInfo: undefined;
  TeachingExperience: PersonalInfo;
  Verification: PersonalInfo & TeachingExperience;
  ReviewSubmit: PersonalInfo & TeachingExperience & {
    idFront: string | null;
    idBack: string | null;
  };
  ApplicationStart: undefined;
};
