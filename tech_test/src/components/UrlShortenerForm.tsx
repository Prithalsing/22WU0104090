'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  IconButton,
  Divider,
  Grid,
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
  const [forms, setForms] = useState<UrlForm[]>([
    { url: '', validity: 30, shortcode: '' }
  ]);
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
      const newForms = forms.filter((_, i) => i !== index);
      setForms(newForms);
      logger.info('frontend', 'component', 'Removed URL form');
    }
  };

  const updateForm = (index: number, field: keyof UrlForm, value: string | number) => {
    const newForms = [...forms];
    newForms[index] = { ...newForms[index], [field]: value };
    setForms(newForms);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('frontend', 'component', 'URL copied to clipboard');
    } catch (error) {
      logger.error('frontend', 'component', 'Failed to copy URL to clipboard');
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

        const response = await fetch('/api/shorturls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: form.url,
            validity: form.validity,
            shortcode: form.shortcode || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to shorten URL');
        }

        return await response.json();
      });

      const responses = await Promise.all(promises);
      const validResults = responses.filter(Boolean);
      
      setResults(validResults);
      logger.info('frontend', 'api', `Successfully shortened ${validResults.length} URLs`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error('frontend', 'api', `URL shortening failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Shorten Your URLs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter up to 5 URLs to shorten them with custom validity periods and optional shortcodes.
          </Typography>

          <form onSubmit={handleSubmit}>
            {forms.map((form, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    URL #{index + 1}
                  </Typography>
                  {forms.length > 1 && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeForm(index)}
                    >
                      <Remove />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="URL to shorten"
                      placeholder="https://example.com/very/long/url"
                      value={form.url}
                      onChange={(e) => updateForm(index, 'url', e.target.value)}
                      required
                      type="url"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      type="number"
                      value={form.validity}
                      onChange={(e) => updateForm(index, 'validity', parseInt(e.target.value) || 30)}
                      inputProps={{ min: 1, max: 10080 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Custom shortcode (optional)"
                      placeholder="mylink"
                      value={form.shortcode}
                      onChange={(e) => updateForm(index, 'shortcode', e.target.value)}
                      inputProps={{ pattern: '^[a-zA-Z0-9]+$' }}
                      helperText="Only letters and numbers allowed"
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {forms.length < 5 && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addForm}
                >
                  Add Another URL
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={loading || forms.every(f => !f.url.trim())}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Shortening...' : 'Shorten URLs'}
              </Button>
            </Box>
          </form>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {results.length > 0 && (
            <Box>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Shortened URLs
              </Typography>
              {results.map((result, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Original: {result.originalUrl}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        Short URL: {result.shortUrl}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires: {new Date(result.expiresAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <IconButton
                      color="primary"
                      onClick={() => copyToClipboard(result.shortUrl)}
                      title="Copy to clipboard"
                    >
                      <ContentCopy />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}