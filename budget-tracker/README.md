# 🔐💰 Güvenli Bütçe Planlama ve Takip Sistemi

Modern bir tam yığın (Full-Stack) bütçe yönetim uygulaması. Java Spring Boot backend ve React frontend ile geliştirilmiştir.

## 🎯 Proje Hakkında

Bu uygulama, kullanıcıların gelir ve giderlerini takip etmelerini, bütçe limitleri belirlemelerini ve finansal durumlarını analiz etmelerini sağlayan kapsamlı bir bütçe yönetim sistemidir.

## 🚀 Özellikler

### 🔐 Güvenlik
- JWT tabanlı kimlik doğrulama
- Şifreli parola saklama (BCrypt)
- Role-based access control (USER, ADMIN)
- CORS koruması

### 💳 İşlem Yönetimi
- Gelir/Gider ekleme, güncelleme, silme
- Kategori bazlı sınıflandırma
- Tarih bazlı filtreleme
- Sayfalama desteği
- Detaylı notlar

### 📊 Bütçe Planlama
- Kategori bazlı bütçe limitleri
- Periyodik bütçe (Günlük, Haftalık, Aylık, Yıllık)
- Otomatik harcama takibi
- Bütçe aşım uyarıları
- Eşik değer ayarlama (%80 gibi)

### 📈 Dashboard & Raporlama
- Toplam gelir/gider hesaplama
- Bakiye görüntüleme
- Gelir/Gider pasta grafiği
- Son işlemler listesi
- Bütçe uyarıları paneli

## 🛠️ Teknolojiler

### Backend
- **Framework:** Spring Boot 3.2.0
- **Security:** Spring Security + JWT
- **Database:** PostgreSQL
- **ORM:** Spring Data JPA / Hibernate
- **Build Tool:** Maven
- **Java:** 17

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Grafikler:** Recharts
- **İkonlar:** Lucide React
- **Stil:** CSS (Modern Dark Theme)

## 📦 Kurulum

### Gereksinimler
- JDK 17 veya üzeri
- Maven 3.6+
- Node.js 18+ ve npm
- PostgreSQL 14+

### Veritabanı Kurulumu

1. **PostgreSQL veritabanı oluşturun**
```sql
CREATE DATABASE budget_tracker;
```

2. **Bağlantı ayarlarını yapılandırın** (`budget-tracker/src/main/resources/application.properties`)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/budget_tracker
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### Backend Kurulumu

```bash
# Proje dizinine gidin
cd budget-tracker

# Maven bağımlılıklarını yükleyin
mvn clean install

# Uygulamayı başlatın
mvn spring-boot:run
```

Backend şu adreste çalışacaktır: `http://localhost:8080`

### Frontend Kurulumu

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Frontend şu adreste çalışacaktır: `http://localhost:5173`

## 🔑 Varsayılan Kullanıcılar

Uygulama ilk başlatıldığında aşağıdaki kullanıcılar otomatik oluşturulur:

| Kullanıcı | Şifre | Rol |
|-----------|-------|-----|
| admin | admin123 | ADMIN |
| user | user123 | USER |

## 📡 API Endpoints

### 🔐 Authentication
| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Giriş yapma |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi |

### 📋 Kategoriler
| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/categories` | Tüm kategoriler |
| GET | `/api/categories/type/{type}` | Tip bazlı kategoriler (INCOME/EXPENSE) |
| GET | `/api/categories/{id}` | Kategori detayı |

### 💰 İşlemler
| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/api/transactions` | Yeni işlem ekle |
| GET | `/api/transactions` | İşlemleri listele |
| GET | `/api/transactions?type=INCOME` | Gelir işlemleri |
| GET | `/api/transactions?type=EXPENSE` | Gider işlemleri |
| GET | `/api/transactions/{id}` | İşlem detayı |
| PUT | `/api/transactions/{id}` | İşlem güncelle |
| DELETE | `/api/transactions/{id}` | İşlem sil |
| GET | `/api/transactions/summary` | Finansal özet |

### 🎯 Bütçeler
| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/api/budgets` | Yeni bütçe oluştur |
| GET | `/api/budgets` | Bütçeleri listele |
| GET | `/api/budgets?active=true` | Aktif bütçeler |
| GET | `/api/budgets/{id}` | Bütçe detayı |
| PUT | `/api/budgets/{id}` | Bütçe güncelle |
| DELETE | `/api/budgets/{id}` | Bütçe sil |
| GET | `/api/budgets/alerts` | Bütçe uyarıları |

## 📝 Örnek API Kullanımı

### 1. Kayıt Olma
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "test123",
    "fullName": "Test User"
  }'
```

### 2. Giriş Yapma
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "test123"
  }'
```

### 3. İşlem Ekleme
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Market alışverişi",
    "amount": 250.50,
    "type": "EXPENSE",
    "categoryId": 1,
    "transactionDate": "2024-12-29",
    "notes": "Haftalık market"
  }'
```

