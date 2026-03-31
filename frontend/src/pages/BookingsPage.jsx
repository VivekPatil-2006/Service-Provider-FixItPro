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
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ServiceStepsPage from './ServiceStepsPage';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusToTab = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
};


// Only allow cancel before completed/cancelled
const canCancelStatus = ['pending', 'assigned', 'in_progress'];

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const formatServiceType = (value) =>
  String(value || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const getServiceName = (booking) => {
  if (booking?.serviceId?.name) return booking.serviceId.name;
  if (booking?.serviceType) return formatServiceType(booking.serviceType);
  return 'General Service';
};

const getCustomerName = (booking) => {
  if (booking?.customerName) return booking.customerName;
  if (booking?.userName) return booking.userName;
  if (booking?.user?.name) return booking.user.name;
  if (booking?.userId && typeof booking.userId === 'object') {
    if (booking.userId.name) return booking.userId.name;
    if (booking.userId.mobile) return booking.userId.mobile;
    if (booking.userId._id) return `User ${String(booking.userId._id).slice(-5)}`;
  }
  if (booking?.userId) return `User ${String(booking.userId).slice(-5)}`;
  return 'Customer';
};

const getAddressText = (booking) => {
  if (booking?.customerAddress) return booking.customerAddress;
  if (!booking?.address) return 'Address unavailable';
  if (typeof booking.address === 'string') return booking.address;
  if (booking.address.fullAddress) return booking.address.fullAddress;

  const parts = [
    booking.address.line1,
    booking.address.line2,
    booking.address.area,
    booking.address.city,
    booking.address.state,
    booking.address.pincode,
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean);

  return parts.length ? parts.join(', ') : 'Address unavailable';
};

const getAmount = (booking) => {
  const pricing = booking?.pricing;
  if (pricing && typeof pricing === 'object') {
    const candidates = ['totalAmount', 'total', 'finalAmount', 'finalPrice', 'amount'];
    for (const key of candidates) {
      const value = pricing[key];
      if (value !== undefined && value !== null && !Number.isNaN(Number(value))) {
        return Number(value);
      }
    }
  }

  if (booking?.amount !== undefined && booking?.amount !== null && !Number.isNaN(Number(booking.amount))) {
    return Number(booking.amount);
  }

  return 0;
};

const getSchedule = (booking) => {
  const sourceDate = booking?.scheduledDate || booking?.scheduledAt;
  const parsedDate = sourceDate ? new Date(sourceDate) : null;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());

  const datePart = hasValidDate ? parsedDate.toLocaleDateString('en-CA') : 'Date unavailable';

  const start = booking?.timeSlot?.startTime || booking?.timeSlot?.start;
  const end = booking?.timeSlot?.endTime || booking?.timeSlot?.end;
  if (start && end) {
    return { datePart, timePart: `${start} - ${end}` };
  }

  const fallbackTime = hasValidDate
    ? parsedDate.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Time unavailable';

  return { datePart, timePart: fallbackTime };
};

const getProviderId = (booking) => String(booking?.providerId?._id || booking?.providerId || '');

