# 🔗 دليل تقني شامل: ربط LinkedIn OAuth + النشر التلقائي

## 📋 فهرس المحتويات

1. [نظرة عامة على المشروع](#نظرة-عامة)
2. [شرح OAuth 2.0](#شرح-oauth)
3. [الملفات المُنشأة والمعدلة](#الملفات)
4. [شرح كل ملف بالتفصيل](#شرح-الملفات)
5. [مسار تدفق البيانات](#تدفق-البيانات)

---

## 1. نظرة عامة على المشروع {#نظرة-عامة}

### ما الذي بنيناه؟

بنينا نظام كامل يربط تطبيق **HireX** مع **LinkedIn** بحيث:
- المستخدم يربط حسابه على LinkedIn من صفحة الإعدادات
- بعد الربط، يمكنه نشر عروض العمل مباشرة على LinkedIn بنقرة واحدة
- النظام يولد المنشور بالذكاء الاصطناعي ثم ينشره تلقائياً

### البنية التقنية

```
Frontend (React + Vite)          Backend (Express.js)           LinkedIn API
┌──────────────────┐     ┌─────────────────────────┐    ┌──────────────────┐
│  Settings.jsx    │────▶│  linkedinRoutes.js       │    │  OAuth 2.0       │
│  PostCreator.jsx │     │  linkedinController.js   │───▶│  REST /posts API │
│  api/index.js    │     │  linkedinService.js      │    │  /v2/userinfo    │
└──────────────────┘     │  linkedin_token.js (DB)  │    └──────────────────┘
                         └─────────────────────────┘
```

---

## 2. شرح OAuth 2.0 {#شرح-oauth}

### ما هو OAuth 2.0؟

OAuth 2.0 هو بروتوكول تفويض يسمح لتطبيقك بالوصول لحساب المستخدم على خدمة خارجية (مثل LinkedIn) **بدون** أن يعطيك كلمة مروره.

### خطوات OAuth بالترتيب:

```
الخطوة 1: المستخدم يضغط "Connect LinkedIn"
    ↓
الخطوة 2: التطبيق يطلب رابط التفويض من الباكند
    ↓
الخطوة 3: الباكند يولد رابط LinkedIn مع المعلومات المطلوبة
    ↓
الخطوة 4: المستخدم يُحوّل لصفحة LinkedIn للموافقة
    ↓
الخطوة 5: المستخدم يوافق → LinkedIn يرجعه للباكند مع "code"
    ↓
الخطوة 6: الباكند يستبدل الـ code بـ access_token
    ↓
الخطوة 7: الباكند يحفظ الـ token في قاعدة البيانات
    ↓
الخطوة 8: المستخدم يُحوّل لصفحة الإعدادات مع رسالة نجاح
```

### المصطلحات الأساسية:

| المصطلح | الشرح |
|---------|-------|
| `Client ID` | معرف تطبيقك عند LinkedIn |
| `Client Secret` | المفتاح السري لتطبيقك |
| `Redirect URI` | الرابط الذي يرجع له LinkedIn بعد الموافقة |
| `Authorization Code` | كود مؤقت يُستبدل بالـ token |
| `Access Token` | مفتاح الوصول لعمل طلبات API |
| `Scopes` | الصلاحيات المطلوبة (نشر، قراءة بروفايل...) |

---

## 3. الملفات المُنشأة والمعدلة {#الملفات}

| الملف | النوع | الوظيفة |
|-------|-------|---------|
| `Backend/services/linkedinService.js` | باكند | التعامل المباشر مع LinkedIn API |
| `Backend/controllers/linkedinController.js` | باكند | معالجة طلبات HTTP |
| `Backend/routes/linkedinRoutes.js` | باكند | تعريف المسارات |
| `Backend/models/linkedin_token.js` | باكند | نموذج قاعدة البيانات |
| `src/api/index.js` | فرونتند | دوال API للتواصل مع الباكند |
| `src/Screens/Settings/Settings.jsx` | فرونتند | صفحة الإعدادات وربط LinkedIn |
| `src/Screens/PostCreator.jsx` | فرونتند | صفحة إنشاء ونشر المنشورات |
| `Backend/.env` | إعدادات | المتغيرات البيئية |

---

## 4. شرح كل ملف بالتفصيل {#شرح-الملفات}

---

### 📁 الملف 1: `Backend/.env` — المتغيرات البيئية

```env
# LinkedIn OAuth 2.0
LINKEDIN_CLIENT_ID=77w1fzvzstb3e3
LINKEDIN_CLIENT_SECRET=WPL_AP1.xxxxx
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/linkedin/callback
```

**الشرح:**
- `LINKEDIN_CLIENT_ID`: تحصل عليه من LinkedIn Developer Portal عند إنشاء تطبيق
- `LINKEDIN_CLIENT_SECRET`: المفتاح السري، لا تشاركه أبداً
- `LINKEDIN_REDIRECT_URI`: الرابط الذي يرجع له LinkedIn — **يجب** أن يكون مسجل في Developer Portal

> [!IMPORTANT]
> هذا الرابط (`LINKEDIN_REDIRECT_URI`) يجب أن يتطابق **حرفياً** مع ما هو مسجل في LinkedIn Developer Portal وإلا ستحصل على خطأ "redirect_uri does not match"

---

### 📁 الملف 2: `Backend/models/linkedin_token.js` — نموذج قاعدة البيانات

هذا الملف يعرف جدول في قاعدة البيانات لحفظ tokens:

```javascript
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LinkedInToken extends Model {}

  LinkedInToken.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // ربط مع جدول المستخدمين
    fk_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,  // كل مستخدم له token واحد فقط
      references: { model: 'users', key: 'id' }
    },
    // مفتاح الوصول من LinkedIn
    access_token: {
      type: DataTypes.TEXT,  // TEXT لأنه طويل جداً
      allowNull: false
    },
    // مفتاح التجديد (اختياري)
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // تاريخ انتهاء الصلاحية
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // معرف المستخدم على LinkedIn (مثل urn:li:person:abc123)
    linkedin_person_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // الصلاحيات الممنوحة
    scope: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'linkedin_token',
    tableName: 'linkedin_tokens',
    timestamps: true  // يضيف createdAt و updatedAt تلقائياً
  });

  return LinkedInToken;
};
```

**لماذا `unique: true` على `fk_user`?**
لأن كل مستخدم يربط حساب LinkedIn واحد فقط. لو ربط حساب جديد، نستبدل القديم باستخدام `upsert`.

---

### 📁 الملف 3: `Backend/services/linkedinService.js` — خدمة LinkedIn

هذا أهم ملف — يتعامل مباشرة مع LinkedIn API:

```javascript
const axios = require("axios");
require("dotenv").config();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

// إصدار API — LinkedIn يتطلب هذا الهيدر
// الإصدارات تنتهي بعد سنة تقريباً
const LINKEDIN_API_VERSION = "202604";
```

#### الدالة 1: `getAuthorizationUrl(state)` — توليد رابط التفويض

```javascript
getAuthorizationUrl(state) {
    // الصلاحيات المطلوبة:
    // openid + profile + email = تسجيل دخول وقراءة المعلومات
    // w_member_social = النشر على الحائط
    const scopes = ["openid", "profile", "email", "w_member_social"];

    const params = new URLSearchParams({
      response_type: "code",        // نريد authorization code
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      state,                        // للحماية من CSRF
      scope: scopes.join(" "),
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}
```

**ما هو `state`؟**
- هو قيمة عشوائية نرسلها مع الطلب
- LinkedIn يرجعها لنا بدون تغيير في الـ callback
- نستخدمها للتحقق أن الطلب أصلي (حماية من هجمات CSRF)
- نخزن فيها أيضاً `userId` لمعرفة من طلب الربط

#### الدالة 2: `exchangeCodeForToken(code)` — استبدال الكود بـ token

```javascript
async exchangeCodeForToken(code) {
    // نرسل POST لـ LinkedIn مع الكود
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,                              // الكود من callback
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }).toString(),
      // LinkedIn يتطلب هذا النوع من المحتوى
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in || 5184000, // 60 يوم
      refresh_token: response.data.refresh_token || null,
      scope: response.data.scope,
    };
}
```

**لماذا `application/x-www-form-urlencoded`؟**
LinkedIn يطلب البيانات بهذا الشكل (مثل الفورم العادي)، وليس JSON.

#### الدالة 3: `getProfile(accessToken)` — جلب بيانات المستخدم

```javascript
async getProfile(accessToken) {
    // نستخدم OpenID Connect userinfo endpoint
    const response = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    // response.data.sub = معرف المستخدم الفريد
    return response.data;
}
```

**لماذا `/v2/userinfo` وليس `/rest/`؟**
هذا endpoint خاص بـ OpenID Connect ولا يحتاج version header.

#### الدالة 4: `publishPost(...)` — النشر على LinkedIn ⭐

```javascript
async publishPost(accessToken, personUrn, text, link = null) {
    // التحقق أن لدينا معرف الشخص
    if (!personUrn) {
      throw new Error("LinkedIn person URN is missing");
    }

    // بناء جسم الطلب حسب LinkedIn REST API
    const postBody = {
      author: personUrn,           // مثل "urn:li:person:abc123"
      commentary: text,            // نص المنشور
      visibility: "PUBLIC",        // مرئي للجميع
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED", // نشر فوري
      isReshareDisabledByAuthor: false,
    };

    // إضافة رابط كمقال مرفق (اختياري)
    if (link) {
      postBody.content = {
        article: {
          source: link,
          title: "Apply Now",
          description: text.substring(0, 200),
        },
      };
    }

    const response = await axios.post(
      "https://api.linkedin.com/rest/posts",  // الـ endpoint الجديد
      postBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "LinkedIn-Version": LINKEDIN_API_VERSION,  // مهم جداً!
          "X-Restli-Protocol-Version": "2.0.0",
        },
        // LinkedIn يرجع 201 بدون body = نجاح
        validateStatus: (status) => status >= 200 && status < 300,
      }
    );

    // معرف المنشور يكون في الـ headers وليس الـ body
    const postId = response.headers["x-restli-id"];
    return { success: true, postId };
}
```

> [!WARNING]
> **نقطة مهمة جداً:** LinkedIn يرجع HTTP 201 مع **body فارغ** عند النجاح! معرف المنشور يكون في header اسمه `x-restli-id`. لو ما تعاملت مع هذا صح، الكود يفكر إن فيه خطأ.

> [!IMPORTANT]
> **`LinkedIn-Version` header:** هذا إجباري. LinkedIn يستخدم نظام إصدارات شهري بصيغة `YYYYMM`. كل إصدار يبقى فعال لمدة سنة تقريباً. لو استخدمت إصدار منتهي تحصل على خطأ "version not active".

---

### 📁 الملف 4: `Backend/controllers/linkedinController.js` — المتحكم

هذا الملف يستقبل طلبات HTTP ويستخدم الـ service:

#### `getAuthUrl` — توليد رابط التفويض

```javascript
exports.getAuthUrl = async (req, res) => {
    // توليد state عشوائي للحماية
    const state = crypto.randomBytes(16).toString("hex");

    // تخزين userId في الـ state (مشفر بـ base64)
    const stateData = Buffer.from(
      JSON.stringify({ userId: req.user.id, nonce: state })
    ).toString("base64");

    const url = linkedinService.getAuthorizationUrl(stateData);
    return res.json({ url, state: stateData });
};
```

**لماذا نخزن `userId` في الـ state؟**
لأن callback endpoint ما فيه authentication middleware (LinkedIn هو اللي يرسل الطلب، مو المستخدم). فنحتاج نعرف من هو المستخدم من الـ state.

#### `callback` — استقبال رد LinkedIn ⭐

```javascript
exports.callback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL;
    const { code, state, error: oauthError } = req.query;

    // 1. لو LinkedIn رجع خطأ (المستخدم رفض مثلاً)
    if (oauthError) {
      return res.redirect(`${frontendUrl}/settings?linkedin=error&reason=...`);
    }

    // 2. فك تشفير الـ state لاستخراج userId
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const userId = stateData.userId;

    // 3. استبدال الكود بـ access token
    const tokenData = await linkedinService.exchangeCodeForToken(code);

    // 4. جلب بيانات المستخدم (نحتاج الـ sub لعمل person URN)
    const profileData = await linkedinService.getProfile(tokenData.access_token);
    const personId = `urn:li:person:${profileData.sub}`;

    // 5. حفظ/تحديث الـ token في قاعدة البيانات
    await linkedin_token.upsert({
      fk_user: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
      linkedin_person_id: personId,
      scope: tokenData.scope,
    });

    // 6. تحويل المستخدم للفرونتند مع رسالة نجاح
    return res.redirect(`${frontendUrl}/settings?linkedin=success`);
};
```

**لماذا `upsert` وليس `create`؟**
`upsert` = إذا الـ record موجود يحدثه، إذا مو موجود ينشئه. هذا مهم لأن المستخدم ممكن يعيد الربط.

**لماذا لا نستخدم `authenticate` middleware هنا؟**
لأن هذا الـ endpoint يُستدعى من **LinkedIn مباشرة** (redirect)، وليس من الفرونتند. ما فيه JWT token في الطلب.

---

### 📁 الملف 5: `Backend/routes/linkedinRoutes.js` — المسارات

```javascript
const router = express.Router();
const { authenticate } = require("../middleware/auth");

// هذا بدون auth — LinkedIn يرسل الطلب مباشرة
router.get("/callback", linkedinController.callback);

// باقي المسارات محمية بـ JWT
router.use(authenticate);
router.get("/auth-url", linkedinController.getAuthUrl);
router.get("/status", linkedinController.status);
router.post("/publish", linkedinController.publishJob);
router.delete("/disconnect", linkedinController.disconnect);
```

**ترتيب المسارات مهم!**
`/callback` يجب أن يكون **قبل** `router.use(authenticate)` لأنه ما يحتاج token.

---

### 📁 الملف 6: `src/api/index.js` — API الفرونتند

```javascript
export const linkedinApi = {
  getAuthUrl: () => api.get("/linkedin/auth-url"),
  callback: (code, state) => api.get("/linkedin/callback", { params: { code, state } }),
  status: () => api.get("/linkedin/status"),
  publish: (data) => api.post("/linkedin/publish", data),
  disconnect: () => api.delete("/linkedin/disconnect"),
};
```

**الـ Vite proxy يحول `/api` → `http://localhost:3000`:**
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3000',
  },
}
```

---

### 📁 الملف 7: `Settings.jsx` — صفحة الإعدادات (الفرونتند)

#### معالجة رد OAuth:

```javascript
// عند العودة من LinkedIn، الرابط يكون:
// /settings?linkedin=success  أو  /settings?linkedin=error&reason=xxx
useEffect(() => {
    const liResult = searchParams.get('linkedin');
    if (liResult === 'success') {
      toast.success('LinkedIn connected successfully! 🎉');
    } else if (liResult === 'error') {
      toast.error(`Connection failed: ${searchParams.get('reason')}`);
    }
    // تنظيف الـ URL
    searchParams.delete('linkedin');
    setSearchParams(searchParams, { replace: true });
}, []);
```

#### بدء عملية الربط:

```javascript
const connectLinkedIn = async () => {
    // 1. اطلب رابط التفويض من الباكند
    const res = await linkedinApi.getAuthUrl();
    // 2. حوّل المستخدم لـ LinkedIn
    window.location.href = res.data.url;
};
```

---

## 5. مسار تدفق البيانات الكامل {#تدفق-البيانات}

### 🔐 مسار الربط (OAuth):

```
المستخدم                    الفرونتند                الباكند                  LinkedIn
   │                          │                        │                        │
   │── يضغط "Connect" ──────▶│                        │                        │
   │                          │── GET /auth-url ──────▶│                        │
   │                          │                        │── يولد الرابط ────────▶│
   │                          │◀── { url } ────────────│                        │
   │◀── redirect لـ LinkedIn ─│                        │                        │
   │                          │                        │                        │
   │── يوافق على LinkedIn ──────────────────────────────────────────────────────▶│
   │                          │                        │                        │
   │                          │                        │◀── GET /callback?code= ─│
   │                          │                        │── POST /accessToken ───▶│
   │                          │                        │◀── { access_token } ────│
   │                          │                        │── GET /userinfo ───────▶│
   │                          │                        │◀── { sub: "abc123" } ──│
   │                          │                        │── حفظ في DB ───────────│
   │◀── redirect /settings?linkedin=success ───────────│                        │
```

### 📤 مسار النشر:

```
المستخدم                    الفرونتند                الباكند                  LinkedIn
   │                          │                        │                        │
   │── يكتب/يولد المنشور ───▶│                        │                        │
   │── يضغط "Publish" ──────▶│                        │                        │
   │                          │── POST /publish ──────▶│                        │
   │                          │    { text, applyLink } │── يجلب token من DB ────│
   │                          │                        │── POST /rest/posts ───▶│
   │                          │                        │◀── 201 Created ────────│
   │                          │◀── { success: true } ──│                        │
   │◀── "Published!" ─────────│                        │                        │
```

---

## 🔧 الأخطاء الشائعة وحلولها

| الخطأ | السبب | الحل |
|-------|-------|------|
| `redirect_uri does not match` | الرابط غير مسجل في Developer Portal | سجّل `http://localhost:3000/api/linkedin/callback` في Auth tab |
| `version not active` | إصدار API منتهي | غيّر `LinkedIn-Version` لإصدار فعال مثل `202604` |
| `person URN is missing` | ما تم حفظ `sub` من الـ profile | أعد ربط الحساب |
| `token expired` | مر أكثر من 60 يوم | أعد ربط الحساب |

---

## 💡 نصائح مهمة

1. **لا تنشر `Client Secret` أبداً** — استخدم `.env` وأضفه لـ `.gitignore`
2. **إصدار LinkedIn API** يتغير كل شهر ويبقى فعال سنة — تابع التحديثات
3. **اختبر محلياً** باستخدام `http://localhost:3000` كـ redirect URI
4. **في الإنتاج** غيّر كل الروابط لـ `https://yourdomain.com`
