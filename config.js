// Euro Wallet settings
window.EURO_CONFIG = {
  // Paste your Google Apps Script Web App URL between the quotes (see README step 1)
  syncUrl: "https://script.google.com/macros/s/AKfycbyM4PrLzLIAmVzR9jvtFb_vSH2JB3fmxdrH8ibAkR-9N3RlYGoPrnoT0bb3GDOjVioB/exec",

  // Scanning window of each activity: its code works only on its own date, between "from" and "to".
  // m = Mass (Friday), s = Service (Friday), c = Class (Friday), t = Tasbeha (Thursday)
  hours: {
    m: { from: "07:45", to: "10:30" },
    s: { from: "10:00", to: "10:15" },
    c: { from: "11:00", to: "11:30" },
    t: { from: "19:00", to: "19:30" }
  },

  // Default language: "ar" or "en"
  lang: "ar",

  // Public key used to check that QR codes are genuine. Do not change.
  publicKey: {"kty":"EC","crv":"P-256","x":"AZ2Mtvry_rRditx8jOabdNmyWRtFSp4nH8-ZI9yg2js","y":"kDkR06IwzlndVDl4NdaibJW1q7xCUVeLUCNAbRRR-Dg"}
};
