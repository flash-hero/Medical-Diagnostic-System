# MedCare AI — Landing Page Integration Guide

> How to connect the landing page buttons/links to your JEE application pages.

---

## What Needs to Change

All navigation links are in one file: **`app/page.tsx`**

---

## 1. CTA Buttons (Sign Up & Login)

**Location:** `app/page.tsx` — lines ~87-93

### Current Code

```tsx
<button className="px-10 py-4 bg-clinical-primary text-[#EDD9CC] font-semibold text-[11px] sm:text-xs tracking-[0.2em] uppercase hover:bg-clinical-primary/90 transition-colors duration-300 rounded-sm">
  Sign Up
</button>
<button className="px-10 py-4 border border-clinical-primary/20 text-clinical-primary/70 font-semibold text-[11px] sm:text-xs tracking-[0.2em] uppercase hover:border-clinical-primary/40 hover:text-clinical-primary transition-all duration-300 rounded-sm">
  Login
</button>
```

### Replace With

```tsx
<a
  href="/app/signup"
  className="px-10 py-4 bg-clinical-primary text-[#EDD9CC] font-semibold text-[11px] sm:text-xs tracking-[0.2em] uppercase hover:bg-clinical-primary/90 transition-colors duration-300 rounded-sm inline-block text-center"
>
  Sign Up
</a>
<a
  href="/app/login"
  className="px-10 py-4 border border-clinical-primary/20 text-clinical-primary/70 font-semibold text-[11px] sm:text-xs tracking-[0.2em] uppercase hover:border-clinical-primary/40 hover:text-clinical-primary transition-all duration-300 rounded-sm inline-block text-center"
>
  Login
</a>
```

> Replace `/app/signup` and `/app/login` with your actual JEE routes (e.g. `/MedCareApp/register`, `/auth/login`, etc.)

---

## 2. Footer Links

**Location:** `app/page.tsx` — footer section (~lines 120-180)

All footer links currently point to `href="#"`. Replace each `#` with the real route:

| Link Text | Current | Replace With |
|-----------|---------|-------------|
| Find Doctors | `#` | Your doctors page URL |
| Book Appointments | `#` | Your appointments page URL |
| Disease Prediction | `#` | Your prediction page URL |
| Cancer Detection | `#` | Your detection page URL |
| About Us | `#` | Your about page URL |
| Research | `#` | Your research page URL |
| Careers | `#` | Your careers page URL |
| Contact | `#` | Your contact page URL |
| Terms of Service | `#` | Your terms page URL |
| Privacy Policy | `#` | Your privacy page URL |
| Cookie Policy | `#` | Your cookie policy URL |
| HIPAA Compliance | `#` | Your HIPAA page URL |

### Example

```tsx
// Before
<a href="#" className="...">Find Doctors</a>

// After
<a href="/app/doctors" className="...">Find Doctors</a>
```

---

## 3. URL Format

**Same server (landing page served from JEE):**
```
href="/login"
href="/register"
href="/app/doctors"
```

**Different server/port:**
```
href="http://localhost:8080/MedCareApp/login"
href="http://localhost:8080/MedCareApp/register"
```

**Production:**
```
href="https://medcare-ai.com/login"
href="https://medcare-ai.com/register"
```

---

## Summary

1. Open `app/page.tsx`
2. Change `<button>` to `<a href="...">` for Sign Up and Login (add `inline-block text-center` to className)
3. Replace all `href="#"` in the footer with your actual page URLs
4. Rebuild: `npm run build`

That's it.
