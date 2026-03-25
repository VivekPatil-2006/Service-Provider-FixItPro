import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const days = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

export default function AvailabilityPage() {
  const { provider, refreshProfile } = useAuth();
  const [workingDays, setWorkingDays] = useState(provider?.availability?.workingDays || []);
  const [slots, setSlots] = useState(provider?.availability?.slots || [{ start: '', end: '' }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSlotChange = (index, key, value) => {
    setSlots((prev) => prev.map((slot, idx) => (idx === index ? { ...slot, [key]: value } : slot)));
  };

  const addSlot = () => setSlots((prev) => [...prev, { start: '', end: '' }]);
  const removeSlot = (index) => setSlots((prev) => prev.filter((_, idx) => idx !== index));

  const handleSave = async () => {
    try {
      setError('');
      setMessage('');
      const validSlots = slots.filter((slot) => slot.start && slot.end);
      await api.put('/providers/availability', { workingDays, slots: validSlots });
      await refreshProfile();
      setMessage('Availability updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability');
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Availability & Slots
      </Typography>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6">Working Days</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
            {days.map((day) => (
              <Stack key={day.key} direction="row" alignItems="center" spacing={0.5}>
                <Checkbox
                  checked={workingDays.includes(day.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setWorkingDays((prev) => [...prev, day.key]);
                    } else {
                      setWorkingDays((prev) => prev.filter((d) => d !== day.key));
                    }
                  }}
                />
                <Typography>{day.label}</Typography>
              </Stack>
            ))}
          </Stack>

          <Typography variant="h6" sx={{ mt: 1 }}>
            Available Time Slots
          </Typography>

          <Stack spacing={2} sx={{ mt: 1 }}>
            {slots.map((slot, index) => (
              <Grid container spacing={1} key={`${slot.start}-${slot.end}-${index}`} alignItems="center">
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Start"
                    value={slot.start}
                    onChange={(e) => handleSlotChange(index, 'start', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    type="time"
                    label="End"
                    value={slot.end}
                    onChange={(e) => handleSlotChange(index, 'end', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="error" onClick={() => removeSlot(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={addSlot}>
              Add Slot
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" onClick={handleSave}>
              Save Availability
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