### 4. Bütçe Oluşturma
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 3000,
    "categoryId": 1,
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "period": "MONTHLY",
    "alertThreshold": 80,
    "notes": "Aralık ayı market bütçesi"
  }'
```

## 🗄️ Veritabanı Şeması

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   users     │     │ transactions │     │ categories  │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ id          │←────│ user_id      │     │ id          │
│ username    │     │ category_id  │────→│ name        │
│ email       │     │ amount       │     │ type        │
│ password    │     │ type         │     │ icon        │
│ full_name   │     │ description  │     │ color       │
│ role        │     │ transaction_ │     │ description │
│ enabled     │     │ date         │     │ created_at  │
│ created_at  │     │ created_at   │     └─────────────┘
│ updated_at  │     │ updated_at   │           │
└─────────────┘     └──────────────┘           │
       │                                        │
       │            ┌──────────────┐           │
       │            │   budgets    │           │
       │            ├──────────────┤           │
       └───────────→│ user_id      │           │
                    │ category_id  │←──────────┘
                    │ amount       │
                    │ spent_amount │
                    │ start_date   │
                    │ end_date     │
                    │ period       │
                    │ alert_       │
                    │ threshold    │
                    │ is_active    │
                    │ created_at   │
                    │ updated_at   │
                    └──────────────┘
```

## 📱 Ekran Görüntüleri

### Dashboard
- Toplam gelir, gider ve bakiye kartları
- Gelir/Gider pasta grafiği
- Son işlemler listesi
- Bütçe uyarıları

### İşlemler Sayfası
- Tüm işlemlerin tablo görünümü
- Gelir/Gider filtreleme
- İşlem ekleme/düzenleme modalı
- Sayfalama

### Bütçeler Sayfası
- Aktif bütçeler listesi
- Kullanım yüzdesi progress barları
- Bütçe uyarıları
- Bütçe ekleme/düzenleme

## 🔧 Yapılandırma

### Backend (`application.properties`)
```properties
# Server
server.port=8080

# PostgreSQL Database
spring.datasource.url=jdbc:postgresql://localhost:5432/budget_tracker
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD

# JPA
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=mySecretKeyForBudgetTrackerSystemApplicationShouldBeLongEnough
jwt.expiration=86400000  # 24 saat
```

### Frontend (`src/api/api.js`)
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 📊 Varsayılan Kategoriler

### Gelir Kategorileri
| İkon | Kategori | Renk |
|------|----------|------|
| 💰 | Maaş | #4CAF50 |
| 💼 | Freelance | #8BC34A |
| 📈 | Yatırım | #CDDC39 |
| 🏠 | Kira | #FFEB3B |
| 🎁 | Hediye | #FFC107 |

### Gider Kategorileri
| İkon | Kategori | Renk |
|------|----------|------|
| 🛒 | Yiyecek | #FF5722 |
| 🚗 | Ulaşım | #FF9800 |
| 🏡 | Konut | #F44336 |
| ⚕️ | Sağlık | #E91E63 |
| 📚 | Eğitim | #9C27B0 |
| 🎭 | Eğlence | #673AB7 |
| 👔 | Giyim | #3F51B5 |
| 💻 | Teknoloji | #2196F3 |
| ⚽ | Spor | #03A9F4 |
| 🍽️ | Restoran | #00BCD4 |
| 🛍️ | Alışveriş | #009688 |
| 💳 | Borç Ödeme | #795548 |
| 🛡️ | Sigorta | #607D8B |
| 📦 | Diğer | #9E9E9E |

## 🧪 Test

```bash
# Tüm testleri çalıştır
mvn test

# Belirli bir test sınıfını çalıştır
mvn test -Dtest=UserServiceTest
```

## 🏗️ Proje Yapısı

```
Dönem Projesi/
├── budget-tracker/              # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/budget/
│   │   │   │   ├── config/      # Güvenlik, CORS yapılandırması
│   │   │   │   ├── controller/  # REST Controller'lar
│   │   │   │   ├── dto/         # Data Transfer Objects
│   │   │   │   ├── entity/      # JPA Entity'leri
│   │   │   │   ├── repository/  # Spring Data Repository'ler
│   │   │   │   └── service/     # İş mantığı
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
└── frontend/                    # Frontend (React + Vite)
    ├── src/
    │   ├── api/                 # API servis fonksiyonları
    │   ├── components/          # React bileşenleri
    │   ├── pages/               # Sayfa bileşenleri
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## 🎓 Mimari

### Katmanlı Mimari
```
┌─────────────────────────────────────────┐
│              Presentation               │
│         (React Frontend + CSS)          │
└────────────────────┬────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────┐
│               Controller                │
│           (REST Endpoints)              │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│                Service                  │
│           (Business Logic)              │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│              Repository                 │
│           (Data Access)                 │
└────────────────────┬────────────────────┘
                     │ JDBC/Hibernate
┌────────────────────▼────────────────────┐
│              PostgreSQL                 │
│              Database                   │
└─────────────────────────────────────────┘
```

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

**Geliştirici:** Furkan  
**Tarih:** 2025  
**Versiyon:** 2.0.0