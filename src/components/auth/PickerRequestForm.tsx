"use client";

import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, Send, MapPin, User, Truck } from 'lucide-react';
import { fieldOpsApi, PickerRequestPayload } from '../../services/api';

interface PickerRequestFormProps {
  initialMobile: string;
  onBack: () => void;
  onSubmitted: (requestCode: string) => void;
  /** Backend said this number already has a pending request / an account. */
  onConflict: (code: string | undefined, message: string) => void;
}

const WORK_TYPES: { value: PickerRequestPayload['workType']; label: string; hint: string }[] = [
  { value: 'FIELD_COLLECTOR', label: 'Field Collector', hint: 'Weigh & collect scrap at doorsteps' },
  { value: 'DRIVER', label: 'Driver', hint: 'Drive the pickup vehicle' },
];

const VEHICLES: { value: PickerRequestPayload['vehicleType']; label: string }[] = [
  { value: 'NONE', label: 'I do not have a vehicle' },
  { value: 'BICYCLE', label: 'Bicycle' },
  { value: 'BIKE', label: 'Motorbike / Scooter' },
  { value: 'E_RICKSHAW', label: 'E-Rickshaw / Electric 3-Wheeler' },
  { value: 'AUTO', label: 'Auto / Tata Ace' },
  { value: 'MINI_TRUCK', label: 'Mini Truck' },
];

const AVAILABILITY: { value: PickerRequestPayload['availability']; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'WEEKENDS', label: 'Weekends only' },
];

const MOBILE_RX = /^[6-9]\d{9}$/;

const inputCls =
  'w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all';
const labelCls = 'block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5';

