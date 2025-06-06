# 🛡️ SecureAuth - Supabase Auth with Next.js

Sistem autentikasi yang aman dan fleksibel menggunakan Supabase dan Next.js dengan fitur keamanan tingkat tinggi dan UI/UX modern.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-2.39.3-green.svg)

## 🚀 Fitur Utama

### ✅ Autentikasi Lengkap
- **Registrasi** dengan validasi password yang kuat dan tips interaktif
- **Login** dengan verifikasi email dan role-based redirect
- **Forgot Password** & **Reset Password** dengan token security
- **Email Verification** otomatis dengan callback handling
- **Logout** dengan invalidasi token dan cleanup

### ✅ Keamanan Tingkat Tinggi
- **Rate Limiting** untuk mencegah brute force attacks
- **API Key Protection** dengan database storage dan permissions
- **Security Headers** (XSS, CSP, CSRF, Frame Options)
- **Input Validation** menggunakan Zod dengan pesan error spesifik
- **Audit Logging** untuk tracking semua aktivitas user
- **Row Level Security** (RLS) pada database

### ✅ Role-Based Access Control
- **User Dashboard** untuk pengguna biasa dengan quick actions
- **Admin Dashboard** untuk administrator dengan full management
- **API Key Management** dengan CRUD operations dan permissions
- **User Management** dengan status control dan role assignment

### ✅ UI/UX Modern & Responsive
- **Light/Dark Mode** toggle dengan smooth transitions
- **Purple-Yellow-White** color scheme dengan gradients
- **Mobile-First Design** dengan bottom navigation untuk mobile
- **Accessible Components** dengan ARIA support
- **Loading States** dan error handling yang informatif
- **Password Tips** dengan real-time validation feedback

### ✅ Developer Experience
- **TypeScript** untuk type safety
- **Tailwind CSS** untuk styling yang konsisten
- **Environment Variables** untuk konfigurasi yang fleksibel
- **Error Handling** dengan pesan dalam bahasa Indonesia
- **API Documentation** dengan contoh curl dan Postman collection

## 📋 Prerequisites

- **Node.js** 18+ 
- **Supabase** account dan project
- **PostgreSQL** database (via Supabase)
- **SMTP** configuration untuk email (optional)

## 🛠️ Quick Start

### 1. Clone & Install

\`\`\`bash
git clone <repository-url>
cd supabase-auth-nextjs
npm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` dengan kredensial Anda:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=dev-api-key-12345
NEXT_PUBLIC_APP_NAME=SecureAuth
NEXT_PUBLIC_APP_DESCRIPTION=Sistem Autentikasi Aman & Fleksibel

# Security Settings
NEXT_PUBLIC_SHOW_SENSITIVE_DATA=false
NODE_ENV=development
\`\`\`

### 3. Database Setup

Jalankan SQL schema di Supabase SQL Editor:

\`\`\`sql
-- Copy semua isi dari database-schema.sql
-- Dan jalankan di Supabase SQL Editor
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Server akan berjalan di `http://localhost:3000`

## 📡 API Documentation

### Authentication Endpoints

