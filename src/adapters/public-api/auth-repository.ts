import { Logger } from '@/adapters';
import { type HttpClient } from '@/adapters/http';
import { HttpResponse, Session, SessionStorage } from '@/application';
import {
  AuthRepository,
  AuthRepositoryLogin,
  AuthRepositoryLogout,
  type AuthToken,
  Credentials,
} from '@/domain';

/**
 * Common browser headers used for TrainingPeaks API requests
 */
const BROWSER_HEADERS = {
  'sec-ch-ua':
    '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
} as const;

type AuthRepositoryDependencies = {
  httpClient: HttpClient;
  sessionStorage: SessionStorage;
  logger: Logger;
};

const submitLogin = async (
  httpClient: HttpClient,
  requestVerificationToken: string,
  credentials: Credentials
) => {
  const formData = new URLSearchParams({
    Username: credentials.username,
    __RequestVerificationToken: requestVerificationToken,
    Password: credentials.password,
  });

  return await httpClient.post<string>(
    'https://home.trainingpeaks.com/login',
    formData.toString(),
    {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'null',
        priority: 'u=0, i',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        ...BROWSER_HEADERS,
      },
    }
  );
};

type TPTokenResponse = {
  success: boolean;
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    expires: string;
  };
};

const getAuthToken = async (
  httpClient: HttpClient,
  cookies: string
): Promise<HttpResponse<TPTokenResponse>> => {
  return await httpClient.get<TPTokenResponse>(
    'https://tpapi.trainingpeaks.com/users/v3/token',
    {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        origin: 'https://app.trainingpeaks.com',
        priority: 'u=1, i',
        referer: 'https://app.trainingpeaks.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Cookie: cookies,
        ...BROWSER_HEADERS,
      },
    }
  );
};

// Tipos específicos para la respuesta de usuario de TrainingPeaks
type TPAthlete = {
  athleteId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  cellPhone: string | null;
  age: number;
  athleteType: number;
  userType: number;
  lastPlannedWorkout: string | null;
  settings: unknown;
  personPhotoUrl: string | null;
  coachedBy: number | null;
  userName: string;
  lastUpgradeOn: string | null;
  downgradeAllowed: boolean;
  expireOn: string;
  premiumTrial: boolean;
  premiumTrialDaysRemaining: number;
  downgradeAllowedOn: string;
  workoutIndexState: number;
  prCalcState: number;
};

type TPAccountSettings = {
  accountSettingsId: number;
  userType: number;
  isAthlete: boolean;
  headerImageUrl: string;
  headerLink: string;
  helpUrl: string;
  logonFailedUrl: string;
  logOffUrl: string;
  displayTrainingPeaksLogo: boolean;
  coachType: number;
  isCoached: boolean;
  isPremium: boolean;
  accessGroupIds: number[];
  premiumTrial: boolean;
  lastLogon: string;
};

type TPCalendarSettings = {
  compactView: boolean;
  showAvailability: boolean;
  showNotes: boolean;
  showWorkouts: boolean;
  showStrengthWorkouts: boolean;
  showNutrition: boolean;
  showMetrics: boolean;
  showSummary: boolean;
  showFitnessFormFatigue: boolean;
  showComplianceColoring: boolean;
  showWeather: boolean;
  orderComplianceBy: string[];
  focusEventId: number | null;
  workoutLabelLayout: number[];
  weekSummaryAtpLayout: number[];
  showPayments: boolean;
};

type TPWorkoutLayout = {
  [key: string]: number[];
};

type TPWorkoutSettings = {
  layout: TPWorkoutLayout;
};

type TPMetric = {
  type: number;
};

type TPDateOptions = {
  quickDateSelectOption: number | null;
  startDate: string | null;
  endDate: string | null;
};

type TPDashboardPod = {
  workoutTypeIds?: string[];
  quickDateSelectOption?: number;
  showTSSPerDay?: boolean;
  showIntensityFactorPerDay?: boolean;
  showTSBFill?: boolean;
  atlConstant?: number;
  atlStartValue?: number;
  showSecondAtlSeries?: boolean;
  atlConstant2?: number;
  atlStartValue2?: number;
  ctlConstant?: number;
  ctlStartValue?: number;
  index: number;
  chartType: number;
  title: string | null;
  dateOptions: TPDateOptions;
  durationUnits?: number;
  summaryType?: number;
  dateGrouping?: number;
  caloriesType?: number;
  includeGoalCalories?: boolean;
  peakType?: number;
  useComparison?: boolean;
  displayState?: number;
  comparisonDateOptions?: TPDateOptions;
  tags?: unknown;
  showPlanned?: boolean;
  hideAverage?: boolean;
  units?: number | null;
  showMarkers?: boolean;
  dataFields?: number[];
  powerProfileGrouping?: number;
  displayCategoryLabels?: boolean;
  displayCaloriesConsumed?: boolean;
  displayCaloriesExpended?: boolean;
  displayBy?: number;
};

