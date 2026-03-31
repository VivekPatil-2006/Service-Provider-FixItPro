import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import api from '../services/api';

export default function ServiceStepsPage({ bookingId, open, onClose }) {
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stepLoading, setStepLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Fetch steps and completed steps
  useEffect(() => {
    if (!bookingId || !open) return;
    setLoading(true);
    api.get(`/bookings/${bookingId}/steps`).then(({ data }) => {
      setSteps(data.steps || []);
      setCompletedSteps(data.completedSteps || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [bookingId, open]);

  // Timer logic (background-safe)
  useEffect(() => {
    if (!open) return;
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [open]);

  const handleStepCheck = async (order) => {
    setStepLoading(true);
    try {
      await api.patch(`/bookings/${bookingId}/steps`, { stepOrder: order });
      setCompletedSteps((prev) => [...prev, order]);
    } catch {}
    setStepLoading(false);
  };

  const handleRequestOtp = async () => {
    setOtpRequested(false);
    setOtpError('');
    setOtpSuccess('');
    try {
      await api.post(`/bookings/${bookingId}/request-otp`);
      setOtpRequested(true);
    } catch (err) {
      setOtpError('Failed to request OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await api.post(`/bookings/${bookingId}/verify-otp`, { otp });
      setOtpSuccess('Booking completed!');
      setTimeout(() => onClose(true), 1200);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP');
    }
    setVerifying(false);
  };

  const allStepsCompleted = steps.length > 0 && completedSteps.length === steps.length;

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Service Steps</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={2}>
            {steps.map((step, idx) => (
              <Box key={step.order} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Checkbox
                  checked={completedSteps.includes(step.order)}
                  disabled={completedSteps.includes(step.order) || stepLoading || step.order !== (completedSteps[completedSteps.length - 1] || 0) + 1}
                  onChange={() => handleStepCheck(step.order)}
                />
                <Box>
                  <Typography fontWeight={700}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{step.description}</Typography>
                </Box>
              </Box>
            ))}
            {allStepsCompleted && !otpRequested && (
              <Button variant="contained" onClick={handleRequestOtp} disabled={stepLoading}>
                Request OTP
              </Button>
            )}
            {otpRequested && (
              <Stack spacing={1}>
                <Typography>Enter OTP sent to customer (use <b>123456</b>):</Typography>
                <TextField
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  label="OTP"
                  inputProps={{ maxLength: 6 }}
                  disabled={verifying}
                />
                <Button variant="contained" onClick={handleVerifyOtp} disabled={verifying || otp.length !== 6}>
                  {verifying ? 'Verifying...' : 'Verify OTP & Complete'}
                </Button>
                {otpError && <Alert severity="error">{otpError}</Alert>}
                {otpSuccess && <Alert severity="success">{otpSuccess}</Alert>}
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