const getEntityId = (value) => {
  if (!value) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return 'N/A';
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusChipStyle = {
  pending: {
    bgcolor: '#fff7e8',
    color: '#f59e0b',
    border: '1px solid #fde5b3',
  },
  confirmed: {
    bgcolor: '#e9f3ff',
    color: '#2a8bf2',
    border: '1px solid #c9ddf9',
  },
  completed: {
    bgcolor: '#e8f8ef',
    color: '#1f9d62',
    border: '1px solid #bfe8d1',
  },
  cancelled: {
    bgcolor: '#fdecec',
    color: '#ef4444',
    border: '1px solid #f8caca',
  },
};

export default function BookingsPage() {
  const { provider } = useAuth();
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

  const currentProviderId = String(provider?._id || '');

  const fetchBookings = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/bookings');
      setBookings(data.bookings || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatus = async (bookingId, status) => {
    try {
      setError('');
      setMessage('');

      const target = bookings.find((booking) => booking._id === bookingId);
      if (!target) {
        setError('Booking not found in current list');
        return;
      }

      const nextAllowed = allowedTransitions[normalizeStatus(target.status)] || [];
      if (!nextAllowed.includes(status)) {
        setError('This status change is not allowed');
        return;
      }

      setActionBookingId(bookingId);
      await api.patch(`/bookings/${bookingId}/status`, { status });

      setBookings((prev) =>
        prev.map((booking) => {
          if (booking._id !== bookingId) return booking;
          return {
            ...booking,
            status,
            providerId: status === 'accepted' ? booking.providerId || currentProviderId : booking.providerId,
          };
        })
      );

      setSelectedBooking((prev) => {
        if (!prev || prev._id !== bookingId) return prev;
        return {
          ...prev,
          status,
          providerId: status === 'accepted' ? prev.providerId || currentProviderId : prev.providerId,
        };
      });

      setMessage(`Booking ${status} successfully`);
      setTimeout(() => setMessage(''), 2500);
      fetchBookings({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setActionBookingId('');
    }
  };



  const handleAcceptBooking = async (bookingId) => {
    setActionBookingId(bookingId);
    setError('');
    setMessage('');
    try {
      await api.patch(`/bookings/${bookingId}/accept`);
      setMessage('Booking accepted');
      fetchBookings({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept booking');
    }
    setActionBookingId('');
  };

  const handleRejectBooking = async (bookingId) => {
    setActionBookingId(bookingId);
    setError('');
    setMessage('');
    try {
      await api.patch(`/bookings/${bookingId}/reject`);
      setMessage('Booking rejected');
      fetchBookings({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject booking');
    }
    setActionBookingId('');
  };

  const handleStartService = async (bookingId) => {
    setActionBookingId(bookingId);
    setError('');
    setMessage('');
    try {
      await api.patch(`/bookings/${bookingId}/start`);
      setMessage('Service started');
      fetchBookings({ silent: true });
      setStepsBookingId(bookingId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start service');
    }
    setActionBookingId('');
  };

  const handleCancelBooking = async (bookingId) => {
    setActionBookingId(bookingId);
    setError('');
    setMessage('');
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setMessage('Booking cancelled');
      fetchBookings({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
    setActionBookingId('');
  };

  const handleRejectService = async (bookingId) => {
    setActionBookingId(bookingId);
    setError('');
    setMessage('');
    try {
      await api.patch(`/bookings/${bookingId}/reject`);
      setMessage('Booking rejected');
      fetchBookings({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject booking');
    }
    setActionBookingId('');
  };

  const normalizedBookings = useMemo(
    () =>
      bookings.map((booking, idx) => {
        const normalizedStatus = normalizeStatus(booking.status);
        const displayId = booking.bookingId || `BK-${String(booking._id || idx).slice(-6).toUpperCase()}`;

        return {
          ...booking,
          normalizedStatus,
          tabStatus: statusToTab[normalizedStatus] || 'pending',
          displayId,
          displayService: getServiceName(booking),
          displayCustomer: getCustomerName(booking),
          displayAddress: getAddressText(booking),
          displayAmount: getAmount(booking),
          assignedProviderId: getProviderId(booking),
          displayUserId: getEntityId(booking.userId),
          displayServiceId: getEntityId(booking.serviceId),
          displayProductId: getEntityId(booking.productId),
          displayProviderId: getEntityId(booking.providerId),
          displayCreatedAt: formatDateTime(booking.createdAt),
          displayUpdatedAt: formatDateTime(booking.updatedAt),
          ...getSchedule(booking),
        };
      }),
    [bookings]
  );

  const tabCounts = useMemo(() => {
    const counts = {
      all: normalizedBookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    normalizedBookings.forEach((booking) => {
      if (counts[booking.tabStatus] !== undefined) {
        counts[booking.tabStatus] += 1;
      }
    });

    return counts;
  }, [normalizedBookings]);

  const visibleBookings = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return normalizedBookings.filter((booking) => {
      const matchesTab = activeTab === 'all' || booking.tabStatus === activeTab;
      if (!matchesTab) return false;

      if (!q) return true;

      const haystack = [
        booking.displayCustomer,
        booking.displayService,
        booking.displayAddress,
        booking.displayId,
        booking.normalizedStatus,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
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
    <Stack spacing={2.2}>
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.2}>
          <Box>
            <Typography sx={{ fontSize: { xs: 18, md: 26 }, fontWeight: 800, color: '#0f172a' }}>Bookings</Typography>
            <Typography sx={{ color: '#64748b', mt: 0.2, fontSize: 17 }}>
              Manage and track all your service bookings
            </Typography>
          </Box>
          <Button
            onClick={() => fetchBookings({ silent: true })}
            disabled={refreshing || loading}
            startIcon={refreshing ? <CircularProgress color="inherit" size={16} /> : <RefreshRoundedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
      </Box>

      {message ? <Alert severity="success">{message}</Alert> : null}

      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => fetchBookings()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          p: 0.6,
          borderRadius: 2,
          bgcolor: '#e7ebf1',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0.8,
        }}
      >
        {statusTabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                minHeight: 40,
                px: 2,
                py: 0.6,
                color: '#475569',
                bgcolor: active ? '#ffffff' : 'transparent',
                boxShadow: active ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
                fontWeight: active ? 700 : 600,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{tab.label}</span>
                <Box
                  component="span"
                  sx={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: 999,
                    px: 0.8,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#475569',
                    bgcolor: '#eef2f7',
                  }}
                >
                  {tabCounts[tab.key]}
                </Box>
              </Stack>
            </Button>
          );
        })}
      </Box>

      <TextField
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search by name, service, or ID..."
        sx={{
          maxWidth: 620,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.6,
            bgcolor: '#f8fafc',
          },
          '& .MuiInputBase-input': {
            fontSize: 17,
            py: 1.55,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: '#667085' }} />
            </InputAdornment>
          ),
        }}
      />

      <Divider sx={{ display: { xs: 'none', sm: 'block' }, borderColor: 'transparent' }} />

      {visibleBookings.map((booking) => {
        const isActionLoading = actionBookingId === booking._id;
        const isAssignedToMe = booking.assignedProviderId && booking.assignedProviderId === currentProviderId;

        // Only show Accept/Reject for assigned bookings
        const canAccept = booking.normalizedStatus === 'assigned' && isAssignedToMe;
        const canReject = booking.normalizedStatus === 'assigned' && isAssignedToMe;
        // After accepting, show Start Service (status must be 'accepted')
        const canStartService = booking.normalizedStatus === 'accepted' && isAssignedToMe;
        // In progress: show steps
        const canShowSteps = booking.normalizedStatus === 'in_progress' && isAssignedToMe;
        // Allow cancel only after accepted or in_progress, not on assigned
        const canCancel = ['accepted', 'in_progress'].includes(booking.normalizedStatus);

        return (
          <Card
            key={booking._id}
            sx={{
              borderRadius: 2.2,
              border: '1px solid #d6dde6',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.7 }}>
                    <Typography sx={{ color: '#667085', fontWeight: 500 }}>{booking.displayId}</Typography>
                    <Chip
                      label={booking.tabStatus}
                      size="small"
                      sx={{
                        borderRadius: 999,
                        height: 28,
                        textTransform: 'lowercase',
                        fontWeight: 700,
                        ...statusChipStyle[booking.tabStatus],
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontSize: { xs: 18, md: 18 }, fontWeight: 800, color: '#1f2937' }}>
                    {booking.displayCustomer}
                  </Typography>
                  <Typography sx={{ color: '#667085', fontSize: 16 }}>
                    {booking.displayService} • {booking.datePart} at {booking.timePart}
                  </Typography>
                  {/* Timer for in-progress */}
                  {booking.normalizedStatus === 'in_progress' && (
                    <Typography sx={{ color: '#0ea5e9', fontWeight: 700, mt: 1 }}>
                      Service in progress...
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" alignItems="center" spacing={1.3}>
                  <Typography
                    sx={{
                      fontSize: { xs: 22, md: 20 },
                      fontWeight: 800,
                      color: '#1f2937',
                      minWidth: 92,
                      textAlign: 'right',
                    }}
                  >
                    ₹ {booking.displayAmount}
                  </Typography>


                  {/* Accept/Reject for assigned bookings only */}
                  {canAccept && (
                    <Button
                      onClick={() => handleAcceptBooking(booking._id)}
                      startIcon={isActionLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlineRoundedIcon />}
                      disabled={Boolean(actionBookingId)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1.4,
                        color: '#fff',
                        fontWeight: 700,
                        bgcolor: '#1e40af',
                        px: 2,
                        '&:hover': { bgcolor: '#1e3a8a' },
                      }}
                    >
                      Accept
                    </Button>
                  )}
                  {canReject && (
                    <Button
                      onClick={() => handleRejectBooking(booking._id)}
                      startIcon={isActionLoading ? <CircularProgress size={14} color="inherit" /> : <HighlightOffRoundedIcon />}
                      disabled={Boolean(actionBookingId)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1.4,
                        color: '#fff',
                        fontWeight: 700,
                        bgcolor: '#ef4444',
                        px: 2,
                        '&:hover': { bgcolor: '#b91c1c' },
                      }}
                    >
                      Reject
                    </Button>
                  )}

                  {/* Start Service after accepting */}
                  {canStartService && (
                    <Button
                      onClick={() => handleStartService(booking._id)}
                      startIcon={isActionLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlineRoundedIcon />}
                      disabled={Boolean(actionBookingId)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1.4,
                        color: '#0ea5e9',
                        fontWeight: 700,
                        bgcolor: '#0ea5e9',
                        px: 2,
                        '&:hover': { bgcolor: '#0369a1' },
                      }}
                    >
                      Start Service
                    </Button>
                  )}

                  {/* Service Steps for in-progress */}
                  {canShowSteps && (
                    <Button
                      onClick={() => setStepsBookingId(booking._id)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1.4,
                        color: '#fff',
                        fontWeight: 700,
                        bgcolor: '#0ea5e9',
                        px: 2,
                        '&:hover': { bgcolor: '#0369a1' },
                      }}
                    >
                      Service Steps
                    </Button>
                  )}

                  {/* Cancel booking only after accepted or in_progress */}
                  {canCancel && (
                    <Button
                      onClick={() => handleCancelBooking(booking._id)}
                      startIcon={isActionLoading ? <CircularProgress size={14} color="inherit" /> : <HighlightOffRoundedIcon />}
                      disabled={Boolean(actionBookingId)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1.4,
                        color: '#fff',
                        fontWeight: 700,
                        bgcolor: '#ef4444',
                        px: 2,
                        '&:hover': { bgcolor: '#b91c1c' },
                      }}
                    >
                      Cancel
                    </Button>
                  )}

                  <IconButton
                    onClick={() => setSelectedBooking(booking)}
                    sx={{
                      color: '#667085',
                      border: '1px solid transparent',
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#dbe1ea' },
                    }}
                    aria-label="View booking"
                  >
                    <VisibilityOutlinedIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}

      {!visibleBookings.length ? (
        <Alert severity="info">
          {searchText.trim() ? 'No bookings match your search.' : 'No bookings found for this filter.'}
        </Alert>
      ) : null}

      <Dialog open={Boolean(selectedBooking)} onClose={() => setSelectedBooking(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking ? (
            <Stack spacing={1.2} sx={{ pt: 0.4 }}>
              <Typography>
                <strong>ID:</strong> {selectedBooking.displayId}
              </Typography>
              <Typography>
                <strong>Customer:</strong> {selectedBooking.displayCustomer}
              </Typography>
              <Typography>
                <strong>Service:</strong> {selectedBooking.displayService}
              </Typography>
              <Typography>
                <strong>Address:</strong> {selectedBooking.displayAddress}
              </Typography>
              <Typography>
                <strong>Schedule:</strong> {selectedBooking.datePart} at {selectedBooking.timePart}
              </Typography>
              <Typography>
                <strong>Amount:</strong> ₹ {selectedBooking.displayAmount}
              </Typography>
              <Typography>
                <strong>Service Price:</strong> ₹ {selectedBooking.pricing?.servicePrice ?? 0}
              </Typography>
              <Typography>
                <strong>Convenience Fee:</strong> ₹ {selectedBooking.pricing?.convenienceFee ?? 0}
              </Typography>
              <Typography>
                <strong>Discount:</strong> ₹ {selectedBooking.pricing?.discount ?? 0}
              </Typography>
              <Typography>
                <strong>Total Amount:</strong> ₹ {selectedBooking.pricing?.totalAmount ?? selectedBooking.displayAmount}
              </Typography>
              <Typography>
                <strong>Status:</strong> {selectedBooking.normalizedStatus}
              </Typography>
              <Typography>
                <strong>Payment Method:</strong> {selectedBooking.payment?.method || 'N/A'}
              </Typography>
              <Typography>
                <strong>Payment Status:</strong> {selectedBooking.payment?.status || 'N/A'}
              </Typography>
              <Typography>
                <strong>Notes:</strong> {selectedBooking.notes || 'N/A'}
              </Typography>
              <Typography>
                <strong>User ID:</strong> {selectedBooking.displayUserId}
              </Typography>
              <Typography>
                <strong>Service ID:</strong> {selectedBooking.displayServiceId}
              </Typography>
              <Typography>
                <strong>Product ID:</strong> {selectedBooking.displayProductId}
              </Typography>
              <Typography>
                <strong>Provider ID:</strong> {selectedBooking.displayProviderId}
              </Typography>
              <Typography>
                <strong>City:</strong> {selectedBooking.address?.city || 'N/A'}
              </Typography>
              <Typography>
                <strong>State:</strong> {selectedBooking.address?.state || 'N/A'}
              </Typography>
              <Typography>
                <strong>Pincode:</strong> {selectedBooking.address?.pincode || 'N/A'}
              </Typography>
              <Typography>
                <strong>Created At:</strong> {selectedBooking.displayCreatedAt}
              </Typography>
              <Typography>
                <strong>Updated At:</strong> {selectedBooking.displayUpdatedAt}
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
          if (refresh) fetchBookings({ silent: true });
        }}
      />
    </Stack>
  );
}