const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode }> = ({
  label,
  required,
  error,
  children,
}) => (
  <div>
    <label className={labelCls}>
      {label}
      {required && <span className="text-rose-400"> *</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-rose-400 mt-1 font-semibold">{error}</p>}
  </div>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

export const PickerRequestForm: React.FC<PickerRequestFormProps> = ({
  initialMobile,
  onBack,
  onSubmitted,
  onConflict,
}) => {
  const [fullName, setFullName] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');
  const [email, setEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Vijayawada');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('');
  const [workType, setWorkType] = useState<PickerRequestPayload['workType']>('FIELD_COLLECTOR');
  const [vehicleType, setVehicleType] = useState<PickerRequestPayload['vehicleType']>('NONE');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [availability, setAvailability] = useState<PickerRequestPayload['availability']>('FULL_TIME');
  const [about, setAbout] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 2) e.fullName = 'Enter your full name';
    if (alternateMobile && !MOBILE_RX.test(alternateMobile)) e.alternateMobile = 'Enter a valid 10-digit number';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    if (line1.trim().length < 5) e.line1 = 'Enter your house no. / street (min 5 characters)';
    if (area.trim().length < 2) e.area = 'Enter your area / locality';
    if (city.trim().length < 2) e.city = 'Enter your city';
    if (!/^\d{6}$/.test(pincode)) e.pincode = 'Enter a 6-digit pincode';
    if (vehicleType !== 'NONE' && experienceYears && Number(experienceYears) > 50) e.experienceYears = 'Max 50 years';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) {
      setServerError('Please fix the highlighted fields.');
      return;
    }
    const payload: PickerRequestPayload = {
      fullName: fullName.trim(),
      mobile: initialMobile,
      ...(alternateMobile ? { alternateMobile } : {}),
      ...(email ? { email: email.trim() } : {}),
      address: {
        line1: line1.trim(),
        area: area.trim(),
        ...(landmark.trim() ? { landmark: landmark.trim() } : {}),
        city: city.trim(),
        ...(district.trim() ? { district: district.trim() } : {}),
        ...(state.trim() ? { state: state.trim() } : {}),
        pincode,
      },
      workType,
      vehicleType,
      ...(vehicleType !== 'NONE' && vehicleNumber.trim() ? { vehicleNumber: vehicleNumber.trim() } : {}),
      ...(experienceYears !== '' ? { experienceYears: Math.max(0, Math.floor(Number(experienceYears))) } : {}),
      availability,
      ...(about.trim() ? { about: about.trim() } : {}),
    };

    setSubmitting(true);
    const res = await fieldOpsApi.submitPickerRequest(payload);
    setSubmitting(false);

    if (res.success && res.data) {
      onSubmitted(res.data.requestCode);
      return;
    }
    const code = res.details?.code;
    if (code === 'REQUEST_PENDING' || code === 'ACCOUNT_EXISTS') {
      onConflict(code, res.message || '');
      return;
    }
    setServerError(res.message || 'Could not submit your request. Please try again.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-sm font-black text-white">Become a freelance picker</h3>
          <p className="text-[11px] text-slate-400">Fill in your details. Our team reviews every request.</p>
        </div>
      </div>

      {serverError && (
        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <Section icon={<User className="w-3.5 h-3.5" />} title="About you">
        <Field label="Full name" required error={errors.fullName}>
          <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As on your ID" maxLength={80} autoComplete="name" />
        </Field>
        <Field label="Mobile number (your login)">
          <div className="flex items-center rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2.5 text-sm font-mono text-emerald-300">
            +91 {initialMobile}
          </div>
        </Field>
        <Field label="Alternate mobile" error={errors.alternateMobile}>
          <input className={inputCls} inputMode="numeric" maxLength={10} value={alternateMobile} onChange={(e) => setAlternateMobile(e.target.value.replace(/\D/g, ''))} placeholder="Optional" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" autoComplete="email" />
        </Field>
      </Section>

      <Section icon={<MapPin className="w-3.5 h-3.5" />} title="Home address">
        <Field label="House no. / street" required error={errors.line1}>
          <input className={inputCls} value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="e.g. 12-3-45, Gandhi Street" maxLength={200} autoComplete="address-line1" />
        </Field>
        <Field label="Area / locality" required error={errors.area}>
          <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Benz Circle" maxLength={100} />
        </Field>
        <Field label="Landmark">
          <input className={inputCls} value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Optional - near temple, school..." maxLength={120} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" required error={errors.city}>
            <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} autoComplete="address-level2" />
          </Field>
          <Field label="Pincode" required error={errors.pincode}>
            <input className={inputCls} inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="520010" autoComplete="postal-code" />
          </Field>
          <Field label="District">
            <input className={inputCls} value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="NTR" maxLength={80} />
          </Field>
          <Field label="State">
            <input className={inputCls} value={state} onChange={(e) => setState(e.target.value)} maxLength={60} />
          </Field>
        </div>
      </Section>

      <Section icon={<Truck className="w-3.5 h-3.5" />} title="Work details">
        <Field label="I want to work as">
          <div className="grid grid-cols-2 gap-2">
            {WORK_TYPES.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => setWorkType(w.value)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  workType === w.value
                    ? 'bg-emerald-950/60 border-emerald-500 text-white'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">{w.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{w.hint}</div>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Vehicle">
          <select className={inputCls} value={vehicleType} onChange={(e) => setVehicleType(e.target.value as PickerRequestPayload['vehicleType'])}>
            {VEHICLES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </Field>
        {vehicleType !== 'NONE' && (
          <Field label="Vehicle number">
            <input className={`${inputCls} uppercase`} value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="AP 16 XX 1234" maxLength={20} />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Experience (years)" error={errors.experienceYears}>
            <input className={inputCls} inputMode="numeric" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="0" />
          </Field>
          <Field label="Availability">
            <select className={inputCls} value={availability} onChange={(e) => setAvailability(e.target.value as PickerRequestPayload['availability'])}>
              {AVAILABILITY.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Anything else we should know?">
          <textarea className={`${inputCls} resize-none`} rows={3} maxLength={300} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Optional - past work, areas you can cover..." />
          <p className="text-[10px] text-slate-500 mt-1 text-right">{about.length}/300</p>
        </Field>
      </Section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
      >
        {submitting ? (
          <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit request</span>
          </>
        )}
      </button>
      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
        We do not collect Aadhaar or other ID numbers here. If you are approved, our team will ask for your KYC documents.
      </p>
    </form>
  );
};
