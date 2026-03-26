import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PercentIcon from '@mui/icons-material/Percent';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const numberFmt = new Intl.NumberFormat('en-IN');

const formatINR = (value) => `INR ${numberFmt.format(value)}`;
const formatPct = (value) => `${value.toFixed(1)}%`;

const earningsTimeline = [
  { day: 'Mon', earnings: 2200, jobs: 3 },
  { day: 'Tue', earnings: 3200, jobs: 4 },
  { day: 'Wed', earnings: 2800, jobs: 3 },
  { day: 'Thu', earnings: 3700, jobs: 5 },
  { day: 'Fri', earnings: 4600, jobs: 6 },
  { day: 'Sat', earnings: 6100, jobs: 7 },
  { day: 'Sun', earnings: 5400, jobs: 6 },
];

const bookingsStatusByDay = [
  { day: 'Mon', completed: 2, cancelled: 1, pending: 1 },
  { day: 'Tue', completed: 3, cancelled: 1, pending: 1 },
  { day: 'Wed', completed: 2, cancelled: 0, pending: 1 },
  { day: 'Thu', completed: 4, cancelled: 1, pending: 2 },
  { day: 'Fri', completed: 5, cancelled: 1, pending: 2 },
  { day: 'Sat', completed: 6, cancelled: 1, pending: 2 },
  { day: 'Sun', completed: 5, cancelled: 2, pending: 2 },
];

const ratingDistribution = [
  { name: '5 Star', value: 48 },
  { name: '4 Star', value: 26 },
  { name: '3 Star', value: 10 },
  { name: '2 Star', value: 4 },
  { name: '1 Star', value: 2 },
];

const ratingColors = ['#0ea5e9', '#22c55e', '#f59e0b', '#fb7185', '#94a3b8'];

const serviceWiseRows = [
  { service: 'AC Repair', jobs: 40, earnings: 20000 },
  { service: 'Fridge Repair', jobs: 30, earnings: 13500 },
  { service: 'TV Repair', jobs: 20, earnings: 8000 },
];

const locationRows = [
  { area: 'Pimpri', jobs: 28 },
  { area: 'Wakad', jobs: 20 },
  { area: 'Nigdi', jobs: 14 },
  { area: 'Ravet', jobs: 10 },
];

const slotPerformance = [
  { slot: 'Morning', onlineHours: 24, bookings: 16 },
  { slot: 'Afternoon', onlineHours: 20, bookings: 14 },
  { slot: 'Evening', onlineHours: 26, bookings: 27 },
  { slot: 'Night', onlineHours: 12, bookings: 6 },
];

const paymentHistory = [
  { date: '2026-03-17', mode: 'Online', amount: 2200, status: 'Paid' },
  { date: '2026-03-18', mode: 'Cash', amount: 1500, status: 'Paid' },
  { date: '2026-03-19', mode: 'Online', amount: 3700, status: 'Paid' },
  { date: '2026-03-20', mode: 'Online', amount: 1900, status: 'Pending' },
];

const reportWeekly = {
  totalEarnings: 28000,
  jobsCompleted: 27,
  bestDay: 'Saturday',
  weakDay: 'Monday',
};

const reportMonthly = {
  totalEarnings: 108000,
  jobsCompleted: 102,
  bestDay: 'Sunday',
  weakDay: 'Wednesday',
};

const KpiCard = ({ title, value, icon, color = '#0f172a', subtitle }) => (
  <Card>
    <CardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography color="text.secondary">{title}</Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: '#e0f2fe',
            color: '#0284c7',
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography variant="h5" sx={{ color, fontWeight: 800 }}>{value}</Typography>
      {subtitle ? <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 13 }}>{subtitle}</Typography> : null}
    </CardContent>
  </Card>
);

