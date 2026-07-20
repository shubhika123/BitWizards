// components/LoginScreen.tsx
"use client";

import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const {
    sendOTP,
    verifyOTP,
    registerPhoneUser,
    loading,
    isMock
  } = useAuthStore();

  const [step, setStep] = useState<"PHONE" | "OTP" | "REGISTER">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [username, setUsername] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [error, setError] = useState("");

  const citiesList = [
    "Amritsar",
    "Belgaum",
    "Coimbatore",
    "Kolkata",
    "Ludhiana",
    "Madurai",
    "Mumbai",
    "Mysuru",
    "Patna",
    "Salem",
    "Vijayawada",
    "Vizag"
  ];

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms of Use & Privacy Policy.");
      return;
    }

    try {
      await sendOTP(phone);
      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP code.");
      return;
    }

    try {
      const isRegistered = await verifyOTP(phone, otp);
      if (!isRegistered) {
        setStep("REGISTER");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP code. Please use the test code 123456.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !age || !city || !username) {
      setError("Please fill out Name, Username, Age, and City fields.");
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0) {
      setError("Please enter a valid age.");
      return;
    }

    try {
      await registerPhoneUser(phone, name, ageNum, city, username);
    } catch (err: any) {
      setError(err.message || "Failed to complete profile registration.");
    }
  };

  const isPhoneValid = phone.length === 10 && agreeTerms;

  return (
    <div className="fixed inset-0 bg-[#f5f5f6] flex flex-col items-center justify-center z-50 p-4 select-none">


      {isMock && (
        <div className="mb-4 bg-amber-500/10 border border-amber-300/30 px-3.5 py-1.5 rounded-full text-amber-600 text-[9px] font-extrabold tracking-wider shadow-2xs">
          MOCK AUTH ACTIVE
        </div>
      )}

      <div className="bg-white border border-[#eaeaec] rounded-xs shadow-xs w-full max-w-[360px] overflow-hidden flex flex-col">

        <div className="relative w-full h-[140px] bg-gradient-to-r from-[#ffe4e6] to-[#fff1f2] flex items-center justify-between px-4 overflow-hidden border-b border-[#eaeaec]">
          <div className="absolute right-0 top-0 bottom-0 w-[42%] opacity-90 select-none pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80"
              alt="Myntra Models"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="z-10 flex flex-col gap-1 max-w-[55%] text-left">
            <div className="bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-xs border border-rose-100 w-fit text-[7.5px] font-extrabold text-gray-500 uppercase tracking-widest">
              Limited Offer
            </div>
            <h3 className="text-[#ff3f6c] text-[18px] font-black leading-tight tracking-tight uppercase">
              FLAT ₹300 OFF
            </h3>
            <p className="text-gray-500 text-[8.5px] font-bold leading-normal">
              ON YOUR 1ST ORDER + EXCITING OFFERS*
            </p>
            <div className="mt-1.5 flex items-center bg-white border border-dashed border-[#ff3f6c] px-2 py-1 w-fit rounded-xs select-all">
              <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-wider mr-1">CODE:</span>
              <span className="text-[8.5px] font-black text-[#ff3f6c] tracking-widest uppercase">MYNTRA300</span>
            </div>
          </div>
        </div>

        <div className="p-6.5 flex flex-col gap-5">

          {error && (
            <div className="bg-red-50 border border-red-150 p-2.5 text-[10px] text-red-600 font-bold leading-normal text-left">
              {error}
            </div>
          )}

          {step === "PHONE" && (
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
              <div className="text-left select-none">
                <h2 className="text-[#282c3f] text-base font-black tracking-wide">
                  Login <span className="text-gray-400 font-medium text-sm">or</span> Signup
                </h2>
              </div>

              <div className="flex items-center border border-gray-200 focus-within:border-gray-400 rounded-sm p-3.5 gap-2.5 transition-colors">
                <span className="text-xs font-bold text-gray-400">+91</span>
                <span className="text-gray-300 select-none text-xs">|</span>
                <input
                  type="tel"
                  placeholder="Mobile Number*"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 text-xs text-gray-700 bg-transparent outline-none placeholder-gray-400 font-semibold"
                  disabled={loading}
                />
              </div>

              <label className="flex gap-2.5 text-[10.5px] text-gray-500 font-medium leading-normal pl-0.5 select-none cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#ff3f6c] cursor-pointer rounded-xs border-gray-300 text-[#ff3f6c] focus:ring-0 focus:ring-offset-0"
                  disabled={loading}
                />
                <span>
                  By continuing, I agree to the{" "}
                  <span className="text-[#ff3f6c] font-black cursor-pointer hover:underline">Terms of Use</span> &{" "}
                  <span className="text-[#ff3f6c] font-black cursor-pointer hover:underline">Privacy Policy</span> and I
                  am above 18 years old.
                </span>
              </label>

              <button
                type="submit"
                disabled={!isPhoneValid || loading}
                className={`w-full py-3 rounded-xs font-black uppercase text-xs tracking-wider transition-all select-none active:scale-[0.99] border border-transparent ${
                  isPhoneValid && !loading
                    ? "bg-[#ff3f6c] text-white hover:bg-[#e02f59] cursor-pointer shadow-3xs"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Please wait..." : "Continue"}
              </button>

              <div className="text-[10px] text-gray-400 font-bold select-none mt-1 text-left">
                Have trouble logging in?{" "}
                <span className="text-[#ff3f6c] cursor-pointer hover:underline">Get help</span>
              </div>
            </form>
          )}

          {step === "OTP" && (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <div className="text-left">
                <h2 className="text-[#282c3f] text-base font-black tracking-wide">Verify with OTP</h2>
                <p className="text-gray-400 text-[10px] mt-0.5 font-bold">
                  Sent to +91 {phone}
                  <span
                    onClick={() => { setStep("PHONE"); setOtp(""); }}
                    className="text-[#ff3f6c] cursor-pointer font-black ml-2 hover:underline"
                  >
                    Edit
                  </span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-[10px] text-amber-700 font-bold text-left leading-normal">
                💡 Demo Mode: Use OTP passcode <span className="underline select-all text-amber-900 font-black">123456</span> to complete authentication.
              </div>

              <div className="flex items-center border border-gray-200 focus-within:border-gray-400 rounded-sm p-3.5 gap-2.5 transition-colors">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 text-xs text-gray-700 bg-transparent outline-none placeholder-gray-400 font-semibold tracking-widest text-center"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className={`w-full py-3 rounded-xs font-black uppercase text-xs tracking-wider transition-all select-none active:scale-[0.99] border border-transparent ${
                  otp.length === 6 && !loading
                    ? "bg-[#ff3f6c] text-white hover:bg-[#e02f59] cursor-pointer shadow-3xs"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div className="text-left border-b border-gray-100 pb-2">
                <h2 className="text-[#282c3f] text-base font-black tracking-wide">Complete Profile</h2>
                <p className="text-gray-400 text-[10px] mt-0.5">Please provide registration details</p>
              </div>

              <div className="flex flex-col text-left gap-1.5 w-full">
                <label className="text-[9.5px] text-gray-500 font-extrabold uppercase tracking-widest pl-0.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sharon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-200 focus:border-[#ff3f6c] outline-none px-3 py-2 text-xs text-gray-700 transition-colors rounded-sm"
                  disabled={loading}
                />
                <span className="text-[9px] text-gray-400 mt-0.5">This is what friends will use to invite you to boards.</span>
              </div>

              <div className="flex flex-col text-left gap-1">
                <label className="text-[9.5px] text-gray-500 font-extrabold uppercase tracking-widest pl-0.5">Username</label>
                <input
                  type="text"
                  placeholder="e.g. sharon_j"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                  className="border border-gray-200 focus:border-[#ff3f6c] outline-none px-3 py-2 text-xs text-gray-700 transition-colors rounded-sm"
                  disabled={loading}
                />
                <span className="text-[9px] text-gray-400 mt-0.5">This is what friends will use to invite you to boards.</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 w-full">
                <div className="flex flex-col text-left gap-1.5 w-full">
                  <label className="text-[9.5px] text-gray-500 font-extrabold uppercase tracking-widest pl-0.5">Age</label>
                  <input
                    type="number"
                    placeholder="23"
                    min="1"
                    max="122"
                    value={age}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") { setAge(""); return; }
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 1 && num <= 122) setAge(String(num));
                    }}
                    className="w-full border border-gray-200 focus:border-[#ff3f6c] outline-none px-3 py-2 text-xs text-gray-700 transition-colors rounded-sm"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col text-left gap-1.5 w-full relative">
                  <label className="text-[9.5px] text-gray-500 font-extrabold uppercase tracking-widest pl-0.5">City</label>
                  <div 
                    onClick={() => !loading && setShowCityDropdown(!showCityDropdown)}
                    className="w-full border border-gray-200 focus:border-[#ff3f6c] outline-none px-3 py-2 text-xs text-gray-700 bg-white transition-colors rounded-sm font-semibold cursor-pointer h-[32px] flex items-center justify-between select-none"
                  >
                    <span className={city ? "text-gray-700" : "text-gray-400"}>
                      {city || "Select City*"}
                    </span>
                    <span className="text-gray-400 text-[8px] transition-transform duration-200" style={{ transform: showCityDropdown ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>

                  {showCityDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowCityDropdown(false)}
                      />
                      <div className="absolute bottom-[34px] left-0 right-0 bg-white border border-gray-200 rounded-sm shadow-md max-h-[160px] overflow-y-auto z-50 py-1.5 text-xs text-gray-700">
                        {citiesList.map((c) => (
                          <div
                            key={c}
                            onClick={() => {
                              setCity(c);
                              setShowCityDropdown(false);
                            }}
                            className={`px-3 py-2 cursor-pointer transition-colors hover:bg-pink-50 hover:text-[#ff3f6c] font-semibold text-left ${city === c ? "text-[#ff3f6c] bg-pink-50/50" : ""}`}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!name || !age || !city || !username || loading}
                className={`w-full py-3 rounded-xs font-black uppercase text-xs tracking-wider transition-all select-none active:scale-[0.99] border border-transparent ${
                  name && age && city && username && !loading
                    ? "bg-[#ff3f6c] text-white hover:bg-[#e02f59] cursor-pointer shadow-3xs"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Registering..." : "Enter Myntra"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}