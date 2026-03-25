import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const expertiseOptions = [
  { value: 'AC_REPAIR', label: 'AC Repair' },
  { value: 'FRIDGE_REPAIR', label: 'Fridge Repair' },
  { value: 'TV_REPAIR', label: 'TV Repair' },
];

export default function SkillsPage() {
  const { provider, refreshProfile } = useAuth();
  const [expertise, setExpertise] = useState(provider?.expertise || []);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(provider?.skills || []);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) {
      return;
    }
    if (!skills.includes(value)) {
      setSkills((prev) => [...prev, value]);
    }
    setSkillInput('');
  };

  const handleSave = async () => {
    try {
      setError('');
      setMessage('');
      await api.put('/providers/skills', { skills, expertise });
      await refreshProfile();
      setMessage('Skills updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update skills');
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Services & Skills
      </Typography>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Expertise
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {expertiseOptions.map((item) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    checked={expertise.includes(item.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setExpertise((prev) => [...prev, item.value]);
                      } else {
                        setExpertise((prev) => prev.filter((val) => val !== item.value));
                      }
                    }}
                  />
                }
                label={item.label}
              />
            ))}
          </Stack>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Custom Skills
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth label="Add Skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
            <Button variant="outlined" onClick={addSkill}>
              Add
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
            {skills.map((skill) => (
              <Chip key={skill} label={skill} onDelete={() => setSkills((prev) => prev.filter((s) => s !== skill))} />
            ))}
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleSave}>
              Save Skills
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
