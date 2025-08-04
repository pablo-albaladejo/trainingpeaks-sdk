/* eslint-disable no-console */
import { createTrainingPeaksSdk } from '@/sdk/training-peaks-sdk';

const sdk = createTrainingPeaksSdk({});

sdk
  .login({ username: 'trainingpeaks-sdk', password: 'wN$Fg#gkNPm!@49' })
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
