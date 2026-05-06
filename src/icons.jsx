import * as Tabler from '@tabler/icons-react'

// Short aliases used throughout the app — these don't follow Tabler's
// canonical kebab-case names so they need an explicit mapping.
const ALIASES = {
  grid:         'IconLayoutGrid',
  pos:          'IconCashRegister',
  orders:       'IconClipboardCheck',
  kitchen:      'IconToolsKitchen2',
  reservation:  'IconCalendarEvent',
  table:        'IconTable',
  chart:        'IconChartBar',
  bell:         'IconBell',
  search:       'IconSearch',
  filter:       'IconFilter',
  'arrow-left': 'IconChevronLeft',
  'arrow-right':'IconChevronRight',
  caret:        'IconChevronDown',
  plus:         'IconPlus',
  minus:        'IconMinus',
  x:            'IconX',
  edit:         'IconPencil',
  delivery:     'IconTruckDelivery',
  takeaway:     'IconShoppingBag',
  dinein:       'IconToolsKitchen2',
  clock:        'IconClock',
  print:        'IconPrinter',
  invoice:      'IconFileText',
  draft:        'IconUpload',
  transactions: 'IconArrowsLeftRight',
  'menu-dots':  'IconDotsVertical',
  heart:        'IconHeart',
  eye:          'IconEye',
  info:         'IconInfoCircle',
  cart:         'IconShoppingCart',
  box:          'IconBox',
  users:        'IconUsers',
  store:        'IconBuildingStore',
  report:       'IconReportAnalytics',
  settings:     'IconSettings',
  logout:       'IconLogout',
  dollar:       'IconCurrencyDollar',
  warning:      'IconAlertTriangle',
  barcode:      'IconBarcode',
  receipt:      'IconReceipt',
  card:         'IconCreditCard',
  qr:           'IconQrcode',
  cash:         'IconCash',
  menu:         'IconMenu2',
  headphones:   'IconHeadphones',
  plug:         'IconPlug',
  bolt:         'IconBolt',
  watch:        'IconDeviceWatch',
  laptop:       'IconDeviceLaptop',
  mobile:       'IconDeviceMobile',
  cpu:          'IconCpu',
  keyboard:     'IconKeyboard',
  microphone:   'IconMicrophone',
  camera:       'IconCamera',
  battery:      'IconBattery',
  usb:          'IconUsb'
}

const pascalize = (name) =>
  name.split(/[\s\-_]+/).map(w => w ? w[0].toUpperCase() + w.slice(1) : '').join('')

function resolveTablerName(name) {
  if (!name) return null
  if (ALIASES[name]) return ALIASES[name]
  return 'Icon' + pascalize(name)
}

export const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 2, ...rest }) => {
  const key = resolveTablerName(name)
  if (!key) return null
  const Component = Tabler[key]
  if (!Component) return null
  return <Component size={size} color={color} stroke={strokeWidth} {...rest} />
}

// Kept for backward compatibility — the Categories page now uses <IconPicker />
// which lists the full Tabler set, so the short curated list is no longer used.
export const ICON_NAMES = Object.keys(ALIASES)
export const CATEGORY_ICON_NAMES = [
  'cart', 'box', 'headphones', 'plug', 'bolt', 'watch',
  'laptop', 'mobile', 'cpu', 'keyboard', 'microphone',
  'camera', 'battery', 'usb', 'kitchen', 'store'
]
