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
  Divider,
  Chip,
  InputAdornment,
  Fade,
  Step,
  Stepper,
  StepLabel,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  VpnKey as OtpIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
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
  const [success, setSuccess] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number starting with 6-9');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/send-otp', { mobile });
      setOtpSent(true);
      setDebugOtp(data.debugOtp || '');
      setSuccess('OTP sent successfully! Check your phone.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter a valid 6-digit OTP');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { mobile, otp });
      setSuccess('✅ Verification successful! Redirecting...');
      setAuth(data.token, data.provider);
      setTimeout(() => {
        if (data.isNewUser) {
          navigate('/onboarding');
        } else {
          navigate('/app/dashboard');
        }
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeMobile = () => {
    setOtpSent(false);
    setOtp('');
    setDebugOtp('');
    setError('');
    setSuccess('');
  };

  const steps = ['Enter Mobile', 'Verify OTP'];
  const currentStep = otpSent ? 1 : 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#edf2f7',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Box>
            {/* HEADER WITH BRANDING */}
            <Box sx={{ textAlign: 'center', mb: 4, color: '#0f172a' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <BusinessIcon sx={{ fontSize: 40, color: '#2563eb' }} />
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: 1 }}>
                  FixItPro
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Service Provider Portal
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569' }}>
                Secure and Easy Login
              </Typography>
            </Box>

            {/* MAIN CARD */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* PROGRESS STEPPER */}
                <Box sx={{ mb: 3 }}>
                  <Stepper activeStep={currentStep} sx={{ pt: 2 }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* ALERTS */}
                {error && (
                  <Fade in={!!error}>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
                        border: '1px solid #f5c6c6',
                        '& .MuiAlert-icon': { color: '#dc2626' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {error}
                      </Typography>
                    </Alert>
                  </Fade>
                )}

                {success && (
                  <Fade in={!!success}>
                    <Alert
                      severity="success"
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #ecfdf5 0%, #dbeafe 100%)',
                        border: '1px solid #86efac',
                        '& .MuiAlert-icon': { color: '#22c55e' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {success}
                      </Typography>
                    </Alert>
                  </Fade>
                )}

                {/* MOBILE INPUT SECTION */}
                {!otpSent ? (
                  <Fade in={!otpSent}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}
                        >
                          <PhoneIcon sx={{ color: '#667eea' }} />
                          Enter Your Mobile Number
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                          We'll send you a 6-digit OTP for verification
                        </Typography>

                        <TextField
                          fullWidth
                          placeholder="10-digit mobile number"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: '#667eea', mr: 1 }} />
                              </InputAdornment>
                            ),
                            endAdornment: mobile.length === 10 && (
                              <InputAdornment position="end">
                                <CheckCircleIcon sx={{ color: '#22c55e' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2.5,
                              fontSize: '1.1em',
                              fontWeight: 600,
                              background: '#f9fafb',
                              transition: 'all 0.3s ease',
                              '&:hover': { background: '#f3f4f6' },
                              '&.Mui-focused': {
                                background: 'white',
                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                              },
                            },
                            '& .MuiOutlinedInput-input': {
                              padding: '16px 14px',
                              letterSpacing: '0.05em',
                            },
                          }}
                        />

                        {mobile.length > 0 && mobile.length < 10 && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.8 }}>
                            ⚠️ Enter {10 - mobile.length} more digit{10 - mobile.length > 1 ? 's' : ''}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleSendOtp}
                        disabled={loading || mobile.length !== 10}
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                        sx={{
                          py: 1.8,
                          fontSize: '1.1em',
                          fontWeight: 700,
                          borderRadius: 2.5,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover:not(:disabled)': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)',
                          },
                          '&:disabled': {
                            opacity: 0.5,
                          },
                        }}
                      >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                      </Button>

                      {/* SECURITY INFO */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          background: 'linear-gradient(135deg, #f0f4ff 0%, #f5e6ff 100%)',
                          border: '1px solid #e0e7ff',
                          borderRadius: 2.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <SecurityIcon sx={{ color: '#667eea', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ color: '#4338ca', lineHeight: 1.6 }}>
                            Your data is secure. We use industry-standard encryption for all communications.
                          </Typography>
                        </Box>
                      </Paper>
                    </Stack>
                  </Fade>
                ) : (
                  /* OTP VERIFICATION SECTION */
                  <Fade in={otpSent}>
                    <Stack spacing={3}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <OtpIcon sx={{ color: '#764ba2' }} />
                            Enter OTP
                          </Typography>
                          <Chip
                            icon={<EditIcon />}
                            label={mobile}
                            onClick={handleChangeMobile}
                            variant="outlined"
                            size="small"
                            sx={{ cursor: 'pointer' }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                          6-digit code sent to {mobile} · Expires in 10 minutes
                        </Typography>

                        <TextField
                          fullWidth
                          placeholder="000000"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          disabled={loading}
                          inputProps={{
                            maxLength: 6,
                            style: { textAlign: 'center', letterSpacing: '8px', fontSize: '1.4em', fontWeight: 700 },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <OtpIcon sx={{ color: '#764ba2', mr: 1 }} />
                              </InputAdornment>
                            ),
                            endAdornment: otp.length === 6 && (
                              <InputAdornment position="end">
                                <CheckCircleIcon sx={{ color: '#22c55e' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2.5,
                              background: '#f9fafb',
                              transition: 'all 0.3s ease',
                              '&:hover': { background: '#f3f4f6' },
                              '&.Mui-focused': {
                                background: 'white',
                                boxShadow: '0 0 0 3px rgba(118, 75, 162, 0.1)',
                              },
                            },
                            '& .MuiOutlinedInput-input': {
                              padding: '20px 14px',
                            },
                          }}
                        />

                        {otp.length > 0 && otp.length < 6 && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.8 }}>
                            ⚠️ Enter {6 - otp.length} more digit{6 - otp.length > 1 ? 's' : ''}
                          </Typography>
                        )}
                      </Box>

                      {debugOtp && (
                        <Alert
                          severity="info"
                          sx={{
                            borderRadius: 2.5,
                            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                            border: '1px solid #93c5fd',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0369a1' }}>
                            🔑 Dev Mode: OTP is <strong>{debugOtp}</strong>
                          </Typography>
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length !== 6}
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                        sx={{
                          py: 1.8,
                          fontSize: '1.1em',
                          fontWeight: 700,
                          borderRadius: 2.5,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
                          boxShadow: '0 10px 30px rgba(118, 75, 162, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover:not(:disabled)': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 15px 40px rgba(118, 75, 162, 0.4)',
                          },
                          '&:disabled': {
                            opacity: 0.5,
                          },
                        }}
                      >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                      </Button>

                      <Button
                        variant="text"
                        onClick={handleChangeMobile}
                        disabled={loading}
                        sx={{
                          py: 1,
                          color: '#667eea',
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': { background: 'rgba(102, 126, 234, 0.1)' },
                        }}
                      >
                        ← Change Mobile Number
                      </Button>
                    </Stack>
                  </Fade>
                )}
              </CardContent>
            </Card>

            {/* FOOTER */}
            <Box sx={{ textAlign: 'center', mt: 3, color: 'white' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Having trouble logging in? Contact support
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
