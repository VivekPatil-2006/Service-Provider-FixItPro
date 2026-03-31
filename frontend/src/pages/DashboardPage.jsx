import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
const rupee = (value) => `₹${numberFmt.format(value)}`;

const periodTabs = ['This Week', 'This Month', 'This Quarter'];

const kpiItems = [
  {
    title: 'Total Bookings',
    value: '234',
    delta: '+12%',
    deltaColor: '#1f8a4d',
    icon: <CalendarMonthRoundedIcon fontSize="small" />,
    iconBg: '#d9f7ee',
    iconColor: '#138b52',
  },
  {
    title: 'Completed',
    value: '180',
    delta: '+8%',
    deltaColor: '#1f8a4d',
    icon: <CheckCircleRoundedIcon fontSize="small" />,
    iconBg: '#e6f6ed',
    iconColor: '#23935a',
  },
  {
    title: 'Cancelled',
    value: '12',
    delta: '-5%',
    deltaColor: '#c44545',
    icon: <CancelRoundedIcon fontSize="small" />,
    iconBg: '#fff2e5',
    iconColor: '#d58c1f',
  },
  {
    title: 'Total Earnings',
    value: '₹2,55,100',
    delta: '+15%',
    deltaColor: '#1f8a4d',
    icon: <CurrencyRupeeRoundedIcon fontSize="small" />,
    iconBg: '#e8f5f2',
    iconColor: '#13785d',
  },
  {
    title: "Today's Earnings",
    value: '₹3,300',
    delta: '2 jobs done',
    deltaColor: '#6f7783',
    icon: <TrendingUpRoundedIcon fontSize="small" />,
    iconBg: '#eef4ff',
    iconColor: '#4576c9',
  },
];

const earningsTrend = [
  { day: 'Mar 1', value: 3600 },
  { day: 'Mar 3', value: 2100 },
  { day: 'Mar 5', value: 4200 },
  { day: 'Mar 7', value: 2400 },
  { day: 'Mar 9', value: 5100 },
  { day: 'Mar 11', value: 2600 },
  { day: 'Mar 13', value: 4300 },
  { day: 'Mar 15', value: 3500 },
  { day: 'Mar 17', value: 5900 },
  { day: 'Mar 19', value: 3000 },
  { day: 'Mar 21', value: 4100 },
  { day: 'Mar 23', value: 3200 },
  { day: 'Mar 25', value: 5000 },
  { day: 'Mar 26', value: 2800 },
];

const bookingStatus = [
  { name: 'Completed', value: 180, fill: '#1f8a4d' },
  { name: 'Confirmed', value: 20, fill: '#3b82f6' },
  { name: 'Pending', value: 16, fill: '#f0ad29' },
  { name: 'Cancelled', value: 12, fill: '#d9534f' },
];

const ratingSplit = [
  { name: '5★', value: 128, fill: '#16955f' },
  { name: '4★', value: 67, fill: '#2f7fe9' },
  { name: '3★', value: 24, fill: '#f0ad29' },
  { name: '2★', value: 10, fill: '#e55d5d' },
  { name: '1★', value: 5, fill: '#74b87a' },
];

const slotPerformance = [
  { slot: '9-12 AM', bookings: 82 },
  { slot: '12-2 PM', bookings: 36 },
  { slot: '2-5 PM', bookings: 64 },
  { slot: '5-8 PM', bookings: 33 },
];

const serviceAnalytics = [
  { service: 'AC Repair', bookings: 145, revenue: 87000, rating: 4.8 },
  { service: 'AC Installation', bookings: 52, revenue: 130000, rating: 4.7 },
  { service: 'Refrigerator Repair', bookings: 28, revenue: 33600, rating: 4.6 },
  { service: 'Washing Machine Repair', bookings: 9, revenue: 4500, rating: 4.4 },
];

const locationAnalytics = [
  { area: 'Koramangala', bookings: 48, revenue: 38400 },
  { area: 'HSR Layout', bookings: 35, revenue: 28000 },
  { area: 'Indiranagar', bookings: 31, revenue: 27900 },
  { area: 'Whitefield', bookings: 28, revenue: 22400 },
  { area: 'Electronic City', bookings: 22, revenue: 17600 },
  { area: 'JP Nagar', bookings: 18, revenue: 14400 },
];

const recentPayments = [
  { id: 'PAY-001', booking: 'BK-1003', amount: 1200, date: '2026-03-25', method: 'UPI', status: 'paid' },
  { id: 'PAY-002', booking: 'BK-1004', amount: 600, date: '2026-03-25', method: 'Cash', status: 'paid' },
  { id: 'PAY-003', booking: 'BK-1008', amount: 900, date: '2026-03-23', method: 'UPI', status: 'paid' },
  { id: 'PAY-004', booking: 'BK-1009', amount: 750, date: '2026-03-22', method: 'Card', status: 'paid' },
  { id: 'PAY-005', booking: 'BK-1002', amount: 2500, date: '2026-03-26', method: 'UPI', status: 'pending' },
  { id: 'PAY-006', booking: 'BK-1001', amount: 800, date: '2026-03-26', method: 'Cash', status: 'pending' },
];

