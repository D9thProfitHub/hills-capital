import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const TradingViewWidget = () => {
    const container = useRef();

    useEffect(() => {
        const currentContainer = container.current;
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbols": [
                {
                    "proName": "FOREXCOM:SPXUSD",
                    "title": "S&P 500"
                },
                {
                    "proName": "FOREXCOM:NSXUSD",
                    "title": "US 100"
                },
                {
                    "proName": "FX_IDC:EURUSD",
                    "title": "EUR/USD"
                },
                {
                    "proName": "BITSTAMP:BTCUSD",
                    "title": "Bitcoin"
                },
                {
                    "proName": "BITSTAMP:ETHUSD",
                    "title": "Ethereum"
                }
            ],
            "showSymbolLogo": true,
            "colorTheme": "dark",
            "isTransparent": false,
            "displayMode": "adaptive",
            "locale": "en"
        });

        if (currentContainer) {
            currentContainer.appendChild(script);
        }

        return () => {
            if (currentContainer) {
                currentContainer.innerHTML = '';
            }
        };
    }, []);

    return (
        <Box className="tradingview-widget-container" ref={container} sx={{ width: '100%', height: '50px' }}>
            <div className="tradingview-widget-container__widget"></div>
        </Box>
    );
};

export default TradingViewWidget;