type TPDashboardSettings = {
  pods: TPDashboardPod[];
  dateOptions: TPDateOptions;
};

type TPLayoutPod = {
  index: number;
  podType: number;
  heightInRows: number;
  widthInColumns: number;
  columns?: number[] | null;
  useComparison?: boolean;
  dateOptions?: TPDateOptions | null;
  displayState?: number;
};

type TPLayout = {
  pods: TPLayoutPod[];
  workoutTypeId: number;
};

type TPExpandoSettings = {
  layouts: TPLayout[];
  mapType: string;
};

type TPPromptPreferences = {
  showPairUnpairModal: boolean;
  showWelcome: boolean;
  showGoalsAssistanceBanner: boolean;
  showUnpairConfirmationModal: boolean;
  'showWhatsNew:CALENDAR_NOTES_ATHLETE': boolean;
  showQuickViewTips: boolean;
  contextMenuTip: boolean;
  showEnterEventModal: boolean;
  showExpandoTips: boolean;
  searchChalkboard: boolean;
  showComplete: boolean;
  recuringNewChip: boolean;
  weatherNewChip: boolean;
  garminMaxStepsWarning: boolean;
};

type TPPromptChoices = {
  searchChalkboard: string;
  showEnterEventModal: string;
  showQuickViewTips: string;
  showExpandoTips: string;
  showComplete: string;
  showLandingSelection: string;
};

type TPPromptDates = {
  searchChalkboard: string;
  showEnterEventModal: string;
  showQuickViewTips: string;
  showExpandoTips: string;
  showComplete: string;
  showGoalsAssistanceBanner: string;
  autoDismissNotifications: string;
};

type TPPromptSettings = {
  promptPreferences: TPPromptPreferences;
  promptChoices: TPPromptChoices;
  promptDates: TPPromptDates;
};

type TPSearchSettings = {
  exactMatch: boolean;
  displayedColumns: string[];
  sortBy: string;
  sortOrder: number;
};

type TPLimiterSettings = {
  hours: {
    showSwimLimiters: boolean;
    showBikeLimiters: boolean;
    showRunLimiters: boolean;
    showStrengthPhase: boolean;
  };
  tss: {
    showSwimLimiters: boolean;
    showBikeLimiters: boolean;
    showRunLimiters: boolean;
    showStrengthPhase: boolean;
  };
  ctl: {
    showSwimLimiters: boolean;
    showBikeLimiters: boolean;
    showRunLimiters: boolean;
    showStrengthPhase: boolean;
  };
};

type TPATPSettings = {
  displayGraph: boolean;
  displayPlannedCTL: boolean;
  displayActualCTL: boolean;
  displayPlannedTSB: boolean;
  displayActualTSB: boolean;
  displaySettings: unknown;
  limiterSettings: TPLimiterSettings;
};

type TPGeneralSettings = {
  defaultLandingPage: string;
  initialLoadedGroup: unknown | null;
  language: string | null;
};

type TPExperimentsSettings = {
  openLibrary: unknown | null;
};

type TPAffiliateSettings = {
  affiliateId: number;
  code: string;
  isTrainingPeaks: boolean;
};

type TPAppleWatchSettings = {
  autoSendWorkouts: string;
};

type TPPrivacySettings = {
  womensHealthMetrics: unknown;
  comments: unknown;
};

type TPSettings = {
  account: TPAccountSettings;
  calendar: TPCalendarSettings;
  workout: TPWorkoutSettings;
  metrics: TPMetric[];
  dashboard: TPDashboardSettings;
  expando: TPExpandoSettings;
  prompt: TPPromptSettings;
  search: TPSearchSettings;
  atp: TPATPSettings;
  general: TPGeneralSettings;
  experiments: TPExperimentsSettings;
  affiliate: TPAffiliateSettings;
  appleWatch: TPAppleWatchSettings;
  privacy: TPPrivacySettings;
};

