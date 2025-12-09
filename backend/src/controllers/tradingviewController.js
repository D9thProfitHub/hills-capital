import jwt from 'jsonwebtoken';
import axios from 'axios';
import db from '../models/index.js';
const { User } = db;

// Cache for storing TradingView sessions
const sessionCache = new Map();
const SESSION_EXPIRY = 3600 * 1000; // 1 hour in milliseconds

// TradingView authentication URLs
const TRADINGVIEW_BASE_URL = 'https://www.tradingview.com';
const TRADINGVIEW_LOGIN_URL = `${TRADINGVIEW_BASE_URL}/accounts/signin/`;

// Scanner credentials from environment variables
const SCANNER_CREDENTIALS = {
  'scandex-pro': {
    email: process.env.SCANDEX_EMAIL,
    password: process.env.SCANDEX_PASSWORD
  },
  'sniper-entry': {
    email: process.env.SNIPER_EMAIL,
    password: process.env.SNIPER_PASSWORD
  },
  'trend-wave-pro': {
    email: process.env.TRENDWAVE_EMAIL,
    password: process.env.TRENDWAVE_PASSWORD
  },
  'trend-pro': {
    email: process.env.TRENDPRO_EMAIL,
    password: process.env.TRENDPRO_PASSWORD
  }
};

// Mock scanner data for fallback when TradingView authentication fails
const MOCK_SCANNER_DATA = {
  'scandex-pro': {
    name: 'ScanDex Pro Scanner',
    description: 'Professional market scanner for identifying trading opportunities',
    url: 'https://www.tradingview.com/embed-widget/screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22523%22%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22crypto_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Afalse%7D',
    features: ['Real-time scanning', 'Custom filters', 'Alert system']
  },
  'sniper-entry': {
    name: 'Sniper Entry Scanner',
    description: 'Precision entry point scanner for optimal trade timing',
    url: 'https://www.tradingview.com/embed-widget/forex-cross-rates/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22currencies%22%3A%5B%22EUR%22%2C%22USD%22%2C%22JPY%22%2C%22GBP%22%2C%22CHF%22%2C%22AUD%22%2C%22CAD%22%2C%22NZD%22%5D%2C%22isTransparent%22%3Afalse%2C%22colorTheme%22%3A%22dark%22%7D',
    features: ['Entry signals', 'Risk management', 'Backtesting']
  },
  'trend-wave-pro': {
    name: 'Trend Wave Pro Scanner',
    description: 'Advanced trend analysis and wave pattern recognition',
    url: 'https://www.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%2212M%22%2C%22showChart%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22plotLineColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22plotLineColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22gridLineColor%22%3A%22rgba(240%2C%20243%2C%20250%2C%200)%22%2C%22scaleFontColor%22%3A%22rgba(120%2C%20123%2C%20134%2C%201)%22%2C%22belowLineFillColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorGrowingBottom%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22belowLineFillColorFallingBottom%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22symbolActiveColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22tabs%22%3A%5B%7B%22title%22%3A%22Indices%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FOREXCOM%3ASPX500%22%2C%22d%22%3A%22S%26P%20500%22%7D%2C%7B%22s%22%3A%22FOREXCOM%3ANSXUSD%22%2C%22d%22%3A%22US%20100%22%7D%2C%7B%22s%22%3A%22FOREXCOM%3ADJI%22%2C%22d%22%3A%22Dow%2030%22%7D%2C%7B%22s%22%3A%22INDEX%3ANKY%22%2C%22d%22%3A%22Nikkei%20225%22%7D%2C%7B%22s%22%3A%22INDEX%3ADEU40%22%2C%22d%22%3A%22DAX%20Index%22%7D%2C%7B%22s%22%3A%22FOREXCOM%3AUKXGBP%22%2C%22d%22%3A%22UK%20100%22%7D%5D%2C%22originalTitle%22%3A%22Indices%22%7D%2C%7B%22title%22%3A%22Futures%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22CME_MINI%3AES1!%22%2C%22d%22%3A%22S%26P%20500%22%7D%2C%7B%22s%22%3A%22CME%3A6E1!%22%2C%22d%22%3A%22Euro%22%7D%2C%7B%22s%22%3A%22COMEX%3AGC1!%22%2C%22d%22%3A%22Gold%22%7D%2C%7B%22s%22%3A%22NYMEX%3ACL1!%22%2C%22d%22%3A%22Crude%20Oil%22%7D%2C%7B%22s%22%3A%22NYMEX%3ANG1!%22%2C%22d%22%3A%22Natural%20Gas%22%7D%2C%7B%22s%22%3A%22CBOT%3AZC1!%22%2C%22d%22%3A%22Corn%22%7D%5D%2C%22originalTitle%22%3A%22Futures%22%7D%2C%7B%22title%22%3A%22Bonds%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22CBOT%3AZB1!%22%2C%22d%22%3A%22T-Bond%22%7D%2C%7B%22s%22%3A%22CBOT%3AUB1!%22%2C%22d%22%3A%22Ultra%20T-Bond%22%7D%2C%7B%22s%22%3A%22EUREX%3AFGBL1!%22%2C%22d%22%3A%22Euro%20Bund%22%7D%2C%7B%22s%22%3A%22EUREX%3AFBTP1!%22%2C%22d%22%3A%22Euro%20BTP%22%7D%2C%7B%22s%22%3A%22EUREX%3AFGBM1!%22%2C%22d%22%3A%22Euro%20BOBL%22%7D%5D%2C%22originalTitle%22%3A%22Bonds%22%7D%5D%7D',
    features: ['Wave analysis', 'Trend identification', 'Pattern recognition']
  },
  'trend-pro': {
    name: 'Trend Pro Scanner',
    description: 'Professional trend analysis and momentum tracking',
    url: 'https://www.tradingview.com/embed-widget/technical-analysis/?locale=en#%7B%22interval%22%3A%221m%22%2C%22width%22%3A%22100%25%22%2C%22isTransparent%22%3Afalse%2C%22height%22%3A%22400%22%2C%22symbol%22%3A%22NASDAQ%3AAAPL%22%2C%22showIntervalTabs%22%3Atrue%2C%22displayMode%22%3A%22single%22%2C%22colorTheme%22%3A%22dark%22%7D',
    features: ['Momentum analysis', 'Support/Resistance', 'Volume analysis']
  }
};

