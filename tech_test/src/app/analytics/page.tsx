'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import { Search, Analytics as AnalyticsIcon } from '@mui/icons-material';
import Navigation from '@/components/Navigation';
import { logger } from '@/lib/logging-middleware';

interface UrlStats {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  clickCount: number;
  clicks: {
    timestamp: string;
    referrer: string;
    location: string;
  }[];
}

export default function AnalyticsPage() {
  const [shortcode, setShortcode] = useState('');
  const [stats, setStats] = useState<UrlStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (code: string) => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setStats(null);

    logger.info('frontend', 'api', `Fetching analytics for shortcode: ${code}`);

    try {
      const response = await fetch(`/api/shorturls/${code}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
      logger.info('frontend', 'api', `Analytics fetched successfully for shortcode: ${code}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error('frontend', 'api', `Failed to fetch analytics: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(shortcode);
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnalyticsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">
                  URL Analytics
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter a shortcode to view detailed analytics including click count, referrers, and location data.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Shortcode"
                    placeholder="Enter shortcode (e.g., abc123)"
                    value={shortcode}
                    onChange={(e) => setShortcode(e.target.value)}
                    required
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Search />}
                    disabled={loading}
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? 'Searching...' : 'Get Stats'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {stats && (
            <Grid container spacing={3}>
              {/* URL Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      URL Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Shortcode
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {stats.shortcode}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Original URL
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {stats.originalUrl}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body1">
                        {new Date(stats.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Expires
                      </Typography>
                      <Typography variant="body1">
                        {new Date(stats.expiresAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Click Statistics */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Click Statistics
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h2" color="primary.main" fontWeight="bold">
                        {stats.clickCount}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Total Clicks
                      </Typography>
                    </Box>
                    {stats.clickCount > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={new Date() > new Date(stats.expiresAt) ? 'Expired' : 'Active'}
                          color={new Date() > new Date(stats.expiresAt) ? 'error' : 'success'}
                          size="small"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Click History */}
              {stats.clicks.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Click History
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Timestamp</TableCell>
                              <TableCell>Referrer</TableCell>
                              <TableCell>Location</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.clicks.map((click, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {new Date(click.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {click.referrer === 'Direct' ? (
                                    <Chip label="Direct" size="small" variant="outlined" />
                                  ) : (
                                    click.referrer
                                  )}
                                </TableCell>
                                <TableCell>{click.location}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Container>
    </>
  );
}