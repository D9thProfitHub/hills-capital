import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment,
  Chip,
  IconButton,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  TabPanel,
  TabContext,
  TabList
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Star as StarIcon, 
  StarBorder as StarBorderIcon,
  TrendingUp,
  TrendingDown,
  CurrencyExchange,
  CurrencyBitcoin,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  ShowChart as ChartIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { getCryptocurrencies, getForexRates, getHistoricalData } from '../api/markets';

// Format large numbers
const formatNumber = (num, digits = 2) => {
  if (!num) return '0';
  const absNum = Math.abs(Number(num));
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(digits) + 'B';
  }
  if (absNum >= 1e6) {
    return (num / 1e6).toFixed(digits) + 'M';
  }
  if (absNum >= 1e3) {
    return (num / 1e3).toFixed(digits) + 'K';
  }
  return num.toFixed(digits);
};

// Format price based on its value
const formatPrice = (price) => {
  if (!price) return '0';
  const num = Number(price);
  if (num >= 1000) return num.toFixed(2);
  if (num >= 0.1) return num.toFixed(4);
  return num.toFixed(8);
};

const Markets = () => {
  const [activeTab, setActiveTab] = useState('crypto');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('7');
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch market data
  const { data: cryptoData, isLoading: isCryptoLoading } = useQuery('crypto', getCryptocurrencies, {
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  const { data: forexData, isLoading: isForexLoading } = useQuery('forex', getForexRates, {
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  // Load chart data when an asset is selected
  useEffect(() => {
    if (selectedAsset) {
      const fetchChartData = async () => {
        const data = await getHistoricalData(selectedAsset.id, timeRange);
        setChartData(data);
      };
      fetchChartData();
    }
  }, [selectedAsset, timeRange]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedAsset(null); // Reset selected asset when switching tabs
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(['crypto', 'forex']);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Filter data based on search query
  const filteredCrypto = cryptoData
    ? cryptoData.filter(crypto => 
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredForex = forexData
    ? Object.entries(forexData).filter(([pair]) => 
        pair.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(([pair, data]) => ({
        pair,
        ...data,
        id: pair.replace('/', '').toLowerCase(),
        price: data.rate,
        volume: formatNumber(Math.random() * 1000000000, 2) // Mock volume
      }))
    : [];

  const renderPriceChange = (change, isPercent = true) => {
    if (change === undefined || change === null) return null;
    const isPositive = change >= 0;
    const value = isPercent ? Math.abs(change).toFixed(2) : formatNumber(change, 2);
    const suffix = isPercent ? '%' : '';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', color: isPositive ? 'success.main' : 'error.main' }}>
        {isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
        <Typography variant="body2" sx={{ ml: 0.5 }}>
          {value}{suffix}
        </Typography>
      </Box>
    );
  };

  const renderMarketTable = (data, type) => {
    const isLoading = type === 'crypto' ? isCryptoLoading : isForexLoading;
    const isCrypto = type === 'crypto';
    
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!data || data.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography>No data available</Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">24h Change</TableCell>
              <TableCell align="right">24h High</TableCell>
              <TableCell align="right">24h Low</TableCell>
              <TableCell align="right">24h Volume</TableCell>
              {isCrypto && <TableCell align="right">Market Cap</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.id} 
                hover 
                onClick={() => handleAssetSelect(item)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                  backgroundColor: selectedAsset?.id === item.id ? 'action.selected' : 'inherit'
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isCrypto && item.image && (
                      <Avatar 
                        src={item.image} 
                        alt={item.name}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {isCrypto ? item.name : item.pair}
                      </Typography>
                      {isCrypto && (
                        <Typography variant="caption" color="text.secondary">
                          {item.symbol.toUpperCase()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    ${formatPrice(isCrypto ? item.current_price : item.price)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {renderPriceChange(
                    isCrypto 
                      ? item.price_change_percentage_24h 
                      : item.change,
                    true
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    ${isCrypto ? item.high_24h?.toFixed(2) : item.high?.toFixed(4)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    ${isCrypto ? item.low_24h?.toFixed(2) : item.low?.toFixed(4)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    ${isCrypto 
                      ? formatNumber(item.total_volume, 2) 
                      : item.volume}
                  </Typography>
                </TableCell>
                {isCrypto && (
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${formatNumber(item.market_cap, 2)}
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderChart = () => {
    if (!selectedAsset || chartData.length === 0) {
      return (
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Select an asset to view chart</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6">
              {selectedAsset.name || selectedAsset.pair}
              <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                {selectedAsset.symbol ? `(${selectedAsset.symbol.toUpperCase()})` : ''}
              </Typography>
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ${formatPrice(selectedAsset.current_price || selectedAsset.price)}
              {selectedAsset.price_change_percentage_24h !== undefined && (
                <Box component="span" sx={{ 
                  ml: 2, 
                  fontSize: '1rem', 
                  color: selectedAsset.price_change_percentage_24h >= 0 ? 'success.main' : 'error.main' 
                }}>
                  {selectedAsset.price_change_percentage_24h >= 0 ? '+' : ''}
                  {selectedAsset.price_change_percentage_24h?.toFixed(2)}%
                </Box>
              )}
            </Typography>
          </Box>
          <Box>
            {['24h', '7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                size="small"
                variant={timeRange === range.replace(/[^0-9]/g, '') ? 'contained' : 'outlined'}
                onClick={() => handleTimeRangeChange(range.replace(/[^0-9]/g, ''))}
                sx={{ ml: 1, minWidth: '40px' }}
              >
                {range}
              </Button>
            ))}
          </Box>
        </Box>
        
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (timeRange === '1') return new Date(value).toLocaleTimeString();
                return new Date(value).toLocaleDateString();
              }}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tickFormatter={(value) => `$${value}`}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Price']}
              labelFormatter={(value) => `Date: ${new Date(value).toLocaleString()}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={theme.palette.primary.main} 
              dot={false}
              strokeWidth={2}
              name="Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Markets
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time prices and market data
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isCryptoLoading || isForexLoading}
        >
          Refresh Data
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={selectedAsset ? 7 : 12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  <Tab 
                    value="crypto" 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CurrencyBitcoin sx={{ mr: 1 }} />
                        <span>Cryptocurrencies</span>
                      </Box>
                    } 
                  />
                  <Tab 
                    value="forex" 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CurrencyExchange sx={{ mr: 1 }} />
                        <span>Forex</span>
                      </Box>
                    } 
                  />
                </Tabs>
              </Box>
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Search ${activeTab === 'forex' ? 'forex pairs' : 'cryptocurrencies'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {activeTab === 'forex' 
                ? renderMarketTable(filteredForex, 'forex')
                : renderMarketTable(filteredCrypto, 'crypto')
              }
            </CardContent>
          </Card>
        </Grid>

        {selectedAsset && (
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Price Chart</Typography>
                  <Button 
                    size="small" 
                    onClick={() => setSelectedAsset(null)}
                    startIcon={<ArrowForwardIcon />}
                  >
                    Close
                  </Button>
                </Box>
                {renderChart()}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Markets;
