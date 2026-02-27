import { config } from 'dotenv';
config();

import '@/ai/flows/classify-skin-condition-flow.ts';
import '@/ai/flows/preprocess-analyze-image-flow.ts';