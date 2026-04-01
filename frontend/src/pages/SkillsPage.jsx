import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fallbackServiceOptions = [
  'AC Repair',
  'AC Installation',
  'Refrigerator Repair',
  'Washing Machine',
  'TV Repair',
  'Microwave Repair',
  'Water Purifier',
  'Geyser Repair',
];

const serviceMeta = {
  'ac repair': { icon: '❄️', description: 'Split, window, cassette AC repair & service' },
  'ac installation': { icon: '🔧', description: 'New AC installation & uninstallation' },
  'refrigerator repair': { icon: '🧊', description: 'Single/double door fridge service' },
  'washing machine': { icon: '🫧', description: 'Front/top load washer repair' },
  'tv repair': { icon: '📺', description: 'LED, LCD, Smart TV repair' },
  'microwave repair': { icon: '♨️', description: 'Microwave oven repair & service' },
  'water purifier': { icon: '💧', description: 'RO, UV, UF purifier service' },
  'geyser repair': { icon: '🔥', description: 'Electric & gas geyser repair' },
};

const aliasMap = {
  AC_REPAIR: 'AC Repair',
  FRIDGE_REPAIR: 'Refrigerator Repair',
  TV_REPAIR: 'TV Repair',
};

const normalizeName = (value) =>
  String(value || '')
    .replaceAll('_', ' ')
    .trim()
    .toLowerCase();