#### Register User
\`\`\`bash
curl -X POST 'http://localhost:3000/api/auth/register' \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-api-key-12345" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "repassword": "Password123"
  }'
\`\`\`

#### Login User
\`\`\`bash
curl -X POST 'http://localhost:3000/api/auth/login' \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-api-key-12345" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
\`\`\`

#### Get User Info
\`\`\`bash
curl -X GET 'http://localhost:3000/api/auth/me' \
  -H "x-api-key: dev-api-key-12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

### Admin Endpoints

#### List Users
\`\`\`bash
curl -X GET 'http://localhost:3000/api/admin/users?page=1&limit=10' \
  -H "x-api-key: dev-api-key-12345"
\`\`\`

#### Create API Key
\`\`\`bash
curl -X POST 'http://localhost:3000/api/admin/api-keys' \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-api-key-12345" \
  -d '{
    "key_name": "production-key",
    "permissions": ["auth", "users"],
    "expires_at": "2024-12-31T23:59:59Z"
  }'
\`\`\`

## 🔒 Security Features

### API Key System
- **Database Storage**: API keys disimpan dengan hash di database
- **Permission-based**: Setiap key memiliki permissions spesifik
- **Expiration Support**: API keys bisa di-set expired
- **Usage Tracking**: Last used timestamp dan analytics
- **Admin Management**: CRUD operations melalui admin dashboard

### Rate Limiting
- **In-memory**: Untuk development (reset saat restart)
- **Configurable**: Limits per endpoint dapat disesuaikan
- **IP-based**: Tracking berdasarkan IP address
- **Headers**: Response headers dengan limit info

### Data Security
- **Sensitive Data Hiding**: Token dan email disembunyikan di production
- **Input Sanitization**: Semua input divalidasi dengan Zod
- **SQL Injection Prevention**: Menggunakan parameterized queries
- **XSS Protection**: Content Security Policy dan sanitization

## 🎨 UI/UX Features

### Theme System
- **Light/Dark Mode**: Toggle dengan ikon di header
- **System Preference**: Deteksi preferensi sistem
- **Smooth Transitions**: Animasi yang halus
- **Persistent**: Theme tersimpan di localStorage

### Responsive Design
- **Mobile-First**: Design dimulai dari mobile
- **Breakpoints**: sm, md, lg, xl breakpoints
- **Touch-Friendly**: Button dan input yang mudah disentuh
- **Bottom Navigation**: Navigation style app untuk mobile

### Color Scheme
- **Primary**: Purple (#8b5cf6) untuk branding utama
- **Accent**: Yellow (#eab308) untuk highlights
- **Gradients**: Kombinasi purple-yellow untuk visual appeal
- **Semantic Colors**: Success, warning, error colors

## 🗄️ Database Schema

### Core Tables
\`\`\`sql
-- Users dengan role dan status
public.users (id, role_id, status, created_at, updated_at)

-- Roles untuk RBAC
roles (id, name, description, created_at)

-- API Keys dengan permissions
api_keys (id, key_name, key_value, permissions, expires_at, is_active)

-- Audit Logs untuk tracking
audit_logs (id, user_id, action, details, ip_address, created_at)
\`\`\`

### Relationships
- `users.role_id` → `roles.id`
- `api_keys.user_id` → `auth.users.id` (optional)
- `audit_logs.user_id` → `auth.users.id` (optional)

### Triggers
- **Auto-insert**: User baru otomatis masuk ke `public.users`
- **Updated_at**: Timestamp otomatis update
- **Cleanup**: Expired API keys dan old logs

## 🧪 Testing

### Automated Testing
\`\`\`bash
# Run test script
chmod +x test-api.sh
./test-api.sh
\`\`\`

### Manual Testing
- **Interactive**: Visit `/test-api` untuk GUI testing
- **Postman**: Import `postman-collection.json`
- **Browser**: Developer tools untuk network inspection

### Test Scenarios
- ✅ Registration dengan berbagai input
- ✅ Email verification flow
- ✅ Login/logout cycle
- ✅ Password reset flow
- ✅ Admin operations
- ✅ API key management
- ✅ Rate limiting
- ✅ Security headers

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Environment Variables for Production
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_API_KEY=your-production-api-key
NEXT_PUBLIC_SHOW_SENSITIVE_DATA=false
NODE_ENV=production
\`\`\`

### Security Checklist
- [ ] Environment variables configured
- [ ] API keys rotated for production
- [ ] SMTP configured for emails
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Database RLS enabled
- [ ] Audit logging active

## 🔧 Customization

### Adding New Features
1. **New API Endpoint**: Create route in `app/api/`
2. **Add Validation**: Use Zod schemas
3. **Add Middleware**: API key + rate limiting
4. **Update Documentation**: Add to README

### UI Customization
1. **Colors**: Update `tailwind.config.js`
2. **Components**: Modify in `components/ui/`
3. **Themes**: Update CSS variables
4. **Layouts**: Modify header/footer

### Database Changes
1. **Migration**: Add to `database-schema.sql`
2. **Types**: Update TypeScript interfaces
3. **API**: Update endpoints accordingly
4. **Tests**: Add test cases

## 🐛 Troubleshooting

### Common Issues

#### Hydration Errors
\`\`\`typescript
// Fix dengan useEffect dan mounted state
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
\`\`\`

#### API Key Errors
- Check database schema applied
- Verify default API key exists
- Check environment variables

#### Email Issues
- Configure SMTP in Supabase
- Check email templates
- Verify redirect URLs

#### Rate Limiting
- Restart server untuk clear in-memory
- Adjust limits di middleware
- Check IP detection

## 📚 Documentation

### Code Documentation
- **TypeScript Interfaces**: Semua types terdefinisi
- **JSDoc Comments**: Function documentation
- **README Files**: Setup dan usage guides
- **API Docs**: Endpoint documentation

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes dengan tests
4. Submit pull request
5. Code review process

## 📄 License

MIT License - bebas digunakan untuk proyek komersial dan personal.

## 🔗 Links

- **Demo**: [Live Demo](https://your-demo-url.com)
- **Documentation**: [API Docs](https://your-docs-url.com)
- **Support**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Dibuat dengan ❤️ menggunakan Next.js, Supabase, dan TypeScript**

> Sistem autentikasi yang production-ready dengan security terbaik dan UX yang modern.
\`\`\`