const SectionTitle = ({ title, subtitle }) => (
  <Box>
    <Typography variant="h6">{title}</Typography>
    {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
  </Box>
);

export default function DashboardPage() {
  const totalRequests = 132;
  const acceptedJobs = 104;
  const completedJobs = 91;
  const cancelledJobs = 13;
  const pendingJobs = 15;
  const rejectedJobs = 13;
  const missedBookings = 9;
  const totalEarnings = 108000;
  const todayEarnings = 5400;

  const acceptanceRate = (acceptedJobs / totalRequests) * 100;
  const completionRate = (completedJobs / acceptedJobs) * 100;

  const weeklyEarnings = earningsTimeline.reduce((sum, row) => sum + row.earnings, 0);
  const dailyEarnings = Math.round(weeklyEarnings / earningsTimeline.length);
  const monthlyEarnings = totalEarnings;
  const yearlyEarnings = 1320000;
  const avgEarningPerDay = Math.round(monthlyEarnings / 30);
  const avgEarningPerJob = Math.round(totalEarnings / completedJobs);
  const highestEarningDay = earningsTimeline.reduce((max, row) => (row.earnings > max.earnings ? row : max), earningsTimeline[0]);

  const avgCompletionHours = 2.4;
  const responseMinutes = 11;
  const onTimeRate = 92.7;

  const avgRating = 4.5;
  const totalReviews = 90;

  const topService = serviceWiseRows.reduce((max, row) => (row.earnings > max.earnings ? row : max), serviceWiseRows[0]);
  const topArea = locationRows.reduce((max, row) => (row.jobs > max.jobs ? row : max), locationRows[0]);
  const topSlot = slotPerformance.reduce((max, row) => (row.bookings > max.bookings ? row : max), slotPerformance[0]);

  const totalWorkingHours = 210;
  const activeWorkingHours = 148;
  const idleHours = totalWorkingHours - activeWorkingHours;
  const efficiencyPct = (activeWorkingHours / totalWorkingHours) * 100;

  const paidAmount = paymentHistory
    .filter((row) => row.status === 'Paid')
    .reduce((sum, row) => sum + row.amount, 0);
  const pendingPayments = paymentHistory
    .filter((row) => row.status === 'Pending')
    .reduce((sum, row) => sum + row.amount, 0);
  const onlinePayments = paymentHistory
    .filter((row) => row.mode === 'Online')
    .reduce((sum, row) => sum + row.amount, 0);
  const cashPayments = paymentHistory
    .filter((row) => row.mode === 'Cash')
    .reduce((sum, row) => sum + row.amount, 0);

  const missedPotentialEarnings = 5000;
  const earningsGrowthPct = 25;
  const bookingGrowthPct = 14;

  const peakBookingDay = bookingsStatusByDay.reduce(
    (max, row) => {
      const total = row.completed + row.cancelled + row.pending;
      return total > max.total ? { day: row.day, total } : max;
    },
    { day: bookingsStatusByDay[0].day, total: 0 }
  );

  return (
    <Stack spacing={1.5}>
      <Box sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.25 }}>📊 Service Provider Analytics</Typography>
        <Typography variant="caption" color="text.secondary">Operational intelligence with sample data</Typography>
      </Box>

      {/* SECTION 1: KEY PERFORMANCE INDICATORS */}
      <Box>
        <Grid container spacing={1.5}>
          <Grid item xs={6} sm={4} md={2.4}><KpiCard title="Total Bookings" value={totalRequests} icon={<AssignmentIcon fontSize="small" />} /></Grid>
          <Grid item xs={6} sm={4} md={2.4}><KpiCard title="Completed Jobs" value={completedJobs} icon={<CheckCircleIcon fontSize="small" />} color="#166534" /></Grid>
          <Grid item xs={6} sm={4} md={2.4}><KpiCard title="Cancelled Jobs" value={cancelledJobs} icon={<CancelIcon fontSize="small" />} color="#b91c1c" /></Grid>
          <Grid item xs={6} sm={4} md={2.4}><KpiCard title="Earnings (Total)" value={formatINR(totalEarnings)} icon={<CurrencyRupeeIcon fontSize="small" />} color="#0c4a6e" /></Grid>
          <Grid item xs={6} sm={4} md={2.4}><KpiCard title="Today's Earnings" value={formatINR(todayEarnings)} icon={<TrendingUpIcon fontSize="small" />} /></Grid>
        </Grid>
      </Box>
      <Divider sx={{ my: 0.5 }} />

      {/* SECTION 2: EARNINGS & RATINGS */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.2 }}>💰 Earnings Analytics</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Daily, weekly, monthly, yearly breakdown</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1.5 }} flexWrap="wrap">
                <Chip label={`Daily: ${formatINR(dailyEarnings)}`} variant="outlined" size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip label={`Weekly: ${formatINR(weeklyEarnings)}`} variant="outlined" size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip label={`Monthly: ${formatINR(monthlyEarnings)}`} variant="outlined" size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip label={`Yearly: ${formatINR(yearlyEarnings)}`} variant="outlined" size="small" sx={{ fontSize: '0.7rem' }} />
              </Stack>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={earningsTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatINR(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="earnings" stroke="#0ea5e9" strokeWidth={3} name="Earnings" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={0.5} sx={{ fontSize: '0.85rem' }}>
                <Typography variant="caption" color="text.secondary"><strong>{highestEarningDay.day}</strong> ({formatINR(highestEarningDay.earnings)})</Typography>
                <Typography variant="caption" color="text.secondary">Avg/day: <strong>{formatINR(avgEarningPerDay)}</strong></Typography>
                <Typography variant="caption" color="text.secondary">Avg/job: <strong>{formatINR(avgEarningPerJob)}</strong></Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.2 }}>⭐ Ratings & Reviews</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Service quality snapshot</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 1 }}>
                <StarIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{avgRating}</Typography>
                <Typography variant="caption" color="text.secondary">({totalReviews})</Typography>
              </Stack>
              <Box sx={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ratingDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={82} label>
                      {ratingDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={ratingColors[index % ratingColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8 }}>Most common: <strong>Fast Service</strong></Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ my: 0.5 }} />

      {/* SECTION 3: BOOKINGS & SERVICES & LOCATIONS */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.2 }}>📋 Bookings Analytics</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Completed vs cancelled vs pending trend</Typography>
              <Stack direction="row" spacing={0.8} sx={{ mt: 1, mb: 1.5 }} flexWrap="wrap">
                <Chip label={`Total: ${totalRequests}`} size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip label={`Accepted: ${acceptedJobs}`} size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip label={`Rejected: ${rejectedJobs}`} size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip label={`Completed: ${completedJobs}`} size="small" sx={{ fontSize: '0.7rem' }} />
                <Chip label={`Cancelled: ${cancelledJobs}`} size="small" sx={{ fontSize: '0.7rem' }} />
              </Stack>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsStatusByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#22c55e" />
                    <Bar dataKey="cancelled" fill="#ef4444" />
                    <Bar dataKey="pending" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>Peak: <strong>{peakBookingDay.day}</strong> ({peakBookingDay.total})</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Grid container spacing={1.5} sx={{ height: '100%' }}>
            <Grid item xs={12}>
              <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.2 }}>🔧 Service-wise</Typography>
                  <Table size="small" sx={{ mt: 0.5 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Service</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Jobs</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Earnings</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviceWiseRows.map((row) => (
                        <TableRow key={row.service}>
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{row.service}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.7rem', p: 0.5 }}>{row.jobs}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>{formatINR(row.earnings)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.2 }}>📍 Location Analytics</Typography>
                  <Table size="small" sx={{ mt: 0.5 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Area</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Jobs</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {locationRows.map((row) => (
                        <TableRow key={row.area}>
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{row.area}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.7rem', p: 0.5 }}>{row.jobs}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ my: 0.5 }} />

      {/* SECTION 4: SERVICES & LOCATIONS */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.3 }}>🔧 Service-wise Analytics</Typography>
              <Typography variant="caption" color="text.secondary">Performance breakdown by expertise</Typography>
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Jobs</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Earnings</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviceWiseRows.map((row) => (
                    <TableRow key={row.service}>
                      <TableCell>{row.service}</TableCell>
                      <TableCell align="right">{row.jobs}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatINR(row.earnings)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>💡 Top revenue: <strong>{topService.service}</strong> generates highest income</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.3 }}>📍 Location Analytics</Typography>
              <Typography variant="caption" color="text.secondary">Demand by service area</Typography>
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Area</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Jobs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locationRows.map((row) => (
                    <TableRow key={row.area}>
                      <TableCell>{row.area}</TableCell>
                      <TableCell align="right">{row.jobs}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>🎯 Strongest market: <strong>{topArea.area}</strong> drives most bookings</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ my: 1 }} />

      {/* SECTION 5: AVAILABILITY & UTILIZATION */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.3 }}>⏰ Availability vs Bookings</Typography>
              <Typography variant="caption" color="text.secondary">Online hours vs booking distribution by slot</Typography>
              <Box sx={{ height: 280, mt: 1.5 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slotPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="slot" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onlineHours" fill="#64748b" />
                    <Bar dataKey="bookings" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>🚀 Peak time: <strong>{topSlot.slot}</strong> slot has maximum bookings</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.3 }}>💼 Utilization Analytics</Typography>
              <Typography variant="caption" color="text.secondary">Working time efficiency tracking</Typography>
              <Stack spacing={1.3} sx={{ mt: 1.5 }}>
                <Chip label={`Total working hours: ${totalWorkingHours}h`} variant="outlined" />
                <Chip label={`Active time: ${activeWorkingHours}h`} variant="outlined" />
                <Chip label={`Idle time: ${idleHours}h`} variant="outlined" />
                <Chip label={`Efficiency: ${formatPct(efficiencyPct)}`} color="success" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ my: 1 }} />

      {/* SECTION 6: PAYMENTS, OPPORTUNITIES & REPORTS */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.3 }}>💳 Payments Analytics</Typography>
              <Typography variant="caption" color="text.secondary">Paid vs pending and payment mode split</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5, mb: 2 }}>
                <Chip label={`Paid: ${formatINR(paidAmount)}`} color="success" />
                <Chip label={`Pending: ${formatINR(pendingPayments)}`} color="warning" />
                <Chip label={`Online: ${formatINR(onlinePayments)}`} variant="outlined" />
                <Chip label={`Cash: ${formatINR(cashPayments)}`} variant="outlined" />
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((row) => (
                    <TableRow key={`${row.date}-${row.mode}-${row.amount}`}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.mode}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatINR(row.amount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          size="small"
                          color={row.status === 'Paid' ? 'success' : 'warning'}
                          variant={row.status === 'Paid' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px solid #fee2e2' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.3 }}>⚠️ Missed Opportunities</Typography>
              <Typography variant="caption" color="text.secondary">Potential revenue leakage analysis</Typography>
              <Stack spacing={1.3} sx={{ mt: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Missed bookings: <strong style={{ color: '#dc2626', fontSize: '1.1em' }}>{missedBookings}</strong></Typography>
                <Typography variant="body2" color="text.secondary">Rejected bookings: <strong style={{ color: '#dc2626', fontSize: '1.1em' }}>{rejectedJobs}</strong></Typography>
                <Typography variant="body2" color="text.secondary">Potential earnings missed: <strong style={{ color: '#dc2626', fontSize: '1.1em' }}>{formatINR(missedPotentialEarnings)}</strong></Typography>
              </Stack>
            </CardContent>
          </Card>


        </Grid>
      </Grid>
    </Stack>
  );
}