const toDisplayName = (value) => {
  if (!value) return '';
  if (aliasMap[value]) return aliasMap[value];
  const normalized = normalizeName(value);
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function SkillsPage() {
  const { provider, refreshProfile } = useAuth();
  const [serviceOptions, setServiceOptions] = useState(fallbackServiceOptions);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expertise, setExpertise] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(provider?.skills || []);
  const [serviceDetailsMap, setServiceDetailsMap] = useState({});
  const [activeServiceName, setActiveServiceName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const normalizeExpertiseFromProvider = (items, options) => {
    const normalizedOptionsMap = new Map(options.map((opt) => [normalizeName(opt), opt]));
    const arr = Array.isArray(items) ? items : [];

    return arr
      .map((item) => {
        const display = toDisplayName(item);
        const normalized = normalizeName(display);
        return normalizedOptionsMap.get(normalized) || display;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    const fetchServiceOptions = async () => {
      setServicesLoading(true);
      try {
        const { data } = await api.get('/providers/services');
        const names = (data?.services || [])
          .map((service) => String(service?.name || '').trim())
          .filter(Boolean);

        if (names.length) {
          const unique = [...new Set(names)];
          setServiceOptions(unique);

          const nextDetailsMap = {};
          (data?.services || []).forEach((service) => {
            const name = String(service?.name || '').trim();
            if (!name) return;
            nextDetailsMap[normalizeName(name)] = service;
          });
          setServiceDetailsMap(nextDetailsMap);

          setExpertise((prev) => normalizeExpertiseFromProvider(provider?.expertise, unique).length ? normalizeExpertiseFromProvider(provider?.expertise, unique) : prev);
        }
      } catch (_err) {
        // Keep fallback options and continue.
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServiceOptions();
  }, []);

  useEffect(() => {
    setExpertise(normalizeExpertiseFromProvider(provider?.expertise, serviceOptions));
    setSkills(provider?.skills || []);
  }, [provider, serviceOptions]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) {
      setError('Skill cannot be empty');
      return;
    }
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
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
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const toggleExpertise = (value) => {
    setExpertise((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const getServiceSteps = (service) => {
    const steps = Array.isArray(service?.steps) ? service.steps : [];
    if (steps.length) {
      return steps
        .map((step, index) => ({
          order: Number(step?.order) || index + 1,
          title: String(step?.title || `Step ${index + 1}`),
          description: String(step?.description || ''),
        }))
        .sort((a, b) => a.order - b.order);
    }

    const processMap = service?.process;
    if (processMap && typeof processMap === 'object' && !Array.isArray(processMap)) {
      return Object.entries(processMap).map(([title, description], index) => ({
        order: index + 1,
        title: String(title || `Step ${index + 1}`),
        description: String(description || ''),
      }));
    }

    return [];
  };

  const getServiceDetail = (serviceName) => serviceDetailsMap[normalizeName(serviceName)] || null;

  const activeServiceDetail = useMemo(() => {
    if (!activeServiceName) return null;
    return getServiceDetail(activeServiceName);
  }, [activeServiceName, serviceDetailsMap]);

  const handleSave = async () => {
    try {
      setError('');
      setMessage('');
      setSaving(true);

      if (expertise.length === 0) {
        setError('Please select at least one expertise area');
        setSaving(false);
        return;
      }

      await api.put('/providers/skills', { skills, expertise });
      await refreshProfile();
      setMessage('Skills updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update skills');
    } finally {
      setSaving(false);
    }
  };

  const completionPercentage = useMemo(() => {
    if (expertise.length >= 3) return 100;
    return Math.min(Math.round((expertise.length / 3) * 100), 100);
  }, [expertise.length]);

  const isDirty = useMemo(() => {
    const originalExpertise = normalizeExpertiseFromProvider(provider?.expertise, serviceOptions).sort();
    const currentExpertise = [...expertise].sort();
    const originalSkills = [...(provider?.skills || [])].sort();
    const currentSkills = [...skills].sort();

    return (
      JSON.stringify(originalExpertise) !== JSON.stringify(currentExpertise) ||
      JSON.stringify(originalSkills) !== JSON.stringify(currentSkills)
    );
  }, [expertise, provider?.expertise, provider?.skills, serviceOptions, skills]);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: 17, sm: 26 } }}>
            Services & Skills
          </Typography>
          <Typography sx={{ color: '#64748b', mt: 0.2, fontSize: 17 }}>
            Manage your expertise and capabilities
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving || !isDirty}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 1.8,
            px: 3,
            py: 1.2,
            bgcolor: '#14967f',
            '&:hover': { bgcolor: '#117d6a' },
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card sx={{ borderRadius: 2.5, border: '1px solid #d9e1ea', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.05)' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesomeRoundedIcon sx={{ color: '#f59e0b' }} />
              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: 18 }}>
                Profile Completion
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 800, color: '#14967f', fontSize: 21 }}>
              {completionPercentage}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 10,
              borderRadius: 999,
              bgcolor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
                bgcolor: '#14967f',
              },
            }}
          />

          <Typography sx={{ color: '#64748b', mt: 1.2, fontSize: 16 }}>
            {completionPercentage === 100
              ? 'Your services profile is complete!'
              : 'Complete your service expertise to improve profile strength.'}
          </Typography>
        </CardContent>
      </Card>

      <Box>
        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: 18, sm: 24 } }}>
          Service Expertise
        </Typography>
        <Typography sx={{ color: '#64748b', mt: 0.2, fontSize: 17 }}>
          {expertise.length} services selected
        </Typography>
      </Box>

      {servicesLoading ? (
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ color: '#64748b' }}>
          <CircularProgress size={18} />
          <Typography>Loading services...</Typography>
        </Stack>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        }}
      >
        {serviceOptions.map((serviceName) => {
          const normalized = normalizeName(serviceName);
          const meta = serviceMeta[normalized] || { icon: '🛠️', description: 'Service support and maintenance' };
          const selected = expertise.includes(serviceName);
          return (
            <Card
              key={serviceName}
              onClick={() => setActiveServiceName(serviceName)}
              sx={{
                borderRadius: 2,
                border: selected ? '3px solid #14967f' : '2px solid #d6dde6',
                boxShadow: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#14967f',
                },
              }}
            >
              <CardContent sx={{ p: 1.8 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Stack direction="row" spacing={1.6} alignItems="center">
                    <Typography sx={{ fontSize: '1.9rem' }}>{meta.icon}</Typography>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: 21 }}>
                        {serviceName}
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: 16 }}>
                        {meta.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveServiceName(serviceName);
                      }}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                      variant="outlined"
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleExpertise(serviceName);
                      }}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                      variant={selected ? 'contained' : 'outlined'}
                    >
                      {selected ? 'Selected' : 'Select'}
                    </Button>
                    {selected ? (
                      <CheckCircleOutlineRoundedIcon sx={{ color: '#14967f', fontSize: 28 }} />
                    ) : null}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Dialog
        open={Boolean(activeServiceName)}
        onClose={() => setActiveServiceName('')}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          {activeServiceName || 'Service Details'}
        </DialogTitle>
        <DialogContent dividers>
          {activeServiceDetail ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0f172a', mb: 0.8 }}>
                    Service Image
                  </Typography>
                  {activeServiceDetail?.img ? (
                    <Box
                      component="img"
                      src={activeServiceDetail.img}
                      alt={activeServiceDetail.name || activeServiceName}
                      sx={{
                        width: '100%',
                        height: { xs: 180, md: 210 },
                        objectFit: 'cover',
                        borderRadius: 1.8,
                        border: '1px solid #d6dde6',
                        bgcolor: '#f8fafc',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: { xs: 180, md: 210 },
                        borderRadius: 1.8,
                        border: '1px dashed #cbd5e1',
                        bgcolor: '#f8fafc',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Typography sx={{ color: '#94a3b8' }}>No service image available</Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0f172a', mb: 0.8 }}>
                    Product Image
                  </Typography>
                  {activeServiceDetail?.productId?.image || activeServiceDetail?.productId?.img ? (
                    <Box
                      component="img"
                      src={activeServiceDetail?.productId?.image || activeServiceDetail?.productId?.img}
                      alt={activeServiceDetail?.productId?.name || 'Product image'}
                      sx={{
                        width: '100%',
                        height: { xs: 180, md: 210 },
                        objectFit: 'cover',
                        borderRadius: 1.8,
                        border: '1px solid #d6dde6',
                        bgcolor: '#f8fafc',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: { xs: 180, md: 210 },
                        borderRadius: 1.8,
                        border: '1px dashed #cbd5e1',
                        bgcolor: '#f8fafc',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Typography sx={{ color: '#94a3b8' }}>No product image available</Typography>
                    </Box>
                  )}
                </Box>
              </Stack>

              <Divider />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Service Details</Typography>
                  <Typography sx={{ mt: 1 }}><strong>Name:</strong> {activeServiceDetail.name || activeServiceName}</Typography>
                  <Typography><strong>Price:</strong> Rs {Number(activeServiceDetail.price || 0).toLocaleString('en-IN')}</Typography>
                  <Typography><strong>Duration:</strong> {activeServiceDetail.duration ? `${activeServiceDetail.duration} mins` : 'Not specified'}</Typography>
                  <Typography><strong>Ratings:</strong> {Number(activeServiceDetail.ratings || 0).toFixed(1)}</Typography>
                  <Typography sx={{ mt: 1 }}><strong>Description:</strong> {activeServiceDetail.description || 'No description available'}</Typography>
                  <Typography sx={{ mt: 1 }}><strong>Note:</strong> {activeServiceDetail.note || 'No note available'}</Typography>
                  {activeServiceDetail.video ? (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      <Typography><strong>Video:</strong></Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNewOutlinedIcon />}
                        onClick={() => window.open(activeServiceDetail.video, '_blank', 'noopener,noreferrer')}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open Video
                      </Button>
                    </Stack>
                  ) : (
                    <Typography sx={{ mt: 1 }}><strong>Video:</strong> Not available</Typography>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Product Details</Typography>
                  <Typography sx={{ mt: 1 }}><strong>Name:</strong> {activeServiceDetail?.productId?.name || 'Not available'}</Typography>
                  <Typography><strong>Category:</strong> {activeServiceDetail?.productId?.category || 'Not available'}</Typography>
                  <Typography><strong>Slug:</strong> {activeServiceDetail?.productId?.slug || 'Not available'}</Typography>
                  <Typography sx={{ mt: 1 }}><strong>Description:</strong> {activeServiceDetail?.productId?.description || 'No product description available'}</Typography>
                  <Typography sx={{ mt: 1 }}><strong>Status:</strong> {activeServiceDetail?.productId?.isActive ? 'Active' : 'Inactive'}</Typography>
                  <Typography><strong>Tags:</strong> {Array.isArray(activeServiceDetail?.productId?.tags) && activeServiceDetail.productId.tags.length ? activeServiceDetail.productId.tags.join(', ') : 'No tags'}</Typography>
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0f172a', mb: 1 }}>
                  Service Steps / Process
                </Typography>
                {getServiceSteps(activeServiceDetail).length ? (
                  <Stack spacing={1}>
                    {getServiceSteps(activeServiceDetail).map((step) => (
                      <Box key={`${step.order}-${step.title}`} sx={{ p: 1.2, border: '1px solid #d6dde6', borderRadius: 1.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          Step {step.order}: {step.title}
                        </Typography>
                        <Typography sx={{ color: '#64748b' }}>
                          {step.description || 'No description'}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ color: '#94a3b8' }}>No step details available for this service.</Typography>
                )}
              </Box>
            </Stack>
          ) : (
            <Stack spacing={1}>
              <Typography><strong>Service:</strong> {activeServiceName}</Typography>
              <Typography sx={{ color: '#64748b' }}>
                Detailed product/service information is not available for this item yet.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.2 }}>
          <Button
            variant={expertise.includes(activeServiceName) ? 'contained' : 'outlined'}
            onClick={() => toggleExpertise(activeServiceName)}
            disabled={!activeServiceName}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {expertise.includes(activeServiceName) ? 'Selected' : 'Select Service'}
          </Button>
          <Button onClick={() => setActiveServiceName('')} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 1 }}>
        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: 18, sm: 24 } }}>
          Custom Skills
        </Typography>
        <Typography sx={{ color: '#64748b', mt: 0.2, fontSize: 17 }}>
          Add specific skills you have
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <TextField
          fullWidth
          placeholder="e.g., PCB Repair, Thermostat Replacement..."
          value={skillInput}
          onChange={(e) => {
            setSkillInput(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSkill();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.8,
              bgcolor: '#ffffff',
            },
            '& .MuiInputBase-input': {
              fontSize: 17,
              py: 1.6,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BuildOutlinedIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          onClick={addSkill}
          startIcon={<AddIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 1.8,
            px: 3,
            py: 1.2,
            minWidth: 120,
            bgcolor: '#14967f',
            '&:hover': { bgcolor: '#117d6a' },
          }}
        >
          Add
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.1} flexWrap="wrap" sx={{ gap: 1.1 }}>
        {skills.map((skill) => (
          <Chip
            key={skill}
            label={skill}
            onDelete={() => removeSkill(skill)}
            icon={<BuildOutlinedIcon />}
            sx={{
              bgcolor: '#d7ece9',
              color: '#0f766e',
              border: '1px solid #a4d6ce',
              borderRadius: 1.6,
              px: 1,
              py: 2.2,
              '& .MuiChip-label': {
                fontSize: 18,
                fontWeight: 600,
              },
              '& .MuiChip-deleteIcon': {
                color: '#0f766e',
              },
            }}
          />
        ))}
      </Stack>

      {skills.length === 0 ? (
        <Typography sx={{ color: '#94a3b8', fontSize: 15 }}>
          No custom skills added yet.
        </Typography>
      ) : null}
    </Stack>
  );
}
