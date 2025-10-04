// import React, { useState, useEffect } from "react";
// import { Eye, EyeOff, Mail, Lock, User, MapPin, Loader } from "lucide-react";

// const AdminSignup = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     country: "",
//     currency: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [countries, setCountries] = useState([]);
//   const [isLoadingCountries, setIsLoadingCountries] = useState(true);
//   const [countryError, setCountryError] = useState("");

//   // Fetch countries from API on component mount
//   useEffect(() => {
//     const fetchCountries = async () => {
//       try {
//         setIsLoadingCountries(true);
//         const response = await fetch(
//           "https://restcountries.com/v3.1/all?fields=name,currencies"
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch countries");
//         }

//         const data = await response.json();

//         // Transform API data to a more usable format
//         const formattedCountries = data
//           .map((country) => {
//             const countryName = country.name?.common || "Unknown Country";
//             const currencyCode = Object.keys(country.currencies || {})[0];
//             const currencyInfo = currencyCode
//               ? country.currencies[currencyCode]
//               : null;

//             if (!currencyCode || !currencyInfo) {
//               return null; // Skip countries without currency info
//             }

//             return {
//               name: countryName,
//               code: country.cca2 || currencyCode,
//               currency: currencyCode,
//               currencyName: currencyInfo.name,
//               symbol: currencyInfo.symbol || currencyCode,
//             };
//           })
//           .filter((country) => country !== null)
//           .sort((a, b) => a.name.localeCompare(b.name));

//         setCountries(formattedCountries);
//       } catch (error) {
//         console.error("Error fetching countries:", error);
//         setCountryError("Failed to load countries. Please try again.");

//         // Fallback to some common countries
//         setCountries([
//           {
//             name: "United States",
//             code: "US",
//             currency: "USD",
//             currencyName: "US Dollar",
//             symbol: "$",
//           },
//           {
//             name: "United Kingdom",
//             code: "GB",
//             currency: "GBP",
//             currencyName: "British Pound",
//             symbol: "£",
//           },
//           {
//             name: "European Union",
//             code: "EU",
//             currency: "EUR",
//             currencyName: "Euro",
//             symbol: "€",
//           },
//           {
//             name: "Japan",
//             code: "JP",
//             currency: "JPY",
//             currencyName: "Japanese Yen",
//             symbol: "¥",
//           },
//           {
//             name: "Canada",
//             code: "CA",
//             currency: "CAD",
//             currencyName: "Canadian Dollar",
//             symbol: "CA$",
//           },
//         ]);
//       } finally {
//         setIsLoadingCountries(false);
//       }
//     };

//     fetchCountries();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // If country changes, set the currency automatically
//     if (name === "country") {
//       const selectedCountry = countries.find((c) => c.code === value);
//       if (selectedCountry) {
//         setFormData((prev) => ({
//           ...prev,
//           currency: selectedCountry.currency,
//         }));
//       }
//     }

//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Company name is required";
//     } else if (formData.name.trim().length < 2) {
//       newErrors.name = "Company name must be at least 2 characters";
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = "Please confirm your password";
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }

//     if (!formData.country) {
//       newErrors.country = "Please select a country";
//     }

//     if (!formData.currency) {
//       newErrors.currency = "Currency is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Test currency conversion API (for verification)
//   // const testCurrencyConversion = async (baseCurrency) => {
//   //   try {
//   //     const response = await fetch(
//   //       `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
//   //     );
//   //     if (!response.ok) {
//   //       throw new Error("Currency API not available");
//   //     }
//   //     const data = await response.json();
//   //     return data.rates ? true : false;
//   //   } catch (error) {
//   //     console.warn("Currency conversion API test failed:", error);
//   //     return false; // API might be down, but we can still proceed
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       // Verify currency conversion API is working
//       // const currencyApiAvailable = await testCurrencyConversion(
//       //   formData.currency
//       // );

//       // if (!currencyApiAvailable) {
//       //   console.warn(
//       //     "Currency conversion API is not available, but proceeding with signup..."
//       //   );
//       // }

//       // Prepare signup data
//       const signupData = {
//         name: formData.name.trim(),
//         country: formData.country,
//         basecurrency: formData.currency,
//         email: formData.email.trim(),
//         password: formData.password,
//       };

//       // Make API call to create company and admin user
//       const response = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(signupData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to create account");
//       }

//       const result = await response.json();

//       // Success - redirect to dashboard or show success message
//       console.log("Company created successfully:", result);
//       alert(
//         `Company "${formData.name}" created successfully! You can now login.`
//       );

//       // Reset form
//       setFormData({
//         name: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         country: "",
//         currency: "",
//       });
//     } catch (error) {
//       console.error("Signup error:", error);
//       setErrors({
//         submit: error.message || "Failed to create account. Please try again.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getSelectedCountry = () => {
//     return countries.find((country) => country.code === formData.country);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
//           <h1 className="text-2xl font-bold text-white mb-2">
//             Create Your Company
//           </h1>
//           <p className="text-blue-100 text-sm">
//             Setup your expense management system
//           </p>
//         </div>

//         {/* Form */}
//         <div className="p-6">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Company Name */}
//             <div>
//               <label
//                 htmlFor="name"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Company Name
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Benerous Magpie"
//                   className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.name ? "border-red-300" : "border-gray-300"
//                   }`}
//                 />
//               </div>
//               {errors.name && (
//                 <p className="mt-1 text-sm text-red-600">{errors.name}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="your@company.com"
//                   className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.email ? "border-red-300" : "border-gray-300"
//                   }`}
//                 />
//               </div>
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="••••••"
//                   className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.password ? "border-red-300" : "border-gray-300"
//                   }`}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label
//                 htmlFor="confirmPassword"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type={showConfirmPassword ? "text" : "password"}
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   placeholder="••••••"
//                   className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.confirmPassword
//                       ? "border-red-300"
//                       : "border-gray-300"
//                   }`}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//               {errors.confirmPassword && (
//                 <p className="mt-1 text-sm text-red-600">
//                   {errors.confirmPassword}
//                 </p>
//               )}
//             </div>

//             {/* Country Selection */}
//             <div>
//               <label
//                 htmlFor="country"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Country
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <MapPin className="h-5 w-5 text-gray-400" />
//                 </div>
//                 {isLoadingCountries ? (
//                   <div className="flex items-center justify-center w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
//                     <Loader className="h-5 w-5 text-gray-400 animate-spin mr-2" />
//                     <span className="text-gray-500">Loading countries...</span>
//                   </div>
//                 ) : (
//                   <select
//                     id="country"
//                     name="country"
//                     value={formData.country}
//                     onChange={handleChange}
//                     className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
//                       errors.country ? "border-red-300" : "border-gray-300"
//                     }`}
//                   >
//                     <option value="">Select a country</option>
//                     {countries.map((country) => (
//                       <option key={country.code} value={country.code}>
//                         {country.name}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//                 {!isLoadingCountries && (
//                   <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
//                     <svg
//                       className="h-5 w-5 text-gray-400"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </div>
//                 )}
//               </div>
//               {errors.country && (
//                 <p className="mt-1 text-sm text-red-600">{errors.country}</p>
//               )}
//               {countryError && (
//                 <p className="mt-1 text-sm text-yellow-600">{countryError}</p>
//               )}
//             </div>

//             {/* Currency Display (Auto-selected based on country) */}
//             {formData.country && (
//               <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-blue-900">
//                     Base Currency:
//                   </span>
//                   <span className="text-lg font-bold text-blue-700">
//                     {getSelectedCountry()?.currency} (
//                     {getSelectedCountry()?.currencyName})
//                   </span>
//                 </div>
//                 <p className="text-xs text-blue-600 mt-1">
//                   This will be your company's default currency for expense
//                   management.
//                 </p>
//                 <input
//                   type="hidden"
//                   name="currency"
//                   value={formData.currency}
//                 />
//               </div>
//             )}

//             {/* Submit Error */}
//             {errors.submit && (
//               <div className="rounded-md bg-red-50 p-4">
//                 <p className="text-sm text-red-800">{errors.submit}</p>
//               </div>
//             )}

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isLoading || isLoadingCountries}
//               className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center">
//                   <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
//                   Creating Company...
//                 </div>
//               ) : (
//                 "Create Company"
//               )}
//             </button>
//           </form>

