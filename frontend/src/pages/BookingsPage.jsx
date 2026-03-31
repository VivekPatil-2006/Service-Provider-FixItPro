import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  acceptBooking,
  cancelBooking,
  fetchProviderBookings,
  rejectBooking,
  startService,
} from '../services/bookingWorkflowApi';
import ServiceStepsPage from './ServiceStepsPage';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'otp_sent', label: 'OTP Sent' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusStyle = {
  pending: { bgcolor: '#fff7e8', color: '#b45309', border: '1px solid #fcd9a5' },
  assigned: { bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  accepted: { bgcolor: '#ecfeff', color: '#0e7490', border: '1px solid #bae6fd' },
  in_progress: { bgcolor: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' },
  otp_sent: { bgcolor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
  completed: { bgcolor: '#ecfdf3', color: '#15803d', border: '1px solid #bbf7d0' },
  rejected: { bgcolor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
  cancelled: { bgcolor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' },
};

const getErrorText = (err, fallback) => err?.response?.data?.message || fallback;
const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const formatServiceType = (value) =>
  String(value || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const formatAmount = (booking) => {
  const pricing = booking?.pricing;
  if (pricing && typeof pricing === 'object') {
    const options = ['totalAmount', 'total', 'finalAmount', 'amount'];
    for (const key of options) {
      if (pricing[key] !== undefined && pricing[key] !== null) return Number(pricing[key]) || 0;
    }
  }

  return Number(booking?.amount) || 0;
};

const formatSchedule = (booking) => {
  const dateSource = booking?.scheduledDate || booking?.scheduledAt;
  const date = dateSource ? new Date(dateSource) : null;
  const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-CA') : 'Date unavailable';

  const start = booking?.timeSlot?.start || booking?.timeSlot?.startTime;
  const end = booking?.timeSlot?.end || booking?.timeSlot?.endTime;
  const timeText = start && end ? `${start} - ${end}` : 'Time unavailable';

  return `${dateText} at ${timeText}`;
};

const getCustomerName = (booking) => {
  if (booking?.customerName) return booking.customerName;
  if (booking?.userId?.name) return booking.userId.name;
  if (booking?.userName) return booking.userName;
  if (booking?.userId?.mobile) return booking.userId.mobile;
  return 'Customer';
};

const getServiceName = (booking) => {
  if (booking?.serviceId?.name) return booking.serviceId.name;
  if (booking?.serviceType) return formatServiceType(booking.serviceType);
  return 'General Service';
};

const getAddress = (booking) => {
  if (booking?.customerAddress) return booking.customerAddress;
  if (booking?.address?.fullAddress) return booking.address.fullAddress;

  const fields = [
    booking?.address?.line1,
    booking?.address?.line2,
    booking?.address?.area,
    booking?.address?.city,
    booking?.address?.state,
    booking?.address?.pincode,
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean);

  return fields.length ? fields.join(', ') : 'Address unavailable';
};

const toSeconds = (dateValue) => {
  if (!dateValue) return 0;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [actionBookingId, setActionBookingId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stepsBookingId, setStepsBookingId] = useState(null);

  const [timerTick, setTimerTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadBookings = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const bookingList = await fetchProviderBookings();
      setBookings(bookingList);
      setError('');
    } catch (err) {
      setError(getErrorText(err, 'Failed to fetch bookings'));
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const runAction = async (bookingId, action, successText, fallbackError, options = {}) => {
    setActionBookingId(bookingId);
    setError('');
    setMessage('');

    try {
      await action();
      setMessage(successText);
      await loadBookings({ silent: true });
      if (options.openStepsAfterAction) {
        setStepsBookingId(bookingId);
      }
    } catch (err) {
      setError(getErrorText(err, fallbackError));
    } finally {
      setActionBookingId('');
    }
  };

  const handleAccept = (bookingId) =>
    runAction(bookingId, () => acceptBooking(bookingId), 'Booking accepted', 'Failed to accept booking');

  const handleReject = (bookingId) =>
    runAction(bookingId, () => rejectBooking(bookingId), 'Booking rejected', 'Failed to reject booking');

  const handleStartService = (bookingId) =>
    runAction(
      bookingId,
      () => startService(bookingId),
      'Service started',
      'Failed to start service',
      { openStepsAfterAction: true }
    );

  const handleCancel = (bookingId) =>
    runAction(bookingId, () => cancelBooking(bookingId), 'Booking cancelled', 'Failed to cancel booking');

  const normalizedBookings = useMemo(
    () =>
      bookings.map((booking, index) => {
        const status = normalizeStatus(booking.status);
        const amount = formatAmount(booking);
        const startTime = booking.serviceStartTime || null;

        return {
          ...booking,
          status,
          displayId: booking.bookingId || `BK-${String(booking._id || index).slice(-6).toUpperCase()}`,
          customerName: getCustomerName(booking),
          serviceName: getServiceName(booking),
          addressText: getAddress(booking),
          amount,
          scheduleText: formatSchedule(booking),
          elapsedText: formatDuration(toSeconds(startTime)),
        };
      }),
    [bookings, timerTick]
  );

  const tabCounts = useMemo(() => {
    const counts = { all: normalizedBookings.length };
    statusTabs.forEach((tab) => {
      if (tab.key !== 'all') counts[tab.key] = 0;
    });

    normalizedBookings.forEach((booking) => {
      if (counts[booking.status] !== undefined) counts[booking.status] += 1;
    });

    return counts;
  }, [normalizedBookings]);

  const visibleBookings = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return normalizedBookings.filter((booking) => {
      const tabMatch = activeTab === 'all' || booking.status === activeTab;
      if (!tabMatch) return false;
      if (!q) return true;

      return [
        booking.displayId,
        booking.customerName,
        booking.serviceName,
        booking.addressText,
        booking.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [activeTab, normalizedBookings, searchText]);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ mt: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800 }}>Bookings</Typography>
          <Typography sx={{ color: '#64748b' }}>Service workflow for assigned bookings</Typography>
        </Box>
        <Button
          onClick={() => loadBookings({ silent: true })}
          disabled={refreshing}
          startIcon={refreshing ? <CircularProgress color="inherit" size={16} /> : <RefreshRoundedIcon />}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Stack>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box
        sx={{
          display: 'flex',
          gap: 0.8,
          flexWrap: 'wrap',
          p: 0.7,
          borderRadius: 2,
          bgcolor: '#edf2f7',
        }}
      >
        {statusTabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: active ? 700 : 600,
                color: '#334155',
                bgcolor: active ? '#fff' : 'transparent',
              }}
            >
              {tab.label} ({tabCounts[tab.key] || 0})
            </Button>
          );
        })}
      </Box>

      <TextField
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search by customer, service, booking ID or status"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: '#64748b' }} />
            </InputAdornment>
          ),
        }}
      />

      {!visibleBookings.length ? <Alert severity="info">No bookings found for current filter.</Alert> : null}

      {visibleBookings.map((booking) => {
        const isActionLoading = actionBookingId === booking._id;
        const canAcceptReject = booking.status === 'assigned';
        const canStart = booking.status === 'accepted';
        const canContinueFlow = ['in_progress', 'otp_sent'].includes(booking.status);
        const canCancel = !['completed', 'cancelled'].includes(booking.status);

        return (
          <Card key={booking._id} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ color: '#64748b', fontWeight: 700 }}>{booking.displayId}</Typography>
                    <Chip
                      label={booking.status.replace('_', ' ')}
                      size="small"
                      sx={{ textTransform: 'capitalize', fontWeight: 700, ...statusStyle[booking.status] }}
                    />
                  </Stack>

                  <Typography sx={{ mt: 1, fontWeight: 800, fontSize: 19 }}>{booking.customerName}</Typography>
                  <Typography sx={{ color: '#475569' }}>{booking.serviceName}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: 14 }}>{booking.scheduleText}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: 14 }}>{booking.addressText}</Typography>

                  {['in_progress', 'otp_sent'].includes(booking.status) ? (
                    <Typography sx={{ mt: 1, color: '#1d4ed8', fontWeight: 700 }}>
                      Timer: {booking.elapsedText}
                    </Typography>
                  ) : null}
                </Box>

                <Stack direction="column" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1.1}>
                  <Typography sx={{ fontWeight: 800, fontSize: 20 }}>Rs {booking.amount}</Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {canAcceptReject ? (
                      <Button
                        onClick={() => handleAccept(booking._id)}
                        disabled={Boolean(actionBookingId)}
                        startIcon={isActionLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlineRoundedIcon />}
                        sx={{ textTransform: 'none', bgcolor: '#2563eb', color: '#fff', '&:hover': { bgcolor: '#1d4ed8' } }}
                      >
                        Accept
                      </Button>
                    ) : null}

                    {canAcceptReject ? (
                      <Button
                        onClick={() => handleReject(booking._id)}
                        disabled={Boolean(actionBookingId)}
                        startIcon={isActionLoading ? <CircularProgress size={14} color="inherit" /> : <HighlightOffRoundedIcon />}
                        sx={{ textTransform: 'none', bgcolor: '#dc2626', color: '#fff', '&:hover': { bgcolor: '#b91c1c' } }}
                      >
                        Reject
                      </Button>
                    ) : null}

                    {canStart ? (
                      <Button
                        onClick={() => handleStartService(booking._id)}
                        disabled={Boolean(actionBookingId)}
                        startIcon={isActionLoading ? <CircularProgress size={14} color="inherit" /> : <PlayArrowRoundedIcon />}
                        sx={{ textTransform: 'none', bgcolor: '#0ea5e9', color: '#fff', '&:hover': { bgcolor: '#0284c7' } }}
                      >
                        Start Service
                      </Button>
                    ) : null}

                    {canContinueFlow ? (
                      <Button
                        onClick={() => setStepsBookingId(booking._id)}
                        startIcon={<TaskAltRoundedIcon />}
                        sx={{ textTransform: 'none', bgcolor: '#4338ca', color: '#fff', '&:hover': { bgcolor: '#3730a3' } }}
                      >
                        Continue Workflow
                      </Button>
                    ) : null}

                    {canCancel ? (
                      <Button
                        onClick={() => handleCancel(booking._id)}
                        disabled={Boolean(actionBookingId)}
                        sx={{ textTransform: 'none' }}
                        color="error"
                        variant="outlined"
                      >
                        Cancel
                      </Button>
                    ) : null}

                    <Button
                      onClick={() => setSelectedBooking(booking)}
                      startIcon={<VisibilityOutlinedIcon />}
                      sx={{ textTransform: 'none' }}
                      variant="text"
                    >
                      Details
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={Boolean(selectedBooking)} onClose={() => setSelectedBooking(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking ? (
            <Stack spacing={1.1} sx={{ pt: 0.5 }}>
              <Typography>
                <strong>Booking ID:</strong> {selectedBooking.displayId}
              </Typography>
              <Typography>
                <strong>Status:</strong> {selectedBooking.status}
              </Typography>
              <Typography>
                <strong>Customer:</strong> {selectedBooking.customerName}
              </Typography>
              <Typography>
                <strong>Service:</strong> {selectedBooking.serviceName}
              </Typography>
              <Typography>
                <strong>Schedule:</strong> {selectedBooking.scheduleText}
              </Typography>
              <Typography>
                <strong>Address:</strong> {selectedBooking.addressText}
              </Typography>
              <Typography>
                <strong>Amount:</strong> Rs {selectedBooking.amount}
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBooking(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ServiceStepsPage
        bookingId={stepsBookingId}
        open={Boolean(stepsBookingId)}
        onClose={(refresh) => {
          setStepsBookingId(null);
          if (refresh) loadBookings({ silent: true });
        }}
      />
    </Stack>
  );
}