type TPUserResponse = {
  user: {
    userId: number;
    settings: TPSettings;
    athletes: TPAthlete[];
    personId: number;
    accountSettingsId: number;
    userName: string;
    email: string;
    isEmailVerified: boolean;
    firstName: string;
    lastName: string;
    userType: number;
    userIdentifierHash: string;
    expireDate: string;
    premiumTrial: boolean;
    premiumTrialDaysRemaining: number;
    lastLogon: string;
    numberOfVisits: number;
    created: string;
    age: number;
    birthday: string;
    gender: string;
    dateFormat: string;
    timeZone: string;
    units: number;
    temperatureUnit: number;
    windSpeedUnit: number;
    allowMarketingEmails: boolean;
    address: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
    phone: string | null;
    cellPhone: string | null;
    language: string;
    latitude: number | null;
    longitude: number | null;
    personPhotoUrl: string | null;
    affiliateId: number;
    isAthlete: boolean;
    fullName: string;
  };
  accountStatus: {
    status: number;
    lockedOut: boolean;
    demoExpired: boolean;
    pastDue: boolean;
    pastDueAccountSetup: boolean;
    tooManyBasicAthletes: boolean;
    isAthlete: boolean;
    isCoachedAthlete: boolean;
    isCoach: boolean;
    isCoachingGroupOwner: boolean;
    athleteInZuoraSystem: boolean;
    lockedOutOfMobile: boolean;
    coachingGroupId: number | null;
    coachingGroupOwnerId: number | null;
    billingTier: number;
    maximumBasicAthletes: number;
    paymentRequired: boolean;
  };
};

const getUser = async (
  httpClient: HttpClient,
  authToken: AuthToken
): Promise<HttpResponse<TPUserResponse>> => {
  return await httpClient.get<TPUserResponse>(
    'https://tpapi.trainingpeaks.com/users/v3/user',
    {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-GB,en;q=0.9,es-ES;q=0.8,es;q=0.7,en-US;q=0.6',
        authorization: `Bearer ${authToken.accessToken}`,
        'content-type': 'application/json',
        origin: 'https://app.trainingpeaks.com',
        priority: 'u=1, i',
        referer: 'https://app.trainingpeaks.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        ...BROWSER_HEADERS,
      },
    }
  );
};

const getRequestVerificationToken = (html: string): string | null => {
  // Extract all input elements from the form
  const inputMatches = html.match(/<input[^>]+>/g) || [];

  for (const input of inputMatches) {
    // Look for the __RequestVerificationToken input
    const nameMatch = input.match(/name="__RequestVerificationToken"/);
    if (nameMatch) {
      // Extract the value
      const valueMatch = input.match(/value="([^"]*)"/);
      return valueMatch?.[1] || null;
    }
  }

  return null;
};

const createLogin = (deps: AuthRepositoryDependencies): AuthRepositoryLogin => {
  return async (credentials: Credentials) => {
    const response = await deps.httpClient.get<string>(
      'https://home.trainingpeaks.com/login',
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.success) {
      throw new Error('Failed to get request verification token');
    }

    if (!response.data) {
      throw new Error('No response data received from login page');
    }

    const requestVerificationToken = getRequestVerificationToken(response.data);

    if (!requestVerificationToken) {
      throw new Error('Request verification token not found');
    }

    const submitLoginResponse = await submitLogin(
      deps.httpClient,
      requestVerificationToken,
      credentials
    );

    if (!submitLoginResponse.success) {
      throw new Error('Failed to submit login');
    }

    const tpAuthCookie = submitLoginResponse.cookies?.find((cookie) =>
      cookie.includes('Production_tpAuth')
    );

    if (!tpAuthCookie) {
      throw new Error('TP Auth cookie not found');
    }

    // Get the auth token using the cookies
    const authTokenResponse = await getAuthToken(deps.httpClient, tpAuthCookie);

    if (!authTokenResponse.success) {
      throw new Error('Failed to get auth token');
    }

    if (!authTokenResponse.data) {
      throw new Error('No auth token data received');
    }

    const authToken = authTokenResponse.data.token;

    // Get user information using the auth token
    const userResponse = await getUser(deps.httpClient, {
      accessToken: authToken.access_token,
      tokenType: authToken.token_type,
      expiresIn: authToken.expires_in,
      expires: new Date(authToken.expires),
      refreshToken: authToken.refresh_token,
      scope: authToken.scope,
    });

    if (!userResponse.success) {
      throw new Error('Failed to get user information');
    }

    if (!userResponse.data) {
      throw new Error('No user data received');
    }

    const userData = userResponse.data;

    const session: Session = {
      token: {
        accessToken: authToken.access_token,
        tokenType: authToken.token_type,
        expiresIn: authToken.expires_in,
        expires: new Date(authToken.expires),
        refreshToken: authToken.refresh_token,
        scope: authToken.scope,
      },
      user: {
        id: userData.user.userId.toString(),
        name:
          userData.user.fullName ||
          `${userData.user.firstName} ${userData.user.lastName}`.trim(),
        avatar: userData.user.personPhotoUrl || undefined,
      },
    };

    await deps.sessionStorage.set(session);

    return session;
  };
};

const createLogout = (
  deps: AuthRepositoryDependencies
): AuthRepositoryLogout => {
  return async () => {
    await deps.sessionStorage.clear();
  };
};

export const createAuthRepository = (
  deps: AuthRepositoryDependencies
): AuthRepository => {
  return {
    login: createLogin(deps),
    logout: createLogout(deps),
  };
};