const cardSx = {
  borderRadius: 2.8,
  border: '1px solid #d7dde6',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
  height: '100%',
};

function MetricCard({ item }) {
  return (
    <Card sx={{ ...cardSx, boxShadow: '0 2px 10px rgba(16, 24, 40, 0.04)' }}>
      <CardContent sx={{ p: { xs: 1.6, sm: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.2 }}>
          <Typography sx={{ fontSize: 13, sm: 14, color: '#6f7783', lineHeight: 1.2 }}>{item.title}</Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: item.iconBg,
              color: item.iconColor,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {item.icon}
          </Box>
        </Stack>
        <Typography sx={{ fontSize: { xs: 26, sm: 30 }, lineHeight: 1, fontWeight: 700, color: '#1d2939' }}>
          {item.value}
        </Typography>
        <Typography sx={{ mt: 0.6, fontSize: 13, fontWeight: 600, color: item.deltaColor }}>{item.delta}</Typography>
      </CardContent>
    </Card>
  );
}

function Panel({ title, subtitle, right, icon, children }) {
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: { xs: 1.25, sm: 1.6, md: 1.8 }, '&:last-child': { pb: { xs: 1.25, sm: 1.6, md: 1.8 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={0.6}
          sx={{ mb: 1.2 }}
        >
          <Box>
            <Stack direction="row" spacing={0.9} alignItems="center">
              {icon ? icon : null}
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20, md: 22 }, color: '#111827', lineHeight: 1.2 }}>
                {title}
              </Typography>
            </Stack>
            {subtitle ? <Typography sx={{ color: '#6b7280', mt: 0.1, fontSize: { xs: 12, sm: 13 } }}>{subtitle}</Typography> : null}
          </Box>
          {right}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }) {
  const isPaid = status === 'paid';
  return (
    <Chip
      size="small"
      label={status}
      sx={{
        textTransform: 'lowercase',
        borderRadius: 2,
        bgcolor: isPaid ? '#e6f7ee' : '#fff4df',
        color: isPaid ? '#198754' : '#af7a17',
        fontWeight: 600,
      }}
    />
  );
}

