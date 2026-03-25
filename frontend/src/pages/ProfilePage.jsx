import { useState, useEffect } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Dialog,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Description as DocumentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { provider, refreshProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [locationAddress, setLocationAddress] = useState('Fetching location...');
  const [form, setForm] = useState({
    name: provider?.name || '',
    email: provider?.email || '',
    emergencyContact: provider?.emergencyContact || '',
    referralName: provider?.referralName || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch location address from coordinates
  useEffect(() => {
    const fetchAddress = async () => {
      if (provider?.location?.latitude && provider?.location?.longitude) {
        try {
          const response = await api.get('/providers/location/address', {
            params: {
              latitude: provider.location.latitude,
              longitude: provider.location.longitude,
            },
          });
          setLocationAddress(response.data.address);
        } catch (err) {
          console.error('Error fetching address:', err);
          setLocationAddress('Location coordinates available but address could not be retrieved');
        }
      } else {
        setLocationAddress('Location not set');
      }
    };

    fetchAddress();
  }, [provider?.location?.latitude, provider?.location?.longitude]);

  const handleSave = async () => {
    try {
      setError('');
      setMessage('');
      await api.put('/providers/me', form);
      await refreshProfile();
      setMessage('Profile updated successfully');
      setEditMode(false);
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const expertiseMap = {
    AC_REPAIR: '🌬️ AC Repair',
    FRIDGE_REPAIR: '🧊 Fridge Repair',
    TV_REPAIR: '📺 TV Repair',
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const genderMap = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
  };

  const experienceMap = {
    'MORE THAN 1 YEAR': 'More than 1 year',
    'SIX - TWELVE_MONTHS': '6-12 months',
    'LESS THAN 6 MONTHS': 'Less than 6 months',
    'NO EXPERIENCE': 'No experience',
  };

  const maritalStatusMap = {
    MARRIED: 'Married',
    UNMARRIED: 'Unmarried',
  };

  const getInitial = () => {
    return (provider?.name || 'SP').charAt(0).toUpperCase();
  };

  const documents = provider?.documents || {};
  const availability = provider?.availability || { workingDays: [], slots: [] };
  const onboardingComplete = provider?.onboardingCompleted;

  return (
    <Stack spacing={3}>
      {/* HEADER WITH NAME AND STATUS */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          👤 Complete Profile
        </Typography>
        <Button
          variant={editMode ? 'outlined' : 'contained'}
          startIcon={editMode ? <CloseIcon /> : <EditIcon />}
          onClick={() => (editMode ? setEditMode(false) : setEditMode(true))}
        >
          {editMode ? 'Cancel' : 'Edit Details'}
        </Button>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {/* PROFILE HEADER CARD */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <CardContent sx={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', color: 'white', pt: 3, pb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs="auto">
              <Badge badgeContent={onboardingComplete ? <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 32 }} /> : null} overlap="circular">
                <Avatar sx={{ width: 120, height: 120, fontSize: 48, fontWeight: 800, bgcolor: 'rgba(255,255,255,0.3)' }}>
                  {getInitial()}
                </Avatar>
              </Badge>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                {provider?.name || 'Service Provider'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Chip
                  icon={PhoneIcon}
                  label={provider?.mobile || 'Not set'}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label={onboardingComplete ? '✅ Registration Complete' : '⏳ Incomplete'}
                  size="small"
                  sx={{
                    bgcolor: onboardingComplete ? 'rgba(34, 197, 94, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Typography variant="body2">Member since {formatDate(provider?.createdAt)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SECTION 1: BASIC INFORMATION */}
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2.5 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon /> Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {editMode ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Referral Name" value={form.referralName} onChange={(e) => setForm({ ...form, referralName: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {provider?.name || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <EmailIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {provider?.email || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">

                    Date of Birth
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {formatDate(provider?.dob)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Gender
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {genderMap[provider?.gender] || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <PhoneIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Mobile
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {provider?.mobile || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Marital Status
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {maritalStatusMap[provider?.maritalStatus] || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Emergency Contact
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {provider?.emergencyContact || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Referral Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {provider?.referralName || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: PROFESSIONAL DETAILS */}
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2.5 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            💼 Professional Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Experience
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {experienceMap[provider?.experience] || 'Not specified'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <CarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  Vehicle
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {provider?.hasVehicle ? '✅ Own Vehicle Available' : '❌ No Vehicle'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  💼 Areas of Expertise
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  {provider?.expertise && provider.expertise.length > 0 ? (
                    provider.expertise.map((exp) => (
                      <Chip key={exp} label={expertiseMap[exp] || exp} color="primary" variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not specified
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  🎓 Custom Skills
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  {provider?.skills && provider.skills.length > 0 ? (
                    provider.skills.map((skill) => (
                      <Chip key={skill} label={skill} variant="outlined" size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No custom skills added
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SECTION 3: DOCUMENTS */}
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2.5 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DocumentIcon /> Documents & Verification
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Aadhaar */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  🆔 Aadhaar Card
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Number: {documents.aadharNumber ? `${documents.aadharNumber.slice(0, 4)}****${documents.aadharNumber.slice(-4)}` : 'Not provided'}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {documents.aadharFrontUrl && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSelectedImage({ title: 'Aadhaar Front', url: documents.aadharFrontUrl })}
                    >
                      View Front
                    </Button>
                  )}
                  {documents.aadharBackUrl && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSelectedImage({ title: 'Aadhaar Back', url: documents.aadharBackUrl })}
                    >
                      View Back
                    </Button>
                  )}
                </Stack>
              </Box>
            </Grid>

            {/* PAN */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📋 PAN Card
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Number: {documents.panNumber || 'Not provided'}
                </Typography>
                {documents.panUrl && (
                  <Button size="small" variant="outlined" onClick={() => setSelectedImage({ title: 'PAN Card', url: documents.panUrl })}>
                    View Document
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Cheque */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  💳 Cheque Sample
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Bank verification document
                </Typography>
                {documents.chequeUrl && (
                  <Button size="small" variant="outlined" onClick={() => setSelectedImage({ title: 'Cheque Sample', url: documents.chequeUrl })}>
                    View Document
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SECTION 4: LOCATION */}
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2.5 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon /> Service Location
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, border: '1px solid #e5e7eb' }}>
                <Typography variant="caption" color="text.secondary">
                  📍 Current Address
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.8, lineHeight: 1.6, color: '#1f2937' }}>
                  {locationAddress}
                </Typography>
                {provider?.location?.latitude && provider?.location?.longitude && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Coordinates: {provider.location.latitude.toFixed(4)}°, {provider.location.longitude.toFixed(4)}°
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SECTION 5: AVAILABILITY */}
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2.5 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon /> Working Schedule
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📅 Working Days
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {availability.workingDays && availability.workingDays.length > 0 ? (
                    availability.workingDays.map((day) => (
                      <Chip key={day} label={day} color="primary" variant="outlined" size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not specified
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  🕐 Time Slots
                </Typography>
                {availability.slots && availability.slots.length > 0 ? (
                  <Stack spacing={0.8}>
                    {availability.slots.map((slot, idx) => (
                      <Typography key={idx} variant="body2" sx={{ fontWeight: 500 }}>
                        {slot.start} - {slot.end}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Not specified
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* IMAGE PREVIEW DIALOG */}
      <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">{selectedImage?.title}</Typography>
          {selectedImage?.url && (
            <img src={selectedImage.url} alt="Document" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
          )}
          <Button variant="contained" onClick={() => setSelectedImage(null)}>
            Close
          </Button>
        </Box>
      </Dialog>
    </Stack>
  );
}
