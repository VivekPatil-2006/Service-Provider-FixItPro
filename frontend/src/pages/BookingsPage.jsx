import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import api from '../services/api';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings');
      setBookings(data.bookings || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ mt: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Assigned Bookings
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {bookings.map((booking) => (
        <Card key={booking._id} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h6">{booking.serviceType.replaceAll('_', ' ')}</Typography>
                <Typography color="text.secondary">Customer: {booking.customerName}</Typography>
                <Typography color="text.secondary">Address: {booking.customerAddress}</Typography>
                <Typography color="text.secondary">
                  Schedule: {new Date(booking.scheduledAt).toLocaleString()}
                </Typography>
                <Typography color="text.secondary">Amount: ₹{booking.amount}</Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Stack spacing={1}>
                  <Chip
                    label={booking.status}
                    color={
                      booking.status === 'COMPLETED'
                        ? 'success'
                        : booking.status === 'ACCEPTED'
                          ? 'info'
                          : booking.status === 'REJECTED'
                            ? 'error'
                            : 'warning'
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={() => handleStatus(booking._id, 'ACCEPTED')}>
                      Accept
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleStatus(booking._id, 'REJECTED')}>
                      Reject
                    </Button>
                    <Button variant="outlined" color="success" onClick={() => handleStatus(booking._id, 'COMPLETED')}>
                      Complete
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {!bookings.length ? <Alert severity="info">No bookings assigned yet.</Alert> : null}
    </Stack>
  );
}
