'use client';
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { Link as LinkIcon, Analytics } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <AppBar position="static" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            URL Shortener
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              href="/"
              variant={pathname === '/' ? 'outlined' : 'text'}
              sx={{
                borderColor: pathname === '/' ? 'white' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Shorten URLs
            </Button>
            <Button
              color="inherit"
              component={Link}
              href="/analytics"
              variant={pathname === '/analytics' ? 'outlined' : 'text'}
              startIcon={<Analytics />}
              sx={{
                borderColor: pathname === '/analytics' ? 'white' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Analytics
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}