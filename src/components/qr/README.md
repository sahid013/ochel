# QR Code Components

Professional, reusable QR code generation components for the Ochel restaurant platform.

## Components

### 1. `QRCodeGenerator`

The base component for generating QR codes. Can be used anywhere in the application.

**Features:**
- ✅ Rectangular QR codes with custom dimensions
- ✅ Logo overlay in the center (configurable size)
- ✅ Customizable colors and styling
- ✅ High-quality canvas rendering
- ✅ Error correction levels (L, M, Q, H)
- ✅ TypeScript support with full type safety

**Usage:**

```tsx
import { QRCodeGenerator } from '@/components/qr';

<QRCodeGenerator
  value="https://ochel.com/restaurant-name"
  width={400}
  height={300}
  logoUrl="/logo.png"
  logoSizePercent={10}
  color="#000000"
  backgroundColor="#FFFFFF"
  errorCorrectionLevel="H"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **required** | The data to encode (URL, text, etc.) |
| `width` | `number` | `400` | Width in pixels |
| `height` | `number` | `300` | Height in pixels |
| `logoUrl` | `string` | `undefined` | URL or base64 of logo to overlay |
| `logoSizePercent` | `number` | `10` | Logo size as % of QR width (0-100) |
| `color` | `string` | `#000000` | QR code foreground color |
| `backgroundColor` | `string` | `#FFFFFF` | QR code background color |
| `errorCorrectionLevel` | `'L' \| 'M' \| 'Q' \| 'H'` | `M` | Error correction level |
| `margin` | `number` | `4` | Margin around QR code |
| `className` | `string` | `''` | Custom CSS classes |
| `onGenerated` | `(dataUrl: string) => void` | `undefined` | Callback when generated |

---

### 2. `QRCodeCard`

A complete QR code card with download and copy functionality.

**Features:**
- ✅ All features of QRCodeGenerator
- ✅ Download as PNG
- ✅ Copy to clipboard
- ✅ Custom title and description
- ✅ Additional custom actions

**Usage:**

```tsx
import { QRCodeCard } from '@/components/qr';

<QRCodeCard
  value="https://ochel.com/restaurant-name"
  title="Restaurant Menu QR Code"
  description="Scan to view our menu online"
  logoUrl="/restaurant-logo.png"
  downloadFileName="restaurant-menu-qr.png"
  width={400}
  height={300}
/>
```

**Additional Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'QR Code'` | Card title |
| `description` | `string` | `undefined` | Card description |
| `downloadFileName` | `string` | `'qrcode.png'` | File name for download |
| `showDownload` | `boolean` | `true` | Show download button |
| `showCopy` | `boolean` | `true` | Show copy button |
| `actions` | `ReactNode` | `undefined` | Custom action buttons |

---

### 3. `QRCodeSection`

Pre-configured QR code section for the restaurant settings page.

**Features:**
- ✅ Automatically uses restaurant's public menu URL
- ✅ Uses restaurant logo (if available)
- ✅ Uses restaurant's primary color
- ✅ Download and copy functionality
- ✅ Usage tips for restaurant owners

**Usage:**

```tsx
import { QRCodeSection } from '@/components/qr';

<QRCodeSection restaurant={restaurant} />
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `restaurant` | `Restaurant` | Restaurant object with slug, logo_url, primary_color, etc. |

---

## Examples

### Basic QR Code

```tsx
<QRCodeGenerator
  value="https://example.com"
  width={300}
  height={300}
/>
```

### QR Code with Logo

```tsx
<QRCodeGenerator
  value="https://restaurant.com/menu"
  width={400}
  height={300}
  logoUrl="/logo.png"
  logoSizePercent={10}
  errorCorrectionLevel="H"
/>
```

### Custom Colored QR Code

```tsx
<QRCodeGenerator
  value="https://example.com"
  width={400}
  height={300}
  color="#F34A23"
  backgroundColor="#FFF5F0"
/>
```

### Complete QR Code Card

```tsx
<QRCodeCard
  value="https://restaurant.com/menu"
  title="Menu QR Code"
  description="Scan to view our digital menu"
  logoUrl="/logo.png"
  width={400}
  height={300}
  downloadFileName="menu-qr-code.png"
/>
```

### Custom Actions

```tsx
<QRCodeCard
  value="https://restaurant.com/menu"
  title="Menu QR Code"
  actions={
    <Button onClick={handleShare}>
      Share
    </Button>
  }
/>
```

---

## Technical Details

### QR Code Size and Logo

The logo is automatically centered in the QR code with a white circular background. The logo size is calculated as a percentage of the QR code width:

- Default logo size: 10% of QR code width
- Background circle: 20% larger than logo
- Recommended logo size: 5-15% for best scannability

### Error Correction Levels

Higher error correction allows QR codes to be scanned even if partially damaged:

- **L (Low)**: ~7% correction - Use for clean environments
- **M (Medium)**: ~15% correction - Default, good balance
- **Q (Quartile)**: ~25% correction - Better for outdoor use
- **H (High)**: ~30% correction - Best with logo overlay

### Performance

- QR codes are generated client-side using HTML5 Canvas
- No server-side processing required
- Logo images are loaded asynchronously
- Generates high-quality PNG images

---

## Integration in Settings Page

The QR code section is automatically added to the restaurant settings page after the color customization section:

```tsx
// In SettingsTab.tsx
import { QRCodeSection } from '@/components/qr';

<QRCodeSection restaurant={restaurant} />
```

---

## Browser Compatibility

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (10+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Dependencies

- `qrcode`: QR code generation library
- `@types/qrcode`: TypeScript definitions

---

## Future Enhancements

Potential improvements for future versions:

- [ ] Print preview modal
- [ ] Bulk QR code generation
- [ ] Multiple formats (SVG, PDF)
- [ ] Analytics tracking (scan counts)
- [ ] Short URL generation
- [ ] Dynamic QR codes (update destination without changing code)

---

## Support

For issues or questions about the QR code components, please contact the development team.
