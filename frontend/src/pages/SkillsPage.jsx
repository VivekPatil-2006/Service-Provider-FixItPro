import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  Tooltip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';


const expertiseOptions = [
  { value: 'AC_REPAIR', label: 'AC Repair', icon: '❄️', color: '#06b6d4', description: 'Air conditioning repair' },
  { value: 'FRIDGE_REPAIR', label: 'Fridge Repair', icon: '🧊', color: '#0ea5e9', description: 'Refrigerator repair' },
  { value: 'TV_REPAIR', label: 'TV Repair', icon: '📺', color: '#8b5cf6', description: 'Television repair' },
];

const ExpertiseCard = ({ item, isSelected, onToggle, theme }) => (
  <Card
    onClick={onToggle}
    sx={{
      borderRadius: 2.5,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: `2px solid ${isSelected ? item.color : alpha(theme.palette.divider, 0.3)}`,
      bgcolor: isSelected ? alpha(item.color, 0.08) : 'background.paper',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
        borderColor: item.color,
      },
    }}
  >
    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
      <Box sx={{ fontSize: '2.5rem', mb: 1 }}>{item.icon}</Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={0.5}
        sx={{ mb: 0.5 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
          {item.label}
        </Typography>
        {isSelected && <CheckCircleIcon sx={{ fontSize: 16, color: item.color }} />}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
        {item.description}
      </Typography>
    </CardContent>
  </Card>
);

export default function SkillsPage() {
  const theme = useTheme();
  const { provider, refreshProfile } = useAuth();
  const [expertise, setExpertise] = useState(provider?.expertise || []);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(provider?.skills || []);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) {
      setError('Skill cannot be empty');
      return;
    }
    if (skills.includes(value)) {
      setError('This skill already exists');
      return;
    }
    if (value.length > 50) {
      setError('Skill name is too long (max 50 characters)');
      return;
    }
    setSkills((prev) => [...prev, value]);
    setSkillInput('');
    setError('');
    setOpenDialog(false);
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    try {
      setError('');
      setMessage('');
      if (expertise.length === 0) {
        setError('Please select at least one expertise area');
        return;
      }
      await api.put('/providers/skills', { skills, expertise });
      await refreshProfile();
      setMessage('✅ Skills updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update skills');
    }
  };

  const totalServices = expertise.length + skills.length;
  const completionPercentage = Math.min((totalServices / 5) * 100, 100);

  return (
    <Stack spacing={1.5}>
      {/* HEADER */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
          borderRadius: 3,
          p: { xs: 2, sm: 2.5 },
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.3, letterSpacing: '-0.01em' }}>
              🛠️ Services & Skills
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showcase your expertise and specialized skills
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.12),
              color: theme.palette.success.main,
              borderRadius: 2,
              p: 1.5,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', display: 'block' }}>
              Total Services
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {totalServices}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ALERTS */}
      {message && (
        <Alert
          severity="success"
          sx={{
            borderRadius: 2,
            boxShadow: `0 2px 8px ${alpha('#22c55e', 0.15)}`,
            backgroundColor: alpha('#22c55e', 0.1),
          }}
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
            boxShadow: `0 2px 8px ${alpha('#ef4444', 0.15)}`,
            backgroundColor: alpha('#ef4444', 0.1),
          }}
        >
          {error}
        </Alert>
      )}

      {/* SECTION 1: EXPERTISE AREAS */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <EmojiEventsIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                👨‍🔧 Core Expertise Areas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select the services you provide
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={1.5}>
            {expertiseOptions.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.value}>
                <ExpertiseCard
                  item={item}
                  isSelected={expertise.includes(item.value)}
                  onToggle={() => {
                    if (expertise.includes(item.value)) {
                      setExpertise((prev) => prev.filter((val) => val !== item.value));
                    } else {
                      setExpertise((prev) => [...prev, item.value]);
                    }
                  }}
                  theme={theme}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                Expertise Selected: {expertise.length}/{expertiseOptions.length}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: theme.palette.primary.main }}>
                {expertise.length > 0 ? '✓ Complete' : 'Select at least one'}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(expertise.length / expertiseOptions.length) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* SECTION 2: CUSTOM SKILLS */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <SchoolIcon sx={{ fontSize: 24, color: theme.palette.info.main }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                🎓 Custom Skills
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add specialized skills not listed above
              </Typography>
            </Box>
          </Stack>

          {/* SKILL INPUT */}
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g., Inverter AC Repair, Programming Logic, etc."
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill();
                }
              }}
              sx={{ borderRadius: 1.5 }}
            />
            <Tooltip title="Add Skill (or press Enter)">
              <Button
                variant="contained"
                size="small"
                onClick={addSkill}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                }}
              >
                Add
              </Button>
            </Tooltip>
          </Stack>

          {/* SKILLS DISPLAY */}
          {skills.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 2,
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <BuildIcon sx={{ fontSize: 36, color: alpha(theme.palette.text.secondary, 0.4), mb: 0.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                No custom skills added yet
              </Typography>
            </Box>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => removeSkill(skill)}
                  icon={<CheckCircleIcon />}
                  variant="filled"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.15),
                    color: theme.palette.success.main,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: 1.5,
                    '& .MuiChip-deleteIcon': {
                      color: 'inherit',
                      '&:hover': { color: theme.palette.error.main },
                    },
                  }}
                />
              ))}
            </Stack>
          )}

          <Box sx={{ mt: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                Custom Skills: {skills.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Max 50 characters per skill
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* SECTION 3: SUMMARY STATS */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <CardContent sx={{ p: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: theme.palette.primary.main }}>
                  <BuildIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                    Core Expertise
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                    {expertise.length}/{expertiseOptions.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 2.5, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <CardContent sx={{ p: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), color: theme.palette.success.main }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                    Custom Skills
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                    {skills.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2.5, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <CardContent sx={{ p: 1.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  Profile Completeness
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {Math.round(completionPercentage)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ACTION BUTTONS */}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Add Skill
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
          }}
        >
          Save All Changes
        </Button>
      </Stack>

      {/* ADD SKILL DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Custom Skill</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Skill Name"
            placeholder="e.g., Refrigerant Charging"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addSkill();
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Character count: {skillInput.length}/50
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={addSkill} variant="contained" disabled={!skillInput.trim()}>
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
