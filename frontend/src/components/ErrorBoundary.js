import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'error.light'
                    }}
                >
                    <Typography variant="h6" color="error" gutterBottom>
                        Something went wrong with this section.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Please try refreshing the page.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => window.location.reload()}
                        size="small"
                    >
                        Refresh Page
                    </Button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <Box sx={{ mt: 2, textAlign: 'left', overflow: 'auto', maxHeight: 200, bgcolor: 'grey.100', p: 1, fontSize: '0.75rem' }}>
                            <pre>{this.state.error.toString()}</pre>
                        </Box>
                    )}
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
