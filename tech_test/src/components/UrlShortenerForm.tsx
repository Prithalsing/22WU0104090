'use client';
import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Divider,
  Grid,
  Stack,
  Chip
} from '@mui/material';
import { Add, Remove, ContentCopy } from '@mui/icons-material';
import { logger } from '@/lib/logging-middleware';

interface UrlForm {
  url: string;
  validity: number;
  shortcode: string;
}

interface ShortenedUrl {
  shortcode: string;
  shortUrl: string;
  originalUrl: string;
  expiresAt: string;
}

export default function UrlShortenerForm() {
  const [forms, setForms] = useState<UrlForm[]>([{ url: '', validity: 30, shortcode: '' }]);
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { url: '', validity: 30, shortcode: '' }]);
      logger.info('frontend', 'component', 'Added new URL form');
    }
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      setForms(forms.filter((_, i) => i !== index));
      logger.info('frontend', 'component', 'Removed URL form');
    }
  };

  const updateForm = (index: number, field: keyof UrlForm, value: string | number) => {
    const updated = [...forms];
    updated[index] = { ...updated[index], [field]: value };
    setForms(updated);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('frontend', 'component', 'URL copied to clipboard');
    } catch {
      logger.error('frontend', 'component', 'Failed to copy URL');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    logger.info('frontend', 'api', 'Starting URL shortening process');

    try {
      const promises = forms.map(async (form) => {
        if (!form.url.trim()) return null;
        const res = await fetch('/api/shorturls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: form.url,
            validity: form.validity,
            shortcode: form.shortcode || undefined,
          }),
        });

        if (!res.ok) throw new Error((await res.json()).error || 'Failed to shorten URL');
        return await res.json();
      });

      const responses = await Promise.all(promises);
      setResults(responses.filter(Boolean));
      logger.info('frontend', 'api', `Shortened ${responses.filter(Boolean).length} URLs`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(msg);
      logger.error('frontend', 'api', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 6, px: 2 }}>
      <Paper 
        elevation={8}
        sx={{ 
          p: 5, 
          borderRadius: 4, 
          maxWidth: 800, 
          mx: 'auto',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h4" 
            fontWeight="700" 
            gutterBottom
            sx={{ 
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            URL Shortener
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 500, 
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}
          >
            Transform your long URLs into short, shareable links with custom expiry times and optional shortcodes.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {forms.map((form, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #fff 0%, #fafbfc 100%)',
                  border: '2px solid',
                  borderColor: 'grey.100',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                  }
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      URL Link
                    </Typography>
                  </Box>
                  {forms.length > 1 && (
                    <IconButton 
                      size="medium" 
                      color="error" 
                      onClick={() => removeForm(index)}
                      sx={{
                        bgcolor: 'error.50',
                        '&:hover': {
                          bgcolor: 'error.100',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <Remove />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Enter your URL"
                      placeholder="https://example.com/very-long-url..."
                      value={form.url}
                      onChange={(e) => updateForm(index, 'url', e.target.value)}
                      type="url"
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Validity Period (minutes)"
                      type="number"
                      value={form.validity}
                      onChange={(e) => updateForm(index, 'validity', parseInt(e.target.value) || 30)}
                      inputProps={{ min: 1, max: 10080 }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode"
                      placeholder="e.g., mylink123"
                      value={form.shortcode}
                      onChange={(e) => updateForm(index, 'shortcode', e.target.value)}
                      inputProps={{ pattern: '^[a-zA-Z0-9]+$' }}
                      helperText="Optional • Letters & numbers only"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              {forms.length < 5 && (
                <Button 
                  variant="outlined" 
                  startIcon={<Add />} 
                  onClick={addForm}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.2)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  Add Another URL
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={loading || forms.every(f => !f.url.trim())}
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 6,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                  },
                  '&:disabled': {
                    background: 'grey.300'
                  },
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'Processing...' : 'Shorten URLs'}
              </Button>
            </Box>
          </Stack>
        </form>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 4, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light'
            }}
          >
            {error}
          </Alert>
        )}

        {results.length > 0 && (
          <>
            <Divider sx={{ my: 5 }}>
              <Chip 
                label="Your Shortened Links" 
                sx={{ 
                  px: 3, 
                  py: 0.5, 
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  color: 'white'
                }} 
              />
            </Divider>
            
            <Stack spacing={3}>
              {results.map((res, idx) => (
                <Paper
                  key={idx}
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    border: '1px solid',
                    borderColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                    }
                  }}
                >
                  <Box flex={1}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1.5,
                        wordBreak: 'break-all',
                        fontSize: '0.95rem'
                      }}
                    >
                      Original: {res.originalUrl}
                    </Typography>
                    <Chip
                      label={res.shortUrl}
                      color="primary"
                      onClick={() => window.open(res.shortUrl, '_blank')}
                      sx={{ 
                        mb: 1,
                        fontSize: '1rem',
                        fontWeight: 600,
                        px: 2,
                        py: 0.5,
                        cursor: 'pointer',
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s'
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      display="block"
                      sx={{ fontWeight: 500 }}
                    >
                      Expires: {new Date(res.expiresAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <IconButton 
                    color="primary" 
                    onClick={() => copyToClipboard(res.shortUrl)}
                    size="large"
                    sx={{
                      ml: 2,
                      bgcolor: 'white',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                      '&:hover': {
                        bgcolor: 'primary.50',
                        transform: 'scale(1.1)',
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <ContentCopy />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}