// Helper function to authenticate with TradingView
async function authenticateWithTradingView(scannerId) {
  const credentials = SCANNER_CREDENTIALS[scannerId];
  if (!credentials || !credentials.email || !credentials.password) {
    console.warn(`[${new Date().toISOString()}] No valid credentials found for scanner: ${scannerId}, using fallback`);
    return createFallbackSession(scannerId);
  }

  try {
    console.log(`[${new Date().toISOString()}] Authenticating with TradingView for scanner: ${scannerId}`);
    
    // Create a new axios instance with default config
    const client = axios.create({
      baseURL: TRADINGVIEW_BASE_URL,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000, // Reduced timeout
      maxRedirects: 3,
      validateStatus: (status) => status < 500
    });

    // Try to get the session cookie from the homepage with shorter timeout
    console.log(`[${new Date().toISOString()}] Fetching initial session cookie from TradingView...`);
    const initResponse = await client.get('/', {
      timeout: 10000 // 10 second timeout for initial request
    });
    
    console.log(`[${new Date().toISOString()}] Initial response status: ${initResponse.status} ${initResponse.statusText}`);
    
    // Extract cookies from response
    const cookies = initResponse.headers['set-cookie'] ? 
      initResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ') : 
      '';
    
    if (!cookies) {
      console.warn(`[${new Date().toISOString()}] No cookies received in initial response, using fallback for scanner: ${scannerId}`);
      return createFallbackSession(scannerId);
    }
    
    console.log(`[${new Date().toISOString()}] Received initial cookies:`, cookies);

    // Then, authenticate
    console.log(`[${new Date().toISOString()}] Authenticating with TradingView...`);
    const authData = new URLSearchParams({
      username: credentials.email,
      password: credentials.password,
      remember: 'on'
    });
    
    const authResponse = await client.post(TRADINGVIEW_LOGIN_URL, authData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': `${TRADINGVIEW_BASE_URL}/accounts/signin/`,
        'Cookie': cookies,
        'Accept': 'application/json, text/plain, */*',
        'X-Requested-With': 'XMLHttpRequest'
      },
      maxRedirects: 0, // Don't follow redirects
      validateStatus: (status) => status < 400 || status === 302 // Allow 302 redirect
    });

    console.log(`[${new Date().toISOString()}] Authentication response status: ${authResponse.status} ${authResponse.statusText}`);
    
    // Check for successful authentication
    if (authResponse.status === 302 || (authResponse.data && authResponse.data.user)) {
      // Get the final cookies after authentication
      const finalCookies = authResponse.headers['set-cookie'] ? 
        authResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ') : 
        cookies;
      
      if (!finalCookies) {
        throw new Error('No session cookies received after authentication');
      }
      
      console.log(`[${new Date().toISOString()}] Successfully authenticated with TradingView`);
      
      // Cache the session
      const sessionData = {
        cookies: finalCookies,
        expiry: Date.now() + SESSION_EXPIRY,
        user: authResponse.data?.user || { username: credentials.email },
        authenticatedAt: new Date().toISOString()
      };
      
      sessionCache.set(scannerId, sessionData);
      return sessionData;
    } else {
      console.error(`[${new Date().toISOString()}] Authentication failed. Response:`, {
        status: authResponse.status,
        statusText: authResponse.statusText,
        data: authResponse.data,
        headers: authResponse.headers,
        request: {
          method: authResponse.config.method,
          url: authResponse.config.url,
          headers: authResponse.config.headers,
          data: authResponse.config.data
        }
      });
      throw new Error('Authentication failed: Invalid response from TradingView');
    }
  } catch (error) {
    console.warn(`[${new Date().toISOString()}] TradingView authentication failed for scanner ${scannerId}:`, error.message);
    console.log(`[${new Date().toISOString()}] Falling back to mock data for scanner: ${scannerId}`);
    return createFallbackSession(scannerId);
  }
}

