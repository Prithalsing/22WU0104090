import React from 'react';
import { Container, Box } from '@mui/material';
import Navigation from '@/components/Navigation';
import UrlShortenerForm from '@/components/UrlShortenerForm';

export default function Home() {
  return (
    <>
      <Navigation />
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <UrlShortenerForm />
        </Box>
      </Container>
    </>
  );
}