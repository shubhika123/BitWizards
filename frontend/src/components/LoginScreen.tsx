// components/LoginScreen.tsx
"use client";

import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const {
    checkPhoneExists,
    sendOTP,
    verifyOTP,
    registerPhoneUser,
    loading,
    isMock
  } = useAuthStore();

  const [step, setStep] = useState<"PHONE" | "OTP" | "REGISTER" | "VERIFY_REGISTRATION">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
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
      const exists = await checkPhoneExists(phone);
      if (exists) {
        await sendOTP(phone);
        setStep("OTP");
      } else {
        setStep("REGISTER");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check phone number.");
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

    if (!name || !age || !city) {
      setError("Please fill out Name, Age, and City fields.");
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0) {
      setError("Please enter a valid age.");
      return;
    }

    try {
      await sendOTP(phone);
      setStep("VERIFY_REGISTRATION");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    }
  };

  const handleVerifyRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP code.");
      return;
    }

    try {
      // The OTP is verified, but since they don't exist yet, it returns false.
      // We don't care about the return value, just that it doesn't throw an error.
      await verifyOTP(phone, otp);
      
      const ageNum = parseInt(age);
      await registerPhoneUser(phone, name, ageNum, city);
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
    }
  };

  const isPhoneValid = phone.length === 10 && agreeTerms;

  return (
    <div className="fixed inset-0 bg-white sm:bg-[#f5f5f6] flex flex-col items-center sm:justify-center z-50 select-none overflow-y-auto">

      <div className="bg-white w-full min-h-screen sm:min-h-0 sm:max-w-[400px] sm:shadow-lg sm:rounded-md overflow-hidden flex flex-col relative">

        {/* Top Banner (Replaced as requested) */}
        <div className="relative w-full h-[180px] bg-gradient-to-r from-[#ffe4e6] to-[#fff1f2] flex items-center justify-between px-6 overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-[42%] opacity-95 select-none pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80"
              alt="Myntra Models"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="z-10 flex flex-col gap-1 max-w-[55%] text-left mt-2">
            <div className="bg-white px-2 py-0.5 rounded-sm w-fit text-[9px] font-bold text-gray-500 uppercase tracking-widest shadow-sm">
              Limited Offer
            </div>
            <h3 className="text-[#ff3f6c] text-[22px] font-black leading-tight tracking-tight mt-1">
              FLAT ₹300 OFF
            </h3>
            <p className="text-gray-600 text-[10px] font-bold leading-snug tracking-wide">
              ON YOUR 1ST ORDER + EXCITING OFFERS*
            </p>
            <div className="mt-3 flex items-center bg-white border border-dashed border-[#ff3f6c] px-2.5 py-1 w-fit rounded-sm select-all">
              <span className="text-[9px] font-bold text-gray-500 uppercase mr-1.5">CODE:</span>
              <span className="text-[10px] font-black text-[#ff3f6c] tracking-widest uppercase">MYNTRA300</span>
            </div>
          </div>
        </div>

        <div className="px-8 flex flex-col flex-1 justify-center py-10 pb-16 sm:py-8">

          {error && (
            <div className="bg-red-50 border border-red-150 p-2.5 text-[11px] text-red-600 font-bold leading-normal text-left mb-4 rounded-sm">
              {error}
            </div>
          )}

          {step === "PHONE" && (
            <form onSubmit={handlePhoneSubmit} className="flex flex-col">
              <div className="text-left select-none mb-8">
                <h2 className="text-[#282c3f] text-[20px] tracking-wide">
                  <span className="font-bold">Login</span> <span className="text-[15px] font-normal text-gray-400">or</span> <span className="font-bold">Signup</span>
                </h2>
              </div>

              <div className="relative mb-6">
                {/* Floating Label */}
                <div className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
                  Mobile Number<span className="text-[#ff3f6c]">*</span>
                </div>
                
                <div className="flex items-center border border-gray-300 rounded-[2px] p-3 focus-within:border-gray-800 transition-colors">
                  <span className="text-[14px] text-gray-600 font-medium ml-1">+91</span>
                  <span className="text-gray-300 mx-2 text-[14px]">|</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 text-[14px] text-gray-800 bg-transparent outline-none font-medium"
                    disabled={loading}
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 text-[11px] text-gray-500 leading-snug cursor-pointer select-none text-left">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-[14px] h-[14px] accent-[#ff3f6c] cursor-pointer rounded-sm border-gray-300 shrink-0"
                  disabled={loading}
                />
                <span className="pt-[1px]">
                  By continuing, I agree to the{" "}
                  <span className="text-[#ff3f6c] font-bold cursor-pointer hover:underline">Terms of Use</span> &{" "}
                  <span className="text-[#ff3f6c] font-bold cursor-pointer hover:underline">Privacy Policy</span> and I am above 18 years old.
                </span>
              </label>

              <button
                type="submit"
                disabled={!isPhoneValid || loading}
                className={`w-full py-3.5 mt-8 rounded-[2px] font-bold uppercase text-[13px] tracking-wide transition-all select-none ${
                  isPhoneValid && !loading
                    ? "bg-[#ff3f6c] text-white hover:bg-[#e02f59]"
                    : "bg-[#bec2c6] text-white cursor-not-allowed"
                }`}
              >
                {loading ? "Please wait..." : "CONTINUE"}
              </button>

              <div className="text-[12px] text-gray-600 mt-8 mb-4 text-left">
                Have trouble logging in?{" "}
                <span className="text-[#ff3f6c] font-bold cursor-pointer hover:underline">Get help</span>
              </div>
            </form>
          )}

          {step === "OTP" && (
            <form onSubmit={handleOtpSubmit} className="flex flex-col">
              <div className="text-left mb-8">
                <h2 className="text-[#282c3f] text-[20px] font-bold tracking-wide">Verify with OTP</h2>
                <p className="text-gray-500 text-[12px] mt-1 font-medium">
                  Sent to +91 {phone}
                  <span
                    onClick={() => { setStep("PHONE"); setOtp(""); }}
                    className="text-[#ff3f6c] cursor-pointer font-bold ml-2 hover:underline"
                  >
                    Edit
                  </span>
                </p>
              </div>

              <div className="flex items-center border border-gray-300 rounded-[2px] p-3 focus-within:border-gray-800 transition-colors mb-6">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 text-[15px] text-gray-800 bg-transparent outline-none placeholder-gray-400 font-semibold tracking-widest text-center"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className={`w-full py-3.5 rounded-[2px] font-bold uppercase text-[13px] tracking-wide transition-all select-none ${
                  otp.length === 6 && !loading
                    ? "bg-[#ff3f6c] text-white hover:bg-[#e02f59]"
                    : "bg-[#bec2c6] text-white cursor-not-allowed"
                }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col">
              <div className="text-left border-b border-gray-100 pb-3 mb-6">
                <h2 className="text-[#282c3f] text-[20px] font-bold tracking-wide">Complete Profile</h2>
                <p className="text-gray-500 text-[12px] mt-1">Please provide registration details</p>
              </div>

              <div className="flex flex-col text-left gap-1.5 w-full mb-4">
                <label className="text-[11px] text-gray-500 font-bold uppercase tracking-widest pl-0.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sharon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 focus:border-gray-800 outline-none px-3 py-2.5 text-[14px] text-gray-800 transition-colors rounded-[2px]"
                  disabled={loading}
                />
              </div>



              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <div className="flex flex-col text-left gap-1.5 w-full">
                  <label className="text-[11px] text-gray-500 font-bold uppercase tracking-widest pl-0.5">Age</label>
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
                    className="w-full border border-gray-300 focus:border-gray-800 outline-none px-3 py-2.5 text-[14px] text-gray-800 transition-colors rounded-[2px]"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col text-left gap-1.5 w-full relative">
                  <label className="text-[11px] text-gray-500 font-bold uppercase tracking-widest pl-0.5">City</label>
                  <div 
                    onClick={() => !loading && setShowCityDropdown(!showCityDropdown)}
                    className="w-full border border-gray-300 focus:border-gray-800 outline-none px-3 py-2.5 text-[14px] text-gray-800 bg-white transition-colors rounded-[2px] font-medium cursor-pointer h-[43px] flex items-center justify-between select-none"
                  >
                    <span className={city ? "text-gray-800" : "text-gray-400"}>
                      {city || "Select City"}
                    </span>
                    <span className="text-gray-400 text-[10px] transition-transform duration-200" style={{ transform: showCityDropdown ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>

                  {showCityDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowCityDropdown(false)}
                      />
                      <div className="absolute bottom-[46px] left-0 right-0 bg-white border border-gray-200 rounded-sm shadow-md max-h-[160px] overflow-y-auto z-50 py-1.5 text-[13px] text-gray-800">
                        {citiesList.map((c) => (
                          <div
                            key={c}
                            onClick={() => {
                              setCity(c);
                              setShowCityDropdown(false);
                            }}
                            className={`px-3 py-2 cursor-pointer transition-colors hover:bg-pink-50 hover:text-[#ff3f6c] text-left ${city === c ? "text-[#ff3f6c] bg-pink-50/50 font-bold" : "font-medium"}`}
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
                disabled={!name || !age || !city || loading}
                className={`w-full py-3.5 mt-auto rounded-[2px] font-bold uppercase text-[13px] tracking-wide transition-all select-none ${
                  name && age && city && !loading
                    ? "bg-[#ff3f6c] text-white hover:bg-[#e02f59]"
                    : "bg-[#bec2c6] text-white cursor-not-allowed"
                }`}
              >
                {loading ? "Please wait..." : "Continue to Verification"}
              </button>
            </form>
          )}

          {step === "VERIFY_REGISTRATION" && (
            <form onSubmit={handleVerifyRegistrationSubmit} className="flex flex-col">
              <div className="text-left mb-8">
                <h2 className="text-[#282c3f] text-[20px] font-bold tracking-wide">Verify & Register</h2>
                <p className="text-gray-500 text-[12px] mt-1 font-medium">
                  Sent to +91 {phone}
                  <span
                    onClick={() => { setStep("REGISTER"); setOtp(""); }}
                    className="text-[#ff3f6c] cursor-pointer font-bold ml-2 hover:underline"
                  >
                    Back
                  </span>
                </p>
              </div>

              <div className="flex items-center border border-gray-300 rounded-[2px] p-3 focus-within:border-gray-800 transition-colors mb-6">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 text-[15px] text-gray-800 bg-transparent outline-none placeholder-gray-400 font-semibold tracking-widest text-center"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className={`w-full py-3.5 rounded-[2px] font-bold uppercase text-[13px] tracking-wide transition-all select-none ${
                  otp.length === 6 && !loading
                    ? "bg-[#ff3f6c] text-white hover:bg-[#e02f59]"
                    : "bg-[#bec2c6] text-white cursor-not-allowed"
                }`}
              >
                {loading ? "Registering..." : "Verify OTP & Enter Myntra"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}