import React from 'react';
import { Box, IconButton, Tooltip, Zoom } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WhatsAppButton = () => {
  const phoneNumber = '2348162534599';
  const message = 'Hello Hills Capital, I have a question about your services.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.7)',
          },
          '70%': {
            boxShadow: '0 0 0 15px rgba(37, 211, 102, 0)',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)',
          },
        },
      }}
    >
      <Tooltip 
        title="Chat with us on WhatsApp" 
        placement="left"
        TransitionComponent={Zoom}
        arrow
      >
        <IconButton
          component="a"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            backgroundColor: '#25D366',
            color: 'white',
            width: 60,
            height: 60,
            '&:hover': {
              backgroundColor: '#128C7E',
            },
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
          }}
          size="large"
        >
          <WhatsAppIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default WhatsAppButton;