export default function DashboardPage() {
  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.2, md: 1.6, lg: 1.8 },
        bgcolor: '#f4f6f8',
        minHeight: '100%',
      }}
    >
      <Stack spacing={{ xs: 1.1, sm: 1.4 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={0.8}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 26, sm: 30, md: 34 }, fontWeight: 700, color: '#101828', lineHeight: 1.05 }}>
              Dashboard
            </Typography>
            <Typography sx={{ color: '#6b7280', mt: 0.2, fontSize: { xs: 13, sm: 14 } }}>
              Welcome back, Rajesh. Here&apos;s your performance overview.
            </Typography>
          </Box>

          <Box sx={{ p: 0.7, borderRadius: 2.4, bgcolor: '#e5e8ee' }}>
            <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', rowGap: 0.8 }}>
              {periodTabs.map((tab, index) => (
                <Button
                  key={tab}
                  variant={index === 1 ? 'contained' : 'text'}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 2.1,
                    py: 0.6,
                    minWidth: 106,
                    fontWeight: 600,
                    color: index === 1 ? '#111827' : '#667085',
                    bgcolor: index === 1 ? '#ffffff' : 'transparent',
                    boxShadow: index === 1 ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                    '&:hover': {
                      bgcolor: index === 1 ? '#ffffff' : '#dde3ea',
                    },
                  }}
                >
                  {tab}
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 1, sm: 1.2 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(5, minmax(0, 1fr))',
            },
          }}
        >
          {kpiItems.map((item) => (
            <MetricCard key={item.title} item={item} />
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 1.1, sm: 1.4 },
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 1fr',
            },
          }}
        >
          <Box>
            <Panel title="Earnings Trend" subtitle="Daily earnings this month">
              <Box sx={{ height: { xs: 210, sm: 230, md: 250 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={earningsTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e6ebf2" strokeDasharray="4 4" />
                    <XAxis dataKey="day" tick={{ fill: '#7b8794', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#7b8794', fontSize: 11 }} width={40} />
                    <Tooltip formatter={(v) => rupee(v)} />
                    <Line type="monotone" dataKey="value" stroke="#14946f" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Box>

          <Box>
            <Panel title="Booking Status" subtitle="Distribution of booking outcomes">
              <Box sx={{ height: { xs: 210, sm: 230, md: 250 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingStatus} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke="#edf1f7" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#7b8794', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#7b8794', fontSize: 11 }} width={34} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {bookingStatus.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 1.1, sm: 1.4 },
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: '1.2fr 1.1fr 1.2fr',
            },
          }}
        >
          <Box>
            <Panel title="Ratings Distribution" subtitle="Based on 234 reviews">
              <Stack direction={{ xs: 'column', sm: 'row', xl: 'column' }} spacing={1.2} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                <Box sx={{ width: { xs: '100%', sm: 190 }, maxWidth: 220, height: 170 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ratingSplit}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={64}
                        paddingAngle={3}
                      >
                        {ratingSplit.map((item) => (
                          <Cell key={item.name} fill={item.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Stack spacing={0.8} sx={{ width: { xs: '100%', sm: 140 } }}>
                  {ratingSplit.map((row) => (
                    <Stack key={row.name} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={0.7} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: row.fill }} />
                        <Typography sx={{ color: '#475467', fontSize: 14 }}>{row.name}</Typography>
                      </Stack>
                      <Typography sx={{ color: '#101828', fontWeight: 600 }}>{row.value}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Panel>
          </Box>

          <Box>
            <Panel title="Slot Performance" subtitle="Bookings by time slot">
              <Box sx={{ height: { xs: 150, sm: 165 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slotPerformance} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#edf1f7" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#7b8794', fontSize: 11 }} />
                    <YAxis dataKey="slot" type="category" tick={{ fill: '#6b7280', fontSize: 12 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#138b74" radius={[0, 7, 7, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Box>

          <Box>
            <Stack spacing={{ xs: 1.1, sm: 1.4 }} sx={{ height: '100%' }}>
              <Panel
                title="Utilization"
                icon={<CardGiftcardOutlinedIcon sx={{ color: '#0f8f7b', fontSize: 21 }} />}
              >
                <Stack spacing={1.2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ color: '#667085', fontSize: 14 }}>Slot utilization</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#101828', fontSize: 14 }}>72%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={72}
                      sx={{ height: 8, borderRadius: 999, bgcolor: '#edf1f7', '& .MuiLinearProgress-bar': { bgcolor: '#19a284' } }}
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ color: '#667085', fontSize: 14 }}>Completion rate</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#101828', fontSize: 14 }}>94%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={94}
                      sx={{ height: 8, borderRadius: 999, bgcolor: '#edf1f7', '& .MuiLinearProgress-bar': { bgcolor: '#1f8a4d' } }}
                    />
                  </Box>
                </Stack>
              </Panel>

              <Panel
                title="Missed Opportunities"
                icon={<WarningAmberRoundedIcon sx={{ color: '#f5b027', fontSize: 22 }} />}
              >
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Chip label="Rejected 8" sx={{ borderRadius: 3, bgcolor: '#ffe4e6', color: '#b42318', fontWeight: 600 }} />
                  <Chip label="Expired 5" sx={{ borderRadius: 3, bgcolor: '#fff3db', color: '#b7791f', fontWeight: 600 }} />
                  <Chip label="No-show 2" sx={{ borderRadius: 3, bgcolor: '#edf2f7', color: '#475467', fontWeight: 600 }} />
                </Stack>
              </Panel>
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 1.1, sm: 1.4 },
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 1fr',
            },
          }}
        >
          <Box>
            <Panel title="Service Analytics" subtitle="Performance by service type">
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#f1f5f9', color: '#667085', fontWeight: 600 } }}>
                      <TableCell>Service</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {serviceAnalytics.map((row) => (
                      <TableRow key={row.service} hover>
                        <TableCell sx={{ color: '#1f2937', fontWeight: 500 }}>{row.service}</TableCell>
                        <TableCell align="right">{row.bookings}</TableCell>
                        <TableCell align="right">{rupee(row.revenue)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.3} alignItems="center" justifyContent="flex-end">
                            <StarRoundedIcon sx={{ fontSize: 16, color: '#f0ad29' }} />
                            <Typography sx={{ fontSize: 14 }}>{row.rating}</Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Panel>
          </Box>

          <Box>
            <Panel title="Location Analytics" subtitle="Top performing areas">
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 460 }}>
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#f1f5f9', color: '#667085', fontWeight: 600 } }}>
                      <TableCell>Area</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locationAnalytics.map((row) => (
                      <TableRow key={row.area} hover>
                        <TableCell sx={{ color: '#1f2937', fontWeight: 500 }}>{row.area}</TableCell>
                        <TableCell align="right">{row.bookings}</TableCell>
                        <TableCell align="right">{rupee(row.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Panel>
          </Box>
        </Box>

        <Box>
            <Panel title="Recent Payments" subtitle="Your latest payment transactions">
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 760 }}>
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#f1f5f9', color: '#667085', fontWeight: 600 } }}>
                      <TableCell>Payment ID</TableCell>
                      <TableCell>Booking</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPayments.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.booking}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#101828' }}>{rupee(row.amount)}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.method}</TableCell>
                        <TableCell>
                          <StatusChip status={row.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Panel>
        </Box>
      </Stack>
    </Box>
  );
}