//           {/* Login Link */}
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{" "}
//               <a
//                 href="/login"
//                 className="font-medium text-blue-600 hover:text-blue-500"
//               >
//                 Sign in
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminSignup;
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Loader, Building } from "lucide-react";

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
    country: "",
    companyname: "",
    currency: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [countryError, setCountryError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch countries with currency information
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,currencies,cca2"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }

        const data = await response.json();

        // Transform API data to include currency information
        const formattedCountries = data
          .map((country) => {
            const countryName = country.name?.common || "Unknown Country";
            const currencyCode = Object.keys(country.currencies || {})[0];
            const currencyInfo = currencyCode
              ? country.currencies[currencyCode]
              : null;

            if (!currencyCode || !currencyInfo) {
              return null; // Skip countries without currency info
            }

            return {
              name: countryName,
              code: country.cca2,
              currency: currencyCode,
              currencyName: currencyInfo.name,
              symbol: currencyInfo.symbol || currencyCode,
            };
          })
          .filter((country) => country !== null)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountryError("Failed to load countries. Please try again.");

        // Fallback to some common countries
        setCountries([
          {
            name: "United States",
            code: "US",
            currency: "USD",
            currencyName: "US Dollar",
            symbol: "$",
          },
          {
            name: "United Kingdom",
            code: "GB",
            currency: "GBP",
            currencyName: "British Pound",
            symbol: "£",
          },
          {
            name: "European Union",
            code: "EU",
            currency: "EUR",
            currencyName: "Euro",
            symbol: "€",
          },
          {
            name: "Japan",
            code: "JP",
            currency: "JPY",
            currencyName: "Japanese Yen",
            symbol: "¥",
          },
          {
            name: "Canada",
            code: "CA",
            currency: "CAD",
            currencyName: "Canadian Dollar",
            symbol: "CA$",
          },
        ]);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If country changes, set the currency automatically
    if (name === "country") {
      const selectedCountry = countries.find((c) => c.code === value);
      if (selectedCountry) {
        setFormData((prev) => ({
          ...prev,
          currency: selectedCountry.currency,
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear success message when form changes
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmpassword) {
      newErrors.confirmpassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match";
    }

    if (!formData.country) {
      newErrors.country = "Please select a country";
    }

    if (!formData.companyname.trim()) {
      newErrors.companyname = "Company name is required";
    } else if (formData.companyname.trim().length < 2) {
      newErrors.companyname = "Company name must be at least 2 characters";
    }

    if (!formData.currency) {
      newErrors.currency = "Currency is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage("");

    try {
      // Prepare signup data according to the API structure
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmpassword: formData.confirmpassword,
        country: formData.country,
        companyname: formData.companyname.trim(),
        currency: formData.currency,
      };

      // Make API call to signup
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create account");
      }

      // Success - show success message
      console.log("User and company created successfully:", result);
      setSuccessMessage(result.message || "User registered successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
        country: "",
        companyname: "",
        currency: "",
      });
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        submit: error.message || "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedCountry = () => {
    return countries.find((country) => country.code === formData.country);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Create Company & Admin Account
          </h1>
          <p className="text-blue-100 text-sm">
            Setup your company and first administrator account
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@company.com"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmpassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmpassword"
                  name="confirmpassword"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  placeholder="••••••"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmpassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmpassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmpassword}
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label
                htmlFor="companyname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="companyname"
                  name="companyname"
                  value={formData.companyname}
                  onChange={handleChange}
                  placeholder="Your Company Inc."
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.companyname ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.companyname && (
                <p className="mt-1 text-sm text-red-600">{errors.companyname}</p>
              )}
            </div>

            {/* Country Selection */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                {isLoadingCountries ? (
                  <div className="flex items-center justify-center w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Loader className="h-5 w-5 text-gray-400 animate-spin mr-2" />
                    <span className="text-gray-500">Loading countries...</span>
                  </div>
                ) : (
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                      errors.country ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                )}
                {!isLoadingCountries && (
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
              {countryError && (
                <p className="mt-1 text-sm text-yellow-600">{countryError}</p>
              )}
            </div>

            {/* Currency Display (Auto-selected based on country) */}
            {formData.country && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    Base Currency:
                  </span>
                  <span className="text-lg font-bold text-blue-700">
                    {getSelectedCountry()?.currency} (
                    {getSelectedCountry()?.currencyName})
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This will be your company's default currency for expense management.
                </p>
                <input
                  type="hidden"
                  name="currency"
                  value={formData.currency}
                />
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800 font-medium">{successMessage}</p>
                <p className="text-xs text-green-700 mt-1">
                  You can now login with your credentials.
                </p>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isLoadingCountries}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Creating Account...
                </div>
              ) : (
                "Create Company & Admin Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;