// Create a fallback session when TradingView authentication fails
function createFallbackSession(scannerId) {
  const mockData = MOCK_SCANNER_DATA[scannerId];
  if (!mockData) {
    throw new Error(`No fallback data available for scanner: ${scannerId}`);
  }

  console.log(`[${new Date().toISOString()}] Creating fallback session for scanner: ${scannerId}`);
  
  const sessionData = {
    cookies: 'fallback_session=true',
    expiry: Date.now() + SESSION_EXPIRY,
    user: { username: `fallback_${scannerId}` },
    authenticatedAt: new Date().toISOString(),
    isFallback: true,
    scannerData: mockData
  };
  
  sessionCache.set(scannerId, sessionData);
  return sessionData;
}

// Get or create a TradingView session
const getTradingViewSession = async (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${requestId}] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  };
  
  try {
    const { scannerId } = req.params;
    log(`Starting TradingView session request for scanner: ${scannerId}`);
    
    if (!scannerId || !SCANNER_CREDENTIALS[scannerId]) {
      const error = new Error(`Invalid or missing scanner ID: ${scannerId}`);
      log('Validation error', { error: error.message, scannerId });
      
      if (res.headersSent) {
        return next(error);
      }
      throw error;
    }

    // Check if we have a valid cached session
    const cachedSession = sessionCache.get(scannerId);
    if (cachedSession && cachedSession.expiry > Date.now()) {
      const expiresIn = Math.floor((cachedSession.expiry - Date.now()) / 1000);
      const result = {
        success: true,
        scannerId,
        cookies: cachedSession.cookies,
        expiry: cachedSession.expiry,
        expiresIn,
        fromCache: true
      };
      
      log('Returning cached session', { 
        expiresIn: `${expiresIn}s`, 
        expiry: new Date(cachedSession.expiry).toISOString() 
      });
      
      if (res.headersSent) {
        return result;
      }
      
      return res.json({
        success: true,
        session: result
      });
    }

    log('No valid cached session found, authenticating with TradingView...');
    
    try {
      const session = await authenticateWithTradingView(scannerId);
      
      if (!session || !session.cookies) {
        throw new Error('Failed to authenticate with TradingView: No session data returned');
      }
      
      // Ensure we have an expiry time
      const expiry = session.expiry || (Date.now() + SESSION_EXPIRY);
      const expiresIn = Math.floor((expiry - Date.now()) / 1000);
      
      // Cache the session
      const sessionData = {
        cookies: session.cookies,
        expiry: expiry,
        user: session.user
      };
      
      sessionCache.set(scannerId, sessionData);
      
      const result = {
        success: true,
        scannerId,
        cookies: session.cookies,
        expiry: expiry,
        expiresIn: expiresIn,
        authenticatedAt: session.authenticatedAt || new Date().toISOString()
      };
      
      log('Successfully authenticated with TradingView', { 
        expiresIn: `${expiresIn}s`,
        expiry: new Date(expiry).toISOString()
      });
      
      if (res.headersSent) {
        return result;
      }
      
      return res.json({
        success: true,
        session: result
      });
      
    } catch (authError) {
      log('Authentication failed', { error: authError.message });
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const statusCode = error.response?.status || 500;
    
    log('Error getting TradingView session', { 
      error: errorMessage,
      statusCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    if (res.headersSent) {
      return next(error);
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      requestId,
      timestamp: new Date().toISOString()
    });
  } finally {
    const duration = Date.now() - startTime;
    log(`Request completed in ${duration}ms`);
  }
};

// Generate a JWT token for the scanner iframe
const generateScannerToken = async (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${requestId}] [TokenGen] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  };
  
  try {
    const { scannerId } = req.params;
    const userId = req.user?.id;
    
    log(`Generating scanner token for user ${userId}, scanner: ${scannerId}`);

    // Validate scanner ID (allow both configured scanners and mock scanners)
    if (!scannerId || (!SCANNER_CREDENTIALS[scannerId] && !MOCK_SCANNER_DATA[scannerId])) {
      const error = new Error(`Invalid or unknown scanner ID: ${scannerId}`);
      log('Validation error', { error: error.message });
      return res.status(400).json({
        success: false,
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      });
    }

    // Validate user authentication
    if (!userId) {
      const error = new Error('User not authenticated');
      log('Authentication error', { error: error.message });
      return res.status(401).json({
        success: false,
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    log('Getting TradingView session...');
    
    // Create a mock response object to capture the session
    const mockRes = {
      json: (data) => {
        log('Received session data from getTradingViewSession', { 
          hasData: !!data,
          hasSession: !!(data?.session),
          success: data?.success
        });
        
        if (data?.success && data.session) {
          return data.session;
        }
        throw new Error(data?.error || 'Invalid session data');
      },
      status: () => mockRes,
      send: () => {},
      headersSent: false,
      setHeader: () => {}
    };
    
    // Get or create a TradingView session
    let session;
    try {
      session = await getTradingViewSession(
        { ...req, params: { ...req.params, scannerId } },
        mockRes,
        (error) => {
          log('Error in getTradingViewSession callback', { 
            error: error?.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
          });
          throw error || new Error('Failed to get TradingView session');
        }
      );
      
      log('Successfully retrieved TradingView session', { 
        hasCookies: !!(session?.cookies),
        expiry: session?.expiry ? new Date(session.expiry).toISOString() : 'none'
      });
      
    } catch (sessionError) {
      log('Failed to get TradingView session', { 
        error: sessionError.message,
        stack: process.env.NODE_ENV === 'development' ? sessionError.stack : undefined
      });
      
      return res.status(500).json({
        success: false,
        error: `Failed to initialize TradingView session: ${sessionError.message}`,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate session (allow both real sessions and fallback sessions)
    if (!session || (!session.cookies && !session.isFallback)) {
      const error = new Error('No valid session received from TradingView');
      log('Session validation error', { error: error.message });
      
      return res.status(500).json({
        success: false,
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate a JWT token for the iframe
    log('Generating JWT token...');
    
    try {
      const token = jwt.sign(
        { 
          id: userId,
          scannerId,
          type: 'scanner_auth',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        },
        process.env.JWT_SECRET,
        { 
          algorithm: 'HS256'
        }
      );
      
      log('Successfully generated JWT token');
      
      const response = {
        success: true,
        token,
        scannerId,
        expiresIn: 3600, // 1 hour in seconds
        requestId,
        timestamp: new Date().toISOString(),
        isFallback: session.isFallback || false,
        scannerUrl: session.isFallback ? session.scannerData?.url : null,
        scannerName: session.isFallback ? session.scannerData?.name : null
      };
      
      return res.json(response);
      
    } catch (tokenError) {
      log('Failed to generate JWT token', { 
        error: tokenError.message,
        stack: process.env.NODE_ENV === 'development' ? tokenError.stack : undefined
      });
      
      return res.status(500).json({
        success: false,
        error: `Failed to generate scanner token: ${tokenError.message}`,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const statusCode = error.response?.status || 500;
    
    log('Unexpected error generating scanner token', { 
      error: errorMessage,
      statusCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      requestId,
      timestamp: new Date().toISOString()
    });
  } finally {
    const duration = Date.now() - startTime;
    log(`Token generation completed in ${duration}ms`);
  }
};

// Export all controller functions and credentials
export default {
  getTradingViewSession,
  generateScannerToken,
  authenticateWithTradingView,
  SCANNER_CREDENTIALS
};
