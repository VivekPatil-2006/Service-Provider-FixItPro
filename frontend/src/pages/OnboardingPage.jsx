import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const steps = ['Basic Details', 'Professional Details', 'Document Upload', 'Location'];

const expertiseOptions = [
  { value: 'AC_REPAIR', label: 'AC Repair' },
  { value: 'FRIDGE_REPAIR', label: 'Fridge Repair' },
  { value: 'TV_REPAIR', label: 'TV Repair' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { provider, refreshProfile } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [basic, setBasic] = useState({
    name: provider?.name || '',
    email: provider?.email || '',
    dob: provider?.dob ? provider.dob.slice(0, 10) : '',
    gender: provider?.gender || 'MALE',
  });

  const [professional, setProfessional] = useState({
    expertise: provider?.expertise || [],
    experience: provider?.experience || 'NO_EXPERIENCE',
    maritalStatus: provider?.maritalStatus || 'UNMARRIED',
    emergencyContact: provider?.emergencyContact || '',
    referralName: provider?.referralName || '',
    hasVehicle: provider?.hasVehicle || false,
  });

  const [documents, setDocuments] = useState({
    aadharNumber: provider?.documents?.aadharNumber || '',
    panNumber: provider?.documents?.panNumber || '',
    aadharFront: null,
    aadharBack: null,
    panImage: null,
    chequeImage: null,
  });

  const [locationState, setLocationState] = useState({
    latitude: provider?.location?.latitude || '',
    longitude: provider?.location?.longitude || '',
  });

  const canContinue = useMemo(() => {
    if (activeStep === 0) {
      return basic.name && basic.email && basic.dob && basic.gender;
    }
    if (activeStep === 1) {
      return (
        professional.expertise.length > 0 &&
        professional.experience &&
        professional.maritalStatus &&
        /^[6-9]\d{9}$/.test(professional.emergencyContact)
      );
    }
    if (activeStep === 2) {
      return documents.aadharNumber && documents.panNumber;
    }
    if (activeStep === 3) {
      return locationState.latitude !== '' && locationState.longitude !== '';
    }
    return false;
  }, [activeStep, basic, professional, documents, locationState]);

  const saveCurrentStep = async () => {
    setError('');
    setLoading(true);

    try {
      if (activeStep === 0) {
        await api.put('/providers/onboarding/basic', basic);
      }

      if (activeStep === 1) {
        await api.put('/providers/onboarding/professional', professional);
      }

      if (activeStep === 2) {
        const formData = new FormData();
        formData.append('aadharNumber', documents.aadharNumber);
        formData.append('panNumber', documents.panNumber);
        if (documents.aadharFront) formData.append('aadharFront', documents.aadharFront);
        if (documents.aadharBack) formData.append('aadharBack', documents.aadharBack);
        if (documents.panImage) formData.append('panImage', documents.panImage);
        if (documents.chequeImage) formData.append('chequeImage', documents.chequeImage);
        await api.put('/providers/onboarding/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (activeStep === 3) {
        await api.put('/providers/onboarding/location', locationState);
      }

      await refreshProfile();

      if (activeStep < steps.length - 1) {
        setActiveStep((prev) => prev + 1);
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save step');
    } finally {
      setLoading(false);
    }
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setError('');
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        setError('Unable to fetch location. Please allow location permission.');
        setLoading(false);
      }
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: '#f8f9fb' }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>
                Complete Your Profile
              </Typography>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error ? <Alert severity="error">{error}</Alert> : null}

              {activeStep === 0 ? (
                <Stack spacing={2}>
                  <TextField label="Mobile Number" value={provider?.mobile || ''} disabled fullWidth />
                  <TextField label="Name" value={basic.name} onChange={(e) => setBasic({ ...basic, name: e.target.value })} fullWidth />
                  <TextField label="Email" type="email" value={basic.email} onChange={(e) => setBasic({ ...basic, email: e.target.value })} fullWidth />
                  <TextField label="Date of Birth" type="date" value={basic.dob} onChange={(e) => setBasic({ ...basic, dob: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
                  <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup row value={basic.gender} onChange={(e) => setBasic({ ...basic, gender: e.target.value })}>
                      <FormControlLabel value="MALE" control={<Radio />} label="Male" />
                      <FormControlLabel value="FEMALE" control={<Radio />} label="Female" />
                      <FormControlLabel value="OTHER" control={<Radio />} label="Other" />
                    </RadioGroup>
                  </FormControl>
                </Stack>
              ) : null}

              {activeStep === 1 ? (
                <Stack spacing={2}>
                  <FormControl>
                    <FormLabel>Expertise</FormLabel>
                    <Stack direction="row" spacing={2}>
                      {expertiseOptions.map((option) => (
                        <FormControlLabel
                          key={option.value}
                          control={
                            <Checkbox
                              checked={professional.expertise.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfessional((prev) => ({ ...prev, expertise: [...prev.expertise, option.value] }));
                                } else {
                                  setProfessional((prev) => ({
                                    ...prev,
                                    expertise: prev.expertise.filter((item) => item !== option.value),
                                  }));
                                }
                              }}
                            />
                          }
                          label={option.label}
                        />
                      ))}
                    </Stack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Experience</FormLabel>
                    <RadioGroup value={professional.experience} onChange={(e) => setProfessional({ ...professional, experience: e.target.value })}>
                      <FormControlLabel value="MORE_THAN_1_YEAR" control={<Radio />} label="More than 1 Year" />
                      <FormControlLabel value="SIX_TO_TWELVE_MONTHS" control={<Radio />} label="6–12 Months" />
                      <FormControlLabel value="LESS_THAN_6_MONTHS" control={<Radio />} label="Less than 6 Months" />
                      <FormControlLabel value="NO_EXPERIENCE" control={<Radio />} label="No Experience" />
                    </RadioGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Marital Status</FormLabel>
                    <RadioGroup row value={professional.maritalStatus} onChange={(e) => setProfessional({ ...professional, maritalStatus: e.target.value })}>
                      <FormControlLabel value="MARRIED" control={<Radio />} label="Married" />
                      <FormControlLabel value="UNMARRIED" control={<Radio />} label="Unmarried" />
                    </RadioGroup>
                  </FormControl>

                  <TextField label="Emergency Contact Number" value={professional.emergencyContact} onChange={(e) => setProfessional({ ...professional, emergencyContact: e.target.value.replace(/\D/g, '').slice(0, 10) })} fullWidth />
                  <TextField label="Referral Name" value={professional.referralName} onChange={(e) => setProfessional({ ...professional, referralName: e.target.value })} fullWidth />
                  <FormControlLabel
                    control={<Switch checked={professional.hasVehicle} onChange={(e) => setProfessional({ ...professional, hasVehicle: e.target.checked })} />}
                    label="Do You Have Vehicle?"
                  />
                </Stack>
              ) : null}

              {activeStep === 2 ? (
                <Stack spacing={2}>
                  <TextField label="Aadhaar Number" value={documents.aadharNumber} onChange={(e) => setDocuments({ ...documents, aadharNumber: e.target.value })} fullWidth />
                  <Button variant="outlined" component="label">
                    Upload Aadhaar Front
                    <input type="file" hidden accept="image/*" onChange={(e) => setDocuments({ ...documents, aadharFront: e.target.files?.[0] || null })} />
                  </Button>
                  <Button variant="outlined" component="label">
                    Upload Aadhaar Back
                    <input type="file" hidden accept="image/*" onChange={(e) => setDocuments({ ...documents, aadharBack: e.target.files?.[0] || null })} />
                  </Button>

                  <TextField label="PAN Number" value={documents.panNumber} onChange={(e) => setDocuments({ ...documents, panNumber: e.target.value.toUpperCase() })} fullWidth />
                  <Button variant="outlined" component="label">
                    Upload PAN Image
                    <input type="file" hidden accept="image/*" onChange={(e) => setDocuments({ ...documents, panImage: e.target.files?.[0] || null })} />
                  </Button>

                  <Button variant="outlined" component="label">
                    Upload Cancelled Cheque
                    <input type="file" hidden accept="image/*" onChange={(e) => setDocuments({ ...documents, chequeImage: e.target.files?.[0] || null })} />
                  </Button>
                </Stack>
              ) : null}

              {activeStep === 3 ? (
                <Stack spacing={2}>
                  <Button variant="outlined" onClick={getLiveLocation} disabled={loading}>
                    Fetch Live Location
                  </Button>
                  <TextField label="Latitude" value={locationState.latitude} fullWidth InputProps={{ readOnly: true }} />
                  <TextField label="Longitude" value={locationState.longitude} fullWidth InputProps={{ readOnly: true }} />
                </Stack>
              ) : null}

              <Stack direction="row" justifyContent="space-between">
                <Button disabled={activeStep === 0 || loading} onClick={() => setActiveStep((prev) => prev - 1)}>
                  Back
                </Button>
                <Button variant="contained" disabled={!canContinue || loading} onClick={saveCurrentStep}>
                  {loading ? <CircularProgress size={22} color="inherit" /> : activeStep === steps.length - 1 ? 'Submit Profile' : 'Save & Continue'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
