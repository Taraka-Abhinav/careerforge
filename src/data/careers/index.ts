import type { SEORoadmapPage } from '../../types/seo';
import { aiEngineer } from './ai-engineer';
import { softwareEngineer } from './software-engineer';
import { frontendDeveloper } from './frontend-developer';
import { backendDeveloper } from './backend-developer';
import { fullstackDeveloper } from './fullstack-developer';
import { dataScientist } from './data-scientist';
import { machineLearningEngineer } from './machine-learning-engineer';
import { cybersecurityEngineer } from './cybersecurity-engineer';
import { cloudEngineer } from './cloud-engineer';
import { devopsEngineer } from './devops-engineer';
import { blockchainDeveloper } from './blockchain-developer';
import { gameDeveloper } from './game-developer';
import { mobileAppDeveloper } from './mobile-app-developer';
import { embeddedSystemsEngineer } from './embedded-systems-engineer';
import { roboticsEngineer } from './robotics-engineer';
import { mechanicalEngineer } from './mechanical-engineer';
import { civilEngineer } from './civil-engineer';
import { electricalEngineer } from './electrical-engineer';
import { electronicsEngineer } from './electronics-engineer';
import { aerospaceEngineer } from './aerospace-engineer';
import { automobileEngineer } from './automobile-engineer';
import { chemicalEngineer } from './chemical-engineer';
import { biomedicalEngineer } from './biomedical-engineer';
import { industrialEngineer } from './industrial-engineer';
import { mechatronicsEngineer } from './mechatronics-engineer';

export const careerRoadmaps: Record<string, SEORoadmapPage> = {
  'ai-engineer': aiEngineer,
  'software-engineer': softwareEngineer,
  'frontend-developer': frontendDeveloper,
  'backend-developer': backendDeveloper,
  'fullstack-developer': fullstackDeveloper,
  'data-scientist': dataScientist,
  'machine-learning-engineer': machineLearningEngineer,
  'cybersecurity-engineer': cybersecurityEngineer,
  'cloud-engineer': cloudEngineer,
  'devops-engineer': devopsEngineer,
  'blockchain-developer': blockchainDeveloper,
  'game-developer': gameDeveloper,
  'mobile-app-developer': mobileAppDeveloper,
  'embedded-systems-engineer': embeddedSystemsEngineer,
  'robotics-engineer': roboticsEngineer,
  'mechanical-engineer': mechanicalEngineer,
  'civil-engineer': civilEngineer,
  'electrical-engineer': electricalEngineer,
  'electronics-engineer': electronicsEngineer,
  'aerospace-engineer': aerospaceEngineer,
  'automobile-engineer': automobileEngineer,
  'chemical-engineer': chemicalEngineer,
  'biomedical-engineer': biomedicalEngineer,
  'industrial-engineer': industrialEngineer,
  'mechatronics-engineer': mechatronicsEngineer,
};

export default careerRoadmaps;
