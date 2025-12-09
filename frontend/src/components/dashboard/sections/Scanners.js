import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const ScannerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  height: 'calc(100vh - 200px)',
  minHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
}));

const ScannerTabs = styled(Tabs)({
  marginBottom: '16px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#3f51b5',
  },
});

const ScannerTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 600,
  minWidth: '120px',
});

const ScannerContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  minHeight: '400px',
});

const ScannerIframe = styled('iframe')({
  border: 'none',
  flex: 1,
  width: '100%',
  minHeight: '500px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
});

const LoadingContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: 10,
});

const ErrorContainer = styled(Box)({
  padding: '20px',
  backgroundColor: '#ffebee',
  borderRadius: '4px',
  marginTop: '20px',
  textAlign: 'center',
});

const scanners = [
  { 
    id: 'scandex-pro', 
    name: 'SCANDEX PRO',
    description: 'Advanced market scanner for identifying trading opportunities',
    widgetUrl: 'https://s3.tradingview.com/embed-widget/screener/'
  },
  { 
    id: 'sniper-entry', 
    name: 'SNIPER ENTRY',
    description: 'Precision entry points for optimal trade execution',
    widgetUrl: 'https://s3.tradingview.com/embed-widget/screener/'
  },
  { 
    id: 'trend-wave-pro', 
    name: 'TREND WAVE PRO',
    description: 'Identify and ride market trends with confidence',
    widgetUrl: 'https://s3.tradingview.com/embed-widget/screener/'
  },
  { 
    id: 'trend-pro', 
    name: 'TREND PRO',
    description: 'Professional trend analysis and signal generation',
    widgetUrl: 'https://s3.tradingview.com/embed-widget/screener/'
  }
];

const Scanners = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scannerUrl, setScannerUrl] = useState('');
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [scannerName, setScannerName] = useState('');
  const iframeRef = useRef(null);
  const { token } = useAuth();

  // Memoize the scanner URL fetching function
  const fetchScannerUrl = useCallback(async (scannerId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the token from localStorage to ensure it's fresh
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching scanner token for:', scannerId);
      
      // Get a token for the scanner using the axios instance
      const response = await api.get(`/api/tradingview/token/${scannerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to authenticate with scanner');
      }
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      // Handle fallback URLs from backend or use configured URLs
      let scannerUrl;
      if (data.isFallback && data.scannerUrl) {
        // Use fallback URL from backend
        scannerUrl = data.scannerUrl;
        setIsFallbackMode(true);
        setScannerName(data.scannerName || 'Trading Scanner');
        console.log('Using fallback scanner URL:', scannerUrl);
        console.log('Scanner name:', data.scannerName);
      } else {
        // Use configured URL with token
        const baseUrl = scanners.find(s => s.id === scannerId)?.widgetUrl || '';
        scannerUrl = `${baseUrl}?auth_token=${data.token}`;
        setIsFallbackMode(false);
        setScannerName('');
        console.log('Generated scanner URL with token:', scannerUrl);
      }
      
      return scannerUrl;
    } catch (error) {
      console.error('Error getting scanner URL:', error);
      setError(error.message || 'Failed to load scanner');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleTabChange = async (event, newValue) => {
    setActiveTab(newValue);
    const scannerId = scanners[newValue]?.id;
    if (scannerId) {
      try {
        const url = await fetchScannerUrl(scannerId);
        setScannerUrl(url);
      } catch (error) {
        console.error('Error changing scanner tab:', error);
      }
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError('Failed to load scanner. Please try again later.');
    setIsLoading(false);
  };

  const retryLoading = async () => {
    const scannerId = scanners[activeTab]?.id;
    if (scannerId) {
      try {
        const url = await fetchScannerUrl(scannerId);
        setScannerUrl(url);
      } catch (error) {
        console.error('Error retrying scanner load:', error);
      }
    }
  };

  // Load initial scanner
  useEffect(() => {
    const scannerId = scanners[activeTab]?.id;
    if (scannerId) {
      fetchScannerUrl(scannerId)
        .then(url => setScannerUrl(url))
        .catch(error => console.error('Error loading scanner:', error));
    }
  }, [activeTab, fetchScannerUrl]);

  return (
    <ScannerContainer elevation={3}>
      <Typography variant="h5" gutterBottom>
        Trading Scanners
      </Typography>
      
      <ScannerTabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="trading scanners"
      >
        {scanners.map((scanner) => (
          <ScannerTab 
            key={scanner.id} 
            label={scanner.name} 
            disabled={isLoading}
          />
        ))}
      </ScannerTabs>

      <ScannerContent>
        {isFallbackMode && (
          <Alert severity="info" style={{ marginBottom: '16px' }}>
            <Typography variant="body2">
              <strong>Demo Mode:</strong> Displaying {scannerName} in demo mode. 
              Live scanner authentication is temporarily unavailable.
            </Typography>
          </Alert>
        )}
        
        {isLoading && (
          <LoadingContainer>
            <CircularProgress />
            <Typography variant="body1" style={{ marginTop: '16px' }}>
              Loading {scanners[activeTab]?.name}...
            </Typography>
          </LoadingContainer>
        )}
        
        {error ? (
          <ErrorContainer>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={retryLoading}
              style={{ marginTop: '10px' }}
            >
              Retry
            </Button>
          </ErrorContainer>
        ) : (
          <ScannerIframe
            ref={iframeRef}
            src={scannerUrl}
            title={scanners[activeTab]?.name}
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
        
        {!isLoading && !error && (
          <Box mt={2}>
            <Typography variant="h6">{scanners[activeTab]?.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {scanners[activeTab]?.description}
            </Typography>
          </Box>
        )}
      </ScannerContent>
    </ScannerContainer>
  );
};

export default Scanners;
