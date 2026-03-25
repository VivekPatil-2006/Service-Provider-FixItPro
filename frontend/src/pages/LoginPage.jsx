import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/send-otp', { mobile });
      setOtpSent(true);
      setDebugOtp(data.debugOtp || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { mobile, otp });
      setAuth(data.token, data.provider);
      if (data.isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(120deg, #e9eef6 0%, #f8fbff 55%, #dceeff 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h4" fontWeight={700}>
                Service Provider Login
              </Typography>
              <Typography color="text.secondary">
                Login with mobile number and OTP
              </Typography>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <TextField
                label="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={otpSent}
                fullWidth
              />

              {!otpSent ? (
                <Button variant="contained" size="large" onClick={handleSendOtp} disabled={loading}>
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Send OTP'}
                </Button>
              ) : (
                <>
                  <TextField
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    fullWidth
                  />
                  {debugOtp ? (
                    <Alert severity="info">Dev OTP: {debugOtp} (remove this in production)</Alert>
                  ) : null}
                  <Button variant="contained" size="large" onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify OTP'}
                  </Button>
                  <Button onClick={() => { setOtpSent(false); setOtp(''); setDebugOtp(''); }}>
                    Change Mobile Number
                  </Button>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
