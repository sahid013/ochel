-- Add QR code customization fields to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS qr_code_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS qr_code_bg_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS qr_code_logo_size INTEGER DEFAULT 10;

-- Add comments for documentation
COMMENT ON COLUMN restaurants.qr_code_color IS 'QR code foreground color (hex), defaults to primary_color if null';
COMMENT ON COLUMN restaurants.qr_code_bg_color IS 'QR code background color (hex)';
COMMENT ON COLUMN restaurants.qr_code_logo_size IS 'Logo size as percentage of QR code width (5-25)';
