import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { cleanPhoneDigits } from '../../utils/formatters.js';

export const PublicBookingService = {
  /**
   * Submit an online appointment booking from public website
   */
  async createBooking({ customerName, mobileNumber, bikeName, registrationNumber, serviceType, preferredDate, notes }) {
    if (!customerName || !customerName.trim()) {
      throw new Error('Customer name is required.');
    }
    const cleanMobile = cleanPhoneDigits(mobileNumber);
    if (!cleanMobile || cleanMobile.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }
    if (!bikeName || !bikeName.trim()) {
      throw new Error('Bike name/model is required.');
    }

    const bookingData = {
      customerName: customerName.trim(),
      mobileNumber: cleanMobile,
      bikeName: bikeName.trim(),
      registrationNumber: registrationNumber ? registrationNumber.trim().toUpperCase() : '',
      serviceType: serviceType || 'FULL_SERVICE',
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      notes: notes ? notes.trim() : '',
      status: 'PENDING_CONFIRMATION',
      source: 'WEBSITE_BOOKING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    return { id: docRef.id, ...bookingData };
  },

  /**
   * Track vehicle repair status by Bike Number or Mobile Number
   */
  async trackVehicleStatus(searchQuery) {
    if (!searchQuery || !searchQuery.trim()) {
      throw new Error('Please enter your Bike Number or 10-digit Mobile Number.');
    }

    const raw = searchQuery.trim();
    const cleanDigits = cleanPhoneDigits(raw);
    const cleanReg = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Query jobs collection
    const jobsRef = collection(db, 'jobs');
    const querySnap = await getDocs(jobsRef);
    const allJobs = [];

    querySnap.forEach((doc) => {
      allJobs.push({ id: doc.id, ...doc.data() });
    });

    // Find matches
    const matches = allJobs.filter((job) => {
      const jobReg = (job.registrationNumberSnapshot || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const jobPhone = cleanPhoneDigits(job.mobileNumberSnapshot || '');
      const jobCustName = (job.customerNameSnapshot || '').toLowerCase();

      if (cleanReg.length >= 4 && jobReg.includes(cleanReg)) return true;
      if (cleanDigits.length === 10 && jobPhone === cleanDigits) return true;
      if (raw.length >= 3 && jobCustName.includes(raw.toLowerCase())) return true;
      return false;
    });

    // Sort by latest created date
    matches.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (matches.length === 0) {
      // Check if there is any pending booking
      const bookingsRef = collection(db, 'bookings');
      const bookSnap = await getDocs(bookingsRef);
      const allBookings = [];
      bookSnap.forEach((d) => allBookings.push({ id: d.id, ...d.data() }));

      const bookingMatch = allBookings.find((b) => {
        const bPhone = cleanPhoneDigits(b.mobileNumber || '');
        const bReg = (b.registrationNumber || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return (cleanDigits.length === 10 && bPhone === cleanDigits) || (cleanReg.length >= 4 && bReg.includes(cleanReg));
      });

      if (bookingMatch) {
        return {
          found: true,
          isBooking: true,
          booking: bookingMatch,
          status: bookingMatch.status,
          message: 'Appointment booking received. Garage will confirm your slot shortly.',
        };
      }

      return {
        found: false,
        message: 'No active service job or booking found with these details. Please verify your Bike Number or Phone Number.',
      };
    }

    const latestJob = matches[0];
    return {
      found: true,
      job: latestJob,
      status: latestJob.status,
      history: matches,
    };
  },